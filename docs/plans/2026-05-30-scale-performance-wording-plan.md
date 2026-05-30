# Scale & Performance Wording Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the first `Scale & Performance` bullet in the CV to use more executive wording while preserving the key scale metrics.

**Architecture:** This is a content-only change in the markdown source of truth. Modify the single bullet in `content/cv.md`, rebuild the generated HTML/PDF artifacts, and run the existing regression suite to confirm nothing else changes unexpectedly.

**Tech Stack:** Markdown source, Node.js build scripts, Puppeteer PDF generation, Node `node:test`

---

### Task 1: Update Scale & Performance bullet

**Files:**
- Modify: `content/cv.md`
- Verify output: `site/index.html`
- Verify output: `site/cv.pdf`

**Step 1: Update the source markdown**

Replace the first bullet under `##### Scale & Performance` with:

```md
- Systems operate across both high-throughput pipelines processing thousands of events/sec and streaming workloads running at 25 Hz (video broadcast frame rate).
```

**Step 2: Rebuild generated outputs**

Run: `npm run build`

Expected: `Compiled site/index.html from content/cv.md` and `Generated site/cv.pdf`

**Step 3: Run verification tests**

Run: `node --test`

Expected: all tests pass
