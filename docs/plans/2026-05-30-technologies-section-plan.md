# Technologies Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `Technologies` section to the CV in place of `Certifications` to improve ATS coverage.

**Architecture:** This is a content-only change in the markdown source of truth. Update the final two-column block in `content/cv.md`, rebuild generated artifacts, and verify the HTML/PDF output plus regression tests.

**Tech Stack:** Markdown source, Node.js build scripts, Puppeteer PDF generation, Node `node:test`

---

### Task 1: Replace Certifications with Technologies

**Files:**
- Modify: `content/cv.md`
- Verify output: `site/index.html`
- Verify output: `site/cv.pdf`

**Step 1: Update the source markdown**

Replace the `## Certifications` block with:

```md
## Technologies
- **Languages & Core:** Python, Go, SQL, Bash, C++, JavaScript
- **Cloud & Infrastructure:** AWS, Kubernetes, IaaC (Terraform), CI/CD (Jenkins, ArgoCD)
- **Streaming & Messaging:** Kafka, Apache Flink, SQS, SNS
- **Databases:** Relational (Redshift, PostgreSQL, MySQL), NoSQL (DynamoDB), Graph (Neo4j)
- **ML / Data Science:** pandas, Polars, scikit-learn, PyTorch
- **Orchestration:** Airflow, Temporal
- **Observability:** ELK, Grafana, OpenTelemetry
```

**Step 2: Rebuild generated outputs**

Run: `npm run build`

Expected: `Compiled site/index.html from content/cv.md` and `Generated site/cv.pdf`

**Step 3: Run verification tests**

Run: `node --test`

Expected: all tests pass
