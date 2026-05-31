# Role Meta Arrow Design

## Goal

Add a subtle arrow marker before each experience position line so the role metadata feels more structured on both the website and the PDF.

## Approved Direction

- Keep the role text unchanged in `content/cv.md`.
- Add the marker with CSS on `.meta` so the renderer and markdown format stay untouched.
- Use a subtle terminal-friendly arrow, not a decorative icon.
- Apply the same treatment to website and PDF for consistent hierarchy.

## Styling Direction

- Render a small arrow before `.meta` with a pseudo-element.
- Keep the arrow visually subordinate to the role text through spacing and slightly lower emphasis.
- Preserve the stronger `.meta` readability changes already made.

## Non-Goals

- No parser changes.
- No HTML changes.
- No additional content fields in markdown.

## Verification

- Add regression coverage for the arrow marker in `tests/pdf-output.test.mjs`.
- Run `node --test`.
- Run `npm run build`.
