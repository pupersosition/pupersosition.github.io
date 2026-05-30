# Architecture & Design Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the `Architecture & Design` subsection in the CV to reflect broader architectural influence and add a concrete Flink-based example.

**Architecture:** This is a content-only change in the markdown source of truth. Update the subsection text in `content/cv.md`, rebuild generated outputs, and verify the HTML/PDF artifacts reflect the new wording.

**Tech Stack:** Markdown source, Node.js build scripts, Puppeteer PDF generation, Node `node:test`

---

### Task 1: Rewrite Architecture & Design subsection

**Files:**
- Modify: `content/cv.md`
- Verify output: `site/index.html`

**Step 1: Update the source markdown**

Replace the existing `Architecture & Design` bullets with:

```md
##### Architecture & Design
- Continuously contributed to the architectural design of multiple systems, both within the team and across team boundaries, shaping streaming, pipeline, and service designs across AWS/cloud and on-prem data center environments.
- *Example of contribution:* Influenced cross-team technology choices during the design of a shared streaming system by identifying Apache Flink as a better fit than the sub-optimal technologies used in the initial PoC, educating 3 collaborating teams on the trade-offs, and helping drive adoption; the pipeline was later rebuilt with Flink and confirmed by engineers as the stronger solution.
```

**Step 2: Rebuild generated outputs**

Run: `npm run build`

Expected: `Compiled site/index.html from content/cv.md` and `Generated site/cv.pdf`

**Step 3: Run verification tests**

Run: `node --test`

Expected: all tests pass

**Step 4: Review rendered output**

Check that the new wording appears in `site/index.html` and the PDF export updates through the versioned PDF link.
