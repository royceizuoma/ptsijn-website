import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const inputFile = process.argv[2];
const outDir = process.argv[3] || "outputs/migration-data";

if (!inputFile) {
  console.error("Usage: node scripts/extract-wxr.mjs <wordpress-export.xml> [output-dir]");
  process.exit(1);
}

const xml = readFileSync(inputFile, "utf8");

function between(source, startTag, endTag) {
  const start = source.indexOf(startTag);
  if (start === -1) return "";
  const end = source.indexOf(endTag, start + startTag.length);
  if (end === -1) return "";
  return source.slice(start + startTag.length, end);
}

function clean(value = "") {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function tag(block, name) {
  return clean(between(block, `<${name}>`, `</${name}>`));
}

function matches(regex, source) {
  return [...source.matchAll(regex)].map((match) => match[1] ?? match[0]);
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeJson(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, data, "utf8");
}

function slugify(value) {
  return (
    clean(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}

function itemToPostmeta(block) {
  return matches(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g, block).map((meta) => ({
    key: tag(meta, "wp:meta_key"),
    value: tag(meta, "wp:meta_value")
  }));
}

function metaValue(item, key) {
  return item.postmeta.find((meta) => meta.key === key)?.value || "";
}

function extractItems(channel) {
  return matches(/<item>([\s\S]*?)<\/item>/g, channel).map((block) => {
    const contentHtml = tag(block, "content:encoded");
    const excerptHtml = tag(block, "excerpt:encoded");
    const attachmentUrl = tag(block, "wp:attachment_url");
    const mediaReferences = [
      ...new Set([
        ...matches(/https?:\/\/ptsijn\.org\/wp-content\/uploads\/[^"'\s<>)]+/g, contentHtml),
        ...matches(/https?:\/\/ptsijn\.org\/wp-content\/uploads\/[^"'\s<>)]+/g, excerptHtml),
        ...(attachmentUrl ? [attachmentUrl] : [])
      ])
    ];
    const youtubeReferences = [
      ...new Set(matches(/https?:\/\/www\.youtube\.com\/embed\/[^"'\s<>)]+/g, contentHtml))
    ];
    const categories = [
      ...block.matchAll(/<category domain="([^"]*)" nicename="([^"]*)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)
    ].map(([, domain, nicename, label]) => ({
      domain,
      nicename,
      label: clean(label)
    }));

    return {
      id: tag(block, "wp:post_id"),
      title: tag(block, "title"),
      link: tag(block, "link"),
      slug: tag(block, "wp:post_name"),
      type: tag(block, "wp:post_type"),
      status: tag(block, "wp:status"),
      author: tag(block, "dc:creator"),
      date: tag(block, "wp:post_date"),
      dateGmt: tag(block, "wp:post_date_gmt"),
      modified: tag(block, "wp:post_modified"),
      modifiedGmt: tag(block, "wp:post_modified_gmt"),
      parent: tag(block, "wp:post_parent"),
      menuOrder: tag(block, "wp:menu_order"),
      contentHtml,
      excerptHtml,
      attachmentUrl,
      categories,
      postmeta: itemToPostmeta(block),
      mediaReferences,
      youtubeReferences,
      flags: {
        hasGallery: /wp-block-gallery|wp-block-image|gallery/i.test(contentHtml),
        hasIframe: /<iframe/i.test(contentHtml),
        hasShortcode: /\[[a-zA-Z0-9_-]+/.test(contentHtml),
        hasContactForm: /contact-form-7/i.test(contentHtml),
        hasDonationForm: /donation|cmsmasters_donations/i.test(contentHtml),
        hasWooCommerce: /woocommerce/i.test(contentHtml)
      }
    };
  });
}

function extractTaxonomies(channel) {
  const categories = matches(/<wp:category>([\s\S]*?)<\/wp:category>/g, channel).map((block) => ({
    taxonomy: "category",
    id: tag(block, "wp:term_id"),
    slug: tag(block, "wp:category_nicename"),
    name: tag(block, "wp:cat_name"),
    parent: tag(block, "wp:category_parent")
  }));

  const terms = matches(/<wp:term>([\s\S]*?)<\/wp:term>/g, channel).map((block) => ({
    taxonomy: tag(block, "wp:term_taxonomy"),
    id: tag(block, "wp:term_id"),
    slug: tag(block, "wp:term_slug"),
    name: tag(block, "wp:term_name"),
    parent: tag(block, "wp:term_parent")
  }));

  return [...categories, ...terms];
}

const channel = between(xml, "<channel>", "</channel>");
const items = extractItems(channel);
const taxonomies = extractTaxonomies(channel);

const counts = items.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] || 0) + 1;
  return acc;
}, {});

const menuItems = items
  .filter((item) => item.type === "nav_menu_item")
  .map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    parentMenuItemId: metaValue(item, "_menu_item_menu_item_parent"),
    objectId: metaValue(item, "_menu_item_object_id"),
    object: metaValue(item, "_menu_item_object"),
    type: metaValue(item, "_menu_item_type"),
    url: metaValue(item, "_menu_item_url"),
    classes: metaValue(item, "_menu_item_classes"),
    menuTerms: item.categories.filter((category) => category.domain === "nav_menu"),
    raw: item
  }));

const media = items
  .filter((item) => item.type === "attachment")
  .map((item) => ({
    id: item.id,
    title: item.title,
    url: item.attachmentUrl,
    originalLink: item.link,
    date: item.date,
    modified: item.modified,
    parent: item.parent,
    mimeType: metaValue(item, "_wp_attached_file").split(".").pop() || "",
    attachedFile: metaValue(item, "_wp_attached_file"),
    metadata: metaValue(item, "_wp_attachment_metadata")
  }));

const redirectRows = items
  .filter((item) => item.link && item.status === "publish")
  .map((item) => {
    const newPathByType = {
      page: item.slug === "home" ? "/" : `/${item.slug}/`,
      post: `/blog/${item.slug}/`,
      campaign: `/donate/campaigns/${item.slug}/`,
      profile: `/about/leadership/${item.slug}/`,
      product: `/shop/${item.slug}/`
    };
    return {
      oldUrl: item.link,
      newPath: newPathByType[item.type] || `/legacy/${item.type}/${item.slug || item.id}/`,
      type: item.type,
      title: item.title
    };
  });

const publicItems = items.filter((item) => item.type !== "donation");
const privateDonationItems = items.filter((item) => item.type === "donation");

ensureDir(outDir);
writeJson(join(outDir, "manifest.json"), {
  generatedAt: new Date().toISOString(),
  sourceFile: inputFile,
  site: {
    title: tag(channel, "title"),
    link: tag(channel, "link"),
    description: tag(channel, "description"),
    wxrVersion: tag(channel, "wp:wxr_version"),
    baseSiteUrl: tag(channel, "wp:base_site_url"),
    baseBlogUrl: tag(channel, "wp:base_blog_url")
  },
  counts,
  totalItems: items.length,
  publicItems: publicItems.length,
  privateDonationItems: privateDonationItems.length
});
writeJson(join(outDir, "all-public-content.json"), publicItems);
writeJson(join(outDir, "pages.json"), items.filter((item) => item.type === "page"));
writeJson(join(outDir, "posts.json"), items.filter((item) => item.type === "post"));
writeJson(join(outDir, "campaigns.json"), items.filter((item) => item.type === "campaign"));
writeJson(join(outDir, "profiles.json"), items.filter((item) => item.type === "profile"));
writeJson(join(outDir, "products.json"), items.filter((item) => item.type === "product"));
writeJson(join(outDir, "forms.json"), items.filter((item) => item.type === "wpcf7_contact_form"));
writeJson(join(outDir, "menus.json"), menuItems);
writeJson(join(outDir, "media.json"), media);
writeJson(join(outDir, "taxonomies.json"), taxonomies);
writeJson(join(outDir, "private-donations.json"), privateDonationItems);
writeJson(join(outDir, "media-references.json"), [
  ...new Set(items.flatMap((item) => item.mediaReferences))
]);
writeJson(join(outDir, "youtube-references.json"), [
  ...new Set(items.flatMap((item) => item.youtubeReferences))
]);

writeText(
  join(outDir, "redirects.csv"),
  ["oldUrl,newPath,type,title", ...redirectRows.map((row) =>
    [row.oldUrl, row.newPath, row.type, `"${String(row.title).replaceAll('"', '""')}"`].join(",")
  )].join("\n")
);

for (const item of publicItems.filter((entry) => entry.contentHtml)) {
  const filename = `${item.id}-${slugify(item.slug || item.title)}.html`;
  writeText(join(outDir, "raw-html", item.type, filename), item.contentHtml);
}

console.log(`Migration data written to ${outDir}`);
