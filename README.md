# CV Site

This site is generated from markdown.

## Files

- `content/cv.md`: editable CV content
- `scripts/compile-cv.mjs`: markdown-to-HTML compiler
- `site/index.html`: generated output
- `site/styles.css`: existing styles
- `site/script.js`: existing interaction and animation logic

## Build

Requirements:

- Node.js 25 or newer

Command:

```bash
npm run build
```

That reads `content/cv.md` and rewrites `site/index.html`.

## Edit Content

Update `content/cv.md`, then run:

```bash
npm run build
```

## Markdown Format

Frontmatter at the top controls page metadata and hero content:

```md
---
pageTitle: Your Name | CV
description: Short page description
promptPrefix: yourname@cv:~$
promptCommand: cat your_cv.txt
name: Your Name
subtitle: Your Role | Skills
location: Your Location
---
```

Use a normal section like this:

```md
## Contact
- [you@example.com](mailto:you@example.com)
- [linkedin.com/in/you](https://www.linkedin.com/in/you)
```

Use a two-column row like this:

```md
::: columns
## Left Column
- Item

## Right Column
- Item
:::
```

Use experience entries like this:

```md
## Experience
### Company Name
#### Role | Dates | Location
Paragraph text.

- Achievement
- Achievement
```

## Notes

- Keep `site/index.html` generated. Edit `content/cv.md` instead.
- The current CSS and JS effects are preserved by keeping the same generated DOM structure.
