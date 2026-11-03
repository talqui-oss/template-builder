# Template catalog

Every JSON file in [`templates/`](./templates) becomes a page at `https://template-builder.dev/whatsapp-template/<file-name>`, with its Markdown version, an Open Graph image and an entry in the sitemap and `llms.txt`. Adding a template is adding a file.

## Add a template

1. Create `templates/<industry>-<short-description>.json`. The file name is the URL, so make it describe the template (`restaurants-table-reservation-confirmed`).
2. Fill it in:

```json
{
  "title": "Table reservation confirmed",
  "description": "120 to 160 characters: what the template does and when to use it.",
  "industry": "restaurants",
  "useCase": "booking-confirmation",
  "keywords": ["restaurant reservation whatsapp", "table booking confirmation"],
  "notes": "One or two sentences on getting this template approved.",
  "author": { "name": "Your name", "url": "https://github.com/you" },
  "template": {
    "name": "table_reservation_confirmed",
    "language": "en_US",
    "category": "UTILITY",
    "body": { "text": "…" }
  }
}
```

- `industry` and `useCase` must be slugs from [`taxonomy.json`](./taxonomy.json).
- `template` follows the [JSON Schema](https://template-builder.dev/schema.json).
- `author` is optional; entries without it are listed as maintained by Talqui.
- Use fictional brands and domains (Acme, acme.com).

3. Check it: `pnpm --filter web check:catalog`. Every entry must pass `validate` with no errors.
4. Open a pull request.
