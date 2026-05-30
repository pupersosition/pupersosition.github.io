# Leadership & Org Impact DX4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the `Leadership & Org Impact` subsection in the CV to include introducing the DX4 framework for tracking team performance.

**Architecture:** This is a content-only change in the markdown source of truth. Modify the existing squad-based ownership bullet in `content/cv.md`, rebuild generated outputs, and verify the site and PDF regenerate cleanly.

**Tech Stack:** Markdown source, Node.js build scripts, Puppeteer PDF generation, Node `node:test`

---

### Task 1: Update Leadership & Org Impact wording

**Files:**
- Modify: `content/cv.md`
- Verify output: `site/index.html`
- Verify output: `site/cv.pdf`

**Step 1: Update the source markdown**

Replace the squad-based ownership bullet with:

```md
- Reorganized team into squad-based ownership model, improving focus and accountability, and introduced the DX4 framework to track team performance through a combination of automated metrics collection and team surveys.
```

**Step 2: Rebuild generated outputs**

Run: `npm run build`

Expected: `Compiled site/index.html from content/cv.md` and `Generated site/cv.pdf`

**Step 3: Run verification tests**

Run: `node --test`

Expected: all tests pass
