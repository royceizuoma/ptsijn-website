# Manual Review Report

The automated extraction preserves content, metadata, media references, and raw HTML. The following items require human review before final launch.

## 1. Donation Records

The export contains 21 records of type `donation`.

Statuses:

- 12 pending_offline
- 5 pending_payment
- 4 preview

These records include donor-related metadata such as names, email addresses, addresses, ZIP codes, amounts, payment method, recurrence, campaign, and anonymous donation flags.

Action:

- Keep in secure private archive.
- Do not publish.
- Do not put into client-side JavaScript.
- Do not commit to a public repository.
- Decide whether historical donation records need to be imported into a new payment/CRM system.

Generated private file:

- `outputs/migration-data/private-donations.json`

## 2. Draft Legal Pages

The export contains two draft legal pages:

- Privacy Policy
- Refund and Returns Policy

Action:

- Review with the organization before publishing.
- Update for the new website, donation processor, analytics, cookies, email forms, and any shop functionality.
- Preserve original draft content in the migration archive.

## 3. Contact Forms

The export contains two Contact Form 7 forms both titled `Contact form 1`.

Action:

- Compare both forms.
- Preserve field definitions and mail settings.
- Rebuild as modern website forms.
- Test delivery destination before launch.

## 4. Donation Form Behavior

The live/current donation experience depends on a WordPress donations plugin and plugin-specific metadata.

Action:

- Choose the new donation processor.
- Recreate one-time and recurring donation options.
- Preserve campaign choices and suggested donation amounts where present.
- Do not rely on old WordPress plugin shortcodes in the new site.

## 5. Campaign Body Content

The export contains two campaigns:

- 2022 Winter Supplies
- Medical Drive

The live site shows campaign layouts with target amounts, donation progress, and some placeholder/theme-style copy.

Action:

- Preserve campaign content exactly in the archive.
- Confirm whether placeholder text should remain visible or be archived only.
- Confirm target amounts before launch.

## 6. WooCommerce Shop and Products

The export contains WooCommerce pages and 9 products:

- T-Shirt
- Tank-Top
- Eco Bag
- Bag
- Cup
- Zip-case
- Sweatshirt
- Crop Top
- Tank-Top

Action:

- Confirm whether the new ministry website should include a shop.
- If no shop is needed, preserve products in a legacy archive and redirect old product URLs.
- If shop remains, confirm prices, product images, stock behavior, payment processor, shipping, returns, and tax settings.

## 7. Legacy Theme Templates

The export contains 15 `content_template` records from the old theme/composer system.

Action:

- Archive all templates.
- Review only if a page appears incomplete without them.
- Do not directly migrate old layout markup into the new design system unless content is missing elsewhere.

## 8. Menus With Blank Labels

The export contains 19 menu items. Several have blank titles and are likely submenu or theme-generated items.

Action:

- Use the live menu as the primary reference.
- Rebuild navigation manually for clarity.
- Preserve old menu records in `menus.json`.

Recommended new navigation:

- Home
- About
- Ministries
- Outreach
- Events
- Gallery
- Blog
- Donate
- Contact

## 9. Placeholder or Demo Content

Potential demo/legacy content appears in:

- Sample Page
- Home Music
- Shop 2
- Some products
- Some content templates
- Some homepage/footer contact placeholders from the old theme

Action:

- Preserve all content in migration data.
- Do not place likely demo content in primary navigation unless the organization confirms it is real.

## 10. Media Files

The XML export contains attachment records and media URLs, but the XML file is not a complete binary backup of all images.

Action:

- Download the full `/wp-content/uploads/` folder from hosting.
- Compare downloaded files against `media.json` and `media-references.json`.
- Confirm large photos and video thumbnails are present.

## 11. YouTube Videos

The export references 11 YouTube embeds.

Action:

- Verify each video still exists and can be embedded.
- Preserve all embed URLs.
- Build a modern video gallery around them.

## 12. Redirects

The current site has old WordPress date URLs, campaign URLs, profile URLs, shop URLs, and page URLs.

Action:

- Review `outputs/migration-data/redirects.csv`.
- Adjust new paths to match final route decisions.
- Add redirects at hosting, CDN, or framework level before launch.
