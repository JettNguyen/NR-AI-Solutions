# Resources/Articles Workflow

## How it works

Articles are authored and published directly by Jett/Jack — no submission form, review queue, or backend. To add an article:

1. Open `assets/articles.json`.
2. Add a new object to the array with: `title`, `summary`, `author`, `date` (YYYY-MM-DD), `readTime`, `category`, `tags` (array).
3. Commit and push. The resources page (`resources/index.html`, rendered by `js/resources.js`) fetches this file directly and renders it client-side — no build step, no database.

## Article object shape

```json
{
  "title": "string",
  "summary": "string",
  "author": "string",
  "date": "YYYY-MM-DD",
  "readTime": "string, e.g. \"4 min read\"",
  "category": "string",
  "tags": ["string"]
}
```

The first object in the array is treated as featured in the UI; the rest render as cards in array order (there's no automatic date sorting, so put new articles at the top). Search and category filtering work client-side over whatever is in the array.
