# Role Meta Readability Design

## Goal

Make role metadata lines such as `Engineering Manager | Jul 2025 - Present | Prague, Czechia` clearly readable and visually distinct from smaller subsection labels in both the website and generated PDF.

## Current Problem

- Role metadata is rendered through the `.meta` class.
- On the website, `.meta` is too muted and visually close to secondary labels.
- In print/PDF, `.meta` is reduced further, which makes it easy to confuse with small subsection headings like `Scope & Systems`.

## Approved Direction

- Keep the existing markdown and HTML structure unchanged.
- Solve the issue entirely through CSS so the content authoring format stays simple.
- Promote `.meta` so it reads like a proper position line under each company name.
- Preserve a clear hierarchy between company name, position line, subsection labels, and body content.

## Styling Changes

### Screen

- Increase `.meta` font size.
- Increase `.meta` font weight.
- Move `.meta` color much closer to normal text color.
- Tighten spacing so `.meta` visually belongs to the company heading.
- Slightly reduce the visual prominence of `.role-subsection` if needed.

### Print / PDF

- Increase `.meta` font size relative to the current print rules.
- Use a bold or semibold weight for `.meta`.
- Replace the gray print color with a much darker text color.
- Keep `.role-subsection` smaller and more subdued than `.meta`.

## Non-Goals

- No markdown syntax changes.
- No parser or renderer changes.
- No redesign of the experience section layout.

## Verification

- Add CSS regression assertions in the existing tests.
- Run `node --test`.
- Run `npm run build` to regenerate the site and PDF.
