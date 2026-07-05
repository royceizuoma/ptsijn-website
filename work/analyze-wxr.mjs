import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
const outputFile = process.argv[3];
const xml = readFileSync(file, "utf8");

function textBetween(source, startTag, endTag) {
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
  return clean(textBetween(block, `<${name}>`, `</${name}>`));
}

function allMatches(regex, source) {
  return [...source.matchAll(regex)].map((match) => match[1] ?? match[0]);
}

const channel = textBetween(xml, "<channel>", "</channel>");
const itemBlocks = allMatches(/<item>([\s\S]*?)<\/item>/g, channel);
const categoryBlocks = allMatches(/<wp:category>([\s\S]*?)<\/wp:category>/g, channel);
const termBlocks = allMatches(/<wp:term>([\s\S]*?)<\/wp:term>/g, channel);

const items = itemBlocks.map((block) => {
  const postmeta = allMatches(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g, block).map((meta) => ({
    key: tag(meta, "wp:meta_key"),
    value: tag(meta, "wp:meta_value")
  }));
  const categories = [...block.matchAll(/<category domain="([^"]*)" nicename="([^"]*)"><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map(
    ([, domain, nicename, label]) => ({ domain, nicename, label: clean(label) })
  );
  const content = tag(block, "content:encoded");
  const excerpt = tag(block, "excerpt:encoded");
  const attachmentUrl = tag(block, "wp:attachment_url");
  const mediaRefs = [
    ...new Set([
      ...allMatches(/https?:\/\/ptsijn\.org\/wp-content\/uploads\/[^"'\s<>)]+/g, content),
      ...allMatches(/https?:\/\/ptsijn\.org\/wp-content\/uploads\/[^"'\s<>)]+/g, excerpt),
      ...(attachmentUrl ? [attachmentUrl] : [])
    ])
  ];
  const youtubeRefs = [...new Set(allMatches(/https?:\/\/www\.youtube\.com\/embed\/[^"'\s<>)]+/g, content))];
  return {
    id: tag(block, "wp:post_id"),
    title: tag(block, "title"),
    link: tag(block, "link"),
    slug: tag(block, "wp:post_name"),
    type: tag(block, "wp:post_type"),
    status: tag(block, "wp:status"),
    date: tag(block, "wp:post_date"),
    modified: tag(block, "wp:post_modified"),
    parent: tag(block, "wp:post_parent"),
    menuOrder: tag(block, "wp:menu_order"),
    author: tag(block, "dc:creator"),
    categories,
    postmeta,
    contentLength: content.length,
    excerptLength: excerpt.length,
    mediaRefs,
    youtubeRefs,
    hasFormShortcode: /\[(contact-form-7|cmsmasters_donations|woocommerce|woocommerce_)/i.test(content),
    hasGallery: /wp-block-gallery|<figure class="wp-block-gallery|gallery/i.test(content),
    hasIframe: /<iframe/i.test(content)
  };
});

const taxonomies = [
  ...categoryBlocks.map((block) => ({
    taxonomy: "category",
    id: tag(block, "wp:term_id"),
    slug: tag(block, "wp:category_nicename"),
    name: tag(block, "wp:cat_name"),
    parent: tag(block, "wp:category_parent")
  })),
  ...termBlocks.map((block) => ({
    taxonomy: tag(block, "wp:term_taxonomy"),
    id: tag(block, "wp:term_id"),
    slug: tag(block, "wp:term_slug"),
    name: tag(block, "wp:term_name"),
    parent: tag(block, "wp:term_parent")
  }))
];

const byType = items.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] || 0) + 1;
  return acc;
}, {});

const byStatus = items.reduce((acc, item) => {
  const key = `${item.type}:${item.status}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const summary = {
  site: {
    title: tag(channel, "title"),
    link: tag(channel, "link"),
    description: tag(channel, "description"),
    generated: /generator="([^"]+)"/.exec(xml)?.[1] || ""
  },
  counts: {
    totalItems: items.length,
    byType,
    byStatus,
    taxonomies: taxonomies.reduce((acc, term) => {
      acc[term.taxonomy] = (acc[term.taxonomy] || 0) + 1;
      return acc;
    }, {})
  },
  items: items.map(({ postmeta, ...item }) => ({
    ...item,
    postmetaKeys: [...new Set(postmeta.map((m) => m.key))].filter(Boolean)
  })),
  taxonomies,
  mediaReferences: [...new Set(items.flatMap((item) => item.mediaRefs))],
  youtubeReferences: [...new Set(items.flatMap((item) => item.youtubeRefs))]
};

const output = JSON.stringify(summary, null, 2);
if (outputFile) {
  writeFileSync(outputFile, output, "utf8");
} else {
  console.log(output);
}
