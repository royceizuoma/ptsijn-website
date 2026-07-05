# Migration Scripts

## `extract-wxr.mjs`

Purpose:

- Reads the WordPress XML/WXR export.
- Preserves raw HTML content.
- Splits content into JSON files by type.
- Creates a media manifest.
- Creates a YouTube embed manifest.
- Creates a private donation archive.
- Creates redirect suggestions.

Run from the project folder:

```powershell
node outputs\migration-scripts\extract-wxr.mjs "C:\Users\Lenovo\Downloads\perfectingthesaintsijnfoundationinc.WordPress.2026-06-14.xml" outputs\migration-data
```

Output:

```text
outputs/migration-data/
```

Privacy warning:

`private-donations.json` may contain donor information. Keep it private and do not publish it in the new website frontend.
