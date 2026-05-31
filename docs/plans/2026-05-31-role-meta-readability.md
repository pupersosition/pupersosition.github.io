# Role Meta Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the readability of experience role metadata lines on both the website and the generated PDF without changing markdown or HTML structure.

**Architecture:** Keep the existing compiler output unchanged and adjust only CSS hierarchy in `site/styles.css`. Protect the change with regression checks in `tests/pdf-output.test.mjs` so screen and print typography rules remain explicit.

**Tech Stack:** Node.js, Node test runner, static CSS, Puppeteer PDF build

---

### Task 1: Lock the desired typography in tests

**Files:**
- Modify: `tests/pdf-output.test.mjs`
- Test: `tests/pdf-output.test.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- screen `.meta` to use a larger font size, stronger weight, and body-adjacent color
- print `.meta` to use a larger font size, stronger weight, and dark text color
- print `.role-subsection` to remain smaller than `.meta`

**Step 2: Run test to verify it fails**

Run: `node --test tests/pdf-output.test.mjs`
Expected: FAIL because the current CSS still uses muted or undersized `.meta` styling.

**Step 3: Write minimal implementation**

Do not change production code in this task.

**Step 4: Run test to verify it fails for the expected reason**

Run: `node --test tests/pdf-output.test.mjs`
Expected: FAIL with unmet CSS assertions, confirming the test protects the desired styling.

### Task 2: Update role metadata hierarchy in CSS

**Files:**
- Modify: `site/styles.css`
- Test: `tests/pdf-output.test.mjs`

**Step 1: Write minimal implementation**

Update `.meta` and related spacing/color hierarchy so that:
- website role metadata is darker, stronger, and easier to read
- PDF role metadata is clearly stronger than subsection headings
- subsection headings remain visibly secondary

**Step 2: Run focused tests**

Run: `node --test tests/pdf-output.test.mjs`
Expected: PASS

**Step 3: Refine only if needed**

Adjust sizes, spacing, or weight only enough to satisfy readability and preserve hierarchy.

### Task 3: Verify the full site output

**Files:**
- Modify: `site/styles.css`
- Verify: `site/index.html`, `site/cv.pdf`

**Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS

**Step 2: Run the full build**

Run: `npm run build`
Expected: PASS and regenerate `site/index.html` and `site/cv.pdf`

**Step 3: Inspect working tree state**

Run: `git status --short`
Expected: modified CSS, test file, docs plan files, and regenerated build artifacts only
