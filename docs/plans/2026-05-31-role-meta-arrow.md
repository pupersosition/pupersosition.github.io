# Role Meta Arrow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a subtle arrow marker before each role metadata line on the website and in the generated PDF.

**Architecture:** Keep the existing markdown and generated HTML unchanged, and introduce the marker purely through CSS using a `.meta::before` pseudo-element. Protect the behavior with a regression assertion in the CSS test file.

**Tech Stack:** Node.js, Node test runner, static CSS, Puppeteer PDF build

---

### Task 1: Lock the arrow marker in tests

**Files:**
- Modify: `tests/pdf-output.test.mjs`
- Test: `tests/pdf-output.test.mjs`

**Step 1: Write the failing test**

Add assertions that require `.meta::before` to exist and render a subtle arrow marker.

**Step 2: Run test to verify it fails**

Run: `node --test tests/pdf-output.test.mjs`
Expected: FAIL because the current CSS does not define the arrow marker.

**Step 3: Keep production code unchanged in this task**

Do not change `site/styles.css` yet.

**Step 4: Run test again to verify it fails for the expected reason**

Run: `node --test tests/pdf-output.test.mjs`
Expected: FAIL with unmet CSS assertions for `.meta::before`.

### Task 2: Implement the arrow marker

**Files:**
- Modify: `site/styles.css`
- Test: `tests/pdf-output.test.mjs`

**Step 1: Write minimal implementation**

Add a pseudo-element arrow marker for `.meta` that works on screen and in print without overpowering the text.

**Step 2: Run focused tests**

Run: `node --test tests/pdf-output.test.mjs`
Expected: PASS

### Task 3: Verify the full output

**Files:**
- Modify: `site/styles.css`
- Verify: `site/index.html`, `site/cv.pdf`

**Step 1: Run full tests**

Run: `node --test`
Expected: PASS

**Step 2: Run full build**

Run: `npm run build`
Expected: PASS and regenerate output artifacts.

**Step 3: Inspect the working tree**

Run: `git status --short`
Expected: CSS, tests, docs, and regenerated artifacts only.
