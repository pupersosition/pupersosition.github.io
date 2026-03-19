# CV Site

This site is generated from markdown.

## Files

- `content/cv.md`: editable CV content
- `scripts/compile-cv.mjs`: markdown-to-HTML-and-PDF compiler
- `site/index.html`: generated interactive page
- `site/*.print.html`: generated PDF source page
- `site/*.pdf`: generated downloadable PDF
- `site/styles.css`: existing styles
- `site/pdf.css`: PDF-specific styles
- `site/script.js`: existing interaction and animation logic

## Build

Requirements:

- Node.js 25 or newer

Command:

```bash
npm install
npm run build
```

That reads `content/cv.md` and rewrites `site/index.html`, a print-ready HTML source, and a prepared PDF download.

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
pdfFileName: your-name-cv.pdf
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

- Keep generated files in `site/` generated. Edit `content/cv.md` instead.
- The current CSS and JS effects are preserved by keeping the same generated DOM structure.
- `pdfFileName` is optional. If omitted, the builder derives a safe filename from `name`.
