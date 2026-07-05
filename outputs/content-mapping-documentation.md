# Content Mapping Documentation

This document maps every identified WordPress content type from the live site and XML export to the recommended structure for the new modern website.

## New Content Model

### Site Settings

Fields:

- siteName
- tagline
- phone
- email
- address
- donationNotice
- socialLinks
- primaryNavigation
- footerNavigation

Source:

- WordPress channel title and description
- Live site header/footer
- Contact page
- Our Meetings post

### Page

Fields:

- id
- oldId
- title
- slug
- oldUrl
- newPath
- status
- bodyHtml
- excerptHtml
- seoTitle
- seoDescription
- mediaReferences
- sourceType
- manualReviewRequired

Source WordPress type: `page`

### Blog Post

Fields:

- id
- oldId
- title
- slug
- oldUrl
- newPath
- date
- modified
- category
- bodyHtml
- excerptHtml
- featuredImage
- mediaReferences
- youtubeReferences

Source WordPress type: `post`

### Outreach Report

Fields:

- title
- slug
- date
- bodyHtml
- mediaReferences
- galleryImages
- videoEmbeds
- category
- oldUrl
- newPath

Source:

- Posts categorized as Outreach
- Posts with gallery/image/video content

### Gallery

Fields:

- title
- slug
- description
- sourcePost
- images
- captions
- oldUrl
- newPath

Source:

- `Past Outreaches (Photo Gallery)`
- `Free Feeding and Medical Outreach`
- Attachment records
- Media references from post HTML

### Video

Fields:

- title
- provider
- embedUrl
- sourcePost
- oldUrl

Source:

- YouTube iframe embeds in `Past Outreaches (Video Gallery)`

### Campaign

Fields:

- id
- oldId
- title
- slug
- oldUrl
- newPath
- bodyHtml
- targetAmount
- campaignCategory
- featuredImage
- donationStatus
- manualReviewRequired

Source WordPress type: `campaign`

### Donation Record

Fields:

- oldId
- title
- status
- amount
- paymentMethod
- recurrence
- campaign
- donorFirstName
- donorLastName
- donorEmail
- donorAddress
- donorZip
- anonymousDonation

Source WordPress type: `donation`

Storage rule:

- Private archive only.
- Do not publish.
- Do not include in frontend build output.

### Leadership Profile

Fields:

- id
- oldId
- name
- slug
- role
- bodyHtml
- profileTitle
- profileSubtitle
- image
- socialLinks
- oldUrl
- newPath

Source WordPress type: `profile`

### Event / Meeting

Fields:

- title
- schedule
- location
- onlineAccessInstructions
- bodyHtml
- sourcePost
- oldUrl
- newPath

Source:

- `Our Meetings` post
- `Timetable` page

### Ministry / Program

Fields:

- title
- slug
- bodyHtml
- description
- relatedImages
- relatedOutreachReports
- oldUrl
- newPath

Source:

- `Ministries` page
- `content_template` item titled `Ministries`
- Homepage ministry sections

### Product / Shop Item

Fields:

- title
- slug
- oldUrl
- productHtml
- price
- sku
- categories
- images
- status

Source WordPress type: `product`

Migration rule:

- Preserve in legacy archive unless the ministry confirms the shop should remain.

### Form

Fields:

- title
- oldId
- formDefinition
- mailSettings
- messages
- destination
- newComponent

Source WordPress type: `wpcf7_contact_form`

Migration rule:

- Rebuild as modern forms; preserve original form fields and mail behavior for reference.

## Old Content Type to New Structure

| Old WordPress Type | Count | New Structure | Notes |
|---|---:|---|---|
| page | 19 | Pages, Events, Donate, Contact, Legal, Legacy Archive | Preserve all; review drafts/demo pages. |
| post | 4 | Blog, Outreach Reports, Gallery, Events | Preserve title/date/body exactly. |
| campaign | 2 | Donate > Campaigns | Preserve title/body/target metadata. |
| profile | 2 | About > Leadership | Preserve profile content and images. |
| attachment | 91 | Media Library | Download/copy actual files from uploads folder. |
| donation | 21 | Private Donation Archive | Sensitive; never public. |
| product | 9 | Legacy Shop or Merchandise | Manual decision required. |
| nav_menu_item | 19 | Navigation Reference | Rebuild modern nav manually. |
| wpcf7_contact_form | 2 | Contact/Donation Form Components | Rebuild behavior, preserve definitions. |
| content_template | 15 | Legacy Theme Templates Archive | Not direct public content unless reviewed. |
| cmsmasters_like | 7 | Legacy Analytics Archive | Do not migrate publicly. |
| custom_css | 1 | Legacy Design Archive | Do not use for new design. |
| wp_global_styles | 1 | Legacy Design Archive | Do not use for new design. |

## Page Mapping

| Old Page | Old URL | New Location | Treatment |
|---|---|---|---|
| Home | `/` | `/` | Preserve sections, redesign presentation. |
| Who We Are | `/who-we-are/` | `/about/` | Preserve content as About page. |
| Ministries | `/ministers/` | `/ministries/` | Preserve content; improve program layout. |
| Donations | `/donations/` | `/donate/` | Rebuild donation experience; preserve original form content. |
| Give | `/give/` | `/donate/` or `/donate/campaigns/` | Merge with Donate page and campaigns. |
| Contact | `/contact/` | `/contact/` | Rebuild form and preserve contact content. |
| Updates | `/updates/` | `/blog/` | Use as blog/archive index. |
| Our Leadership | `/our-team/` | `/about/leadership/` | Merge with leadership profiles. |
| Get Involved | `/get-involved/` | `/ministries/volunteer/` or `/contact/` | Preserve; route to volunteer path. |
| Timetable | `/timetable/` | `/events/` | Preserve as meetings/events content. |
| Home Music | `/home-music/` | `/legacy/home-music/` | Manual review; likely theme/demo content. |
| Sample Page | `/sample-page/` | `/legacy/sample-page/` | Manual review; likely remove from nav. |
| Shop | `/shop/` | `/shop/` or `/legacy/shop/` | Only publish if shop remains active. |
| Shop 2 | `/shop-2/` | `/legacy/shop-2/` | Manual review. |
| Cart | `/cart/` | `/shop/cart/` or not migrated | Only if e-commerce remains. |
| Checkout | `/checkout/` | `/shop/checkout/` or not migrated | Only if e-commerce remains. |
| My account | `/my-account/` | `/account/` or not migrated | Only if e-commerce remains. |
| Privacy Policy | draft | `/privacy-policy/` | Manual legal review before publishing. |
| Refund and Returns Policy | draft | `/refund-and-returns-policy/` | Manual legal review before publishing. |

## Post Mapping

| Old Post | Old URL | New Location | New Content Type |
|---|---|---|---|
| Past Outreaches (Video Gallery) | `/2022/11/25/successful-outreaches/` | `/gallery/videos/past-outreaches/` and `/blog/past-outreaches-video-gallery/` | Video gallery / Blog |
| Past Outreaches (Photo Gallery) | `/2022/11/30/successful-outreaches-photo-gallery/` | `/gallery/past-outreaches/` and `/blog/past-outreaches-photo-gallery/` | Photo gallery / Blog |
| Our Meetings | `/2023/01/13/our-meetings/` | `/events/our-meetings/` | Event/meeting |
| Free Feeding and Medical Outreach | `/2023/10/15/free-feeding-and-medical-outreach/` | `/outreach/free-feeding-and-medical-outreach/` | Outreach report |

## Campaign Mapping

| Old Campaign | Old URL | New Location | Notes |
|---|---|---|---|
| 2022 Winter Supplies | `/campaign/renovating-a-historic-building/` | `/donate/campaigns/2022-winter-supplies/` | Preserve original content and campaign target metadata. |
| Medical Drive | `/campaign/helping-the-morgan-family/` | `/donate/campaigns/medical-drive/` | Preserve original content and campaign target metadata. |

## Leadership Mapping

| Old Profile | Old URL | New Location |
|---|---|---|
| George | `/members/george/` | `/about/leadership/george/` |
| Sylvia | `/members/sylvia/` | `/about/leadership/sylvia/` |

## Media Mapping

Media migration should use two sources:

1. `outputs/migration-data/media.json`, for WordPress attachment records.
2. `outputs/migration-data/media-references.json`, for all image URLs referenced inside content HTML.

The export references 91 attachment records and 111 unique media URLs/references.

## Video Mapping

The export references 11 YouTube embed URLs. They should be preserved as video embeds in the new Gallery/Media section and retained inside the original raw HTML migration data.

## Redirect Mapping

Use `outputs/migration-data/redirects.csv` to configure redirects from old WordPress URLs to new website paths.

Redirect priority:

1. Homepage, About, Donate, Contact, Updates.
2. Posts and outreach reports.
3. Campaigns.
4. Leadership profiles.
5. Shop/product pages if retained.
6. Legacy pages.
