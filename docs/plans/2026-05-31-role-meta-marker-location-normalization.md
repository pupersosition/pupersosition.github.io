# Role Meta Marker And Location Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the role metadata marker with `>` and normalize Prague-based location wording in the CV source.

**Architecture:** Keep the renderer unchanged. Update the marker in `site/styles.css`, normalize location strings directly in `content/cv.md`, and protect both with focused regression checks in the existing test files.

**Tech Stack:** Node.js, Node test runner, static CSS, markdown content, Puppeteer PDF build

---

### Task 1: Lock the new marker and locations in tests

**Files:**
- Modify: `tests/pdf-output.test.mjs`
- Modify: `tests/compile-cv.test.mjs`

**Step 1: Write the failing tests**

Add assertions that require:
- `.meta::before` to render `>` instead of `->`
- generated HTML to include `Prague, Czechia`
- generated HTML to avoid the older Prague wording

**Step 2: Run tests to verify they fail**

Run: `node --test tests/pdf-output.test.mjs tests/compile-cv.test.mjs`
Expected: FAIL because the current marker is `->` and Prague wording is not yet normalized everywhere.

### Task 2: Implement the minimal content and CSS changes

**Files:**
- Modify: `site/styles.css`
- Modify: `content/cv.md`

**Step 1: Write minimal implementation**

Change the pseudo-element marker to `>` and normalize Prague-based role locations in the source content.

**Step 2: Run focused tests**

Run: `node --test tests/pdf-output.test.mjs tests/compile-cv.test.mjs`
Expected: PASS

### Task 3: Verify the complete output

**Files:**
- Verify: `site/index.html`, `site/cv.pdf`

**Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS

**Step 2: Run the full build**

Run: `npm run build`
Expected: PASS and regenerate the website and PDF.
