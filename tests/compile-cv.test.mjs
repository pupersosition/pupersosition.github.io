import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const compileScript = path.join(rootDir, "scripts", "compile-cv.mjs");
const sourcePath = path.join(rootDir, "content", "cv.md");
const outputPath = path.join(rootDir, "site", "index.html");

async function getExpectedAssetVersion() {
  const [styles, script] = await Promise.all([
    readFile(path.join(rootDir, "site", "styles.css"), "utf8"),
    readFile(path.join(rootDir, "site", "script.js"), "utf8")
  ]);

  return createHash("sha256").update(styles).update(script).digest("hex").slice(0, 10);
}

async function getExpectedDocumentVersion() {
  const [source, styles, script] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(path.join(rootDir, "site", "styles.css"), "utf8"),
    readFile(path.join(rootDir, "site", "script.js"), "utf8")
  ]);

  return createHash("sha256").update(source).update(styles).update(script).digest("hex").slice(0, 10);
}

async function withTemporarySource(source, callback) {
  const original = await readFile(sourcePath, "utf8");

  await writeFile(sourcePath, source, "utf8");

  try {
    return await callback();
  } finally {
    await writeFile(sourcePath, original, "utf8");
    await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });
  }
}

test("restores generated HTML after temporary-source test failures", { concurrency: false }, async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });
  const originalHtml = await readFile(outputPath, "utf8");

  await assert.rejects(
    withTemporarySource(
      `---
pageTitle: Broken Temp Page | CV
description: Cleanup regression test
promptPrefix: test@cv:~$
promptCommand: cat broken.txt
name: Broken Temp Page
subtitle: Temporary content
location: Test Lab
---

## Summary
This content should never stay published.
`,
      async () => {
        await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });
        throw new Error("intentional test failure");
      }
    ),
    /intentional test failure/
  );

  const restoredHtml = await readFile(outputPath, "utf8");

  assert.equal(restoredHtml, originalHtml, "Expected generated HTML to be restored after temporary-source test failure");
});

test("renders level-5 markdown headings in Experience roles", { concurrency: false }, async () => {
  await withTemporarySource(
    `---
pageTitle: Role Subsection Test | CV
description: Experience subsection rendering regression test
promptPrefix: test@cv:~$
promptCommand: cat role-subsection.txt
name: Role Subsection Test
subtitle: Experience markdown coverage
location: Test Lab
---

## Experience
### Example Corp
#### Staff Engineer | Jan 2024 - Present | Test Lab
##### Scope & Systems
- Built the renderer fixture.
`,
    async () => {
      await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

      const html = await readFile(outputPath, "utf8");

      assert.ok(
        html.includes('<p class="meta">Staff Engineer | Jan 2024 - Present | Test Lab</p>'),
        "Expected role metadata to render alongside the subsection fixture"
      );
      assert.ok(
        html.includes('<h4 class="role-subsection">Scope &amp; Systems</h4>'),
        "Expected ##### heading to render as a subsection heading"
      );
      assert.equal(
        html.includes("##### Scope &amp; Systems"),
        false,
        "Expected raw ##### markdown not to appear in rendered HTML"
      );
    }
  );
});

test("renders export control as a direct link to pre-generated PDF", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const [html, expectedVersion] = await Promise.all([readFile(outputPath, "utf8"), getExpectedDocumentVersion()]);

  assert.ok(
    html.includes(
      `<a id="export-pdf" class="export-pdf" href="./cv.pdf?v=${expectedVersion}" target="_blank" rel="noopener">Export PDF</a>`
    ),
    "Expected export control to point to the generated PDF file with a cache-busting version"
  );
  assert.equal(
    html.includes('<button id="export-pdf" class="export-pdf" type="button">Export PDF</button>'),
    false,
    "Expected print-style export button markup to be removed"
  );
});

test("renders terminal prompt command line in hero for webpage", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes('class="prompt"'),
    "Expected prompt line markup to be present in hero"
  );
  assert.ok(
    html.includes("nikita@cv:~$"),
    "Expected prompt prefix text to be present for webpage view"
  );
  assert.ok(
    html.includes('data-command="cat nikita_vostrosablin_cv.txt"'),
    "Expected typed command source to be present for animation"
  );
});

test("normalizes Prague-based experience locations to Prague, Czechia", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes("Engineering Manager | Jul 2025 - Present | Prague, Czechia"),
    "Expected current Prague-based role location to use Prague, Czechia"
  );
  assert.ok(
    html.includes("Scientific Software Engineer, Team Lead | Jul 2021 - Nov 2023 | Prague, Czechia"),
    "Expected Merck Prague-based role location to use Prague, Czechia"
  );
  assert.equal(
    html.includes("Prague, Czech Republic"),
    false,
    "Expected older Prague location wording to be removed from experience entries"
  );
});

test("does not include reveal animation classes in generated HTML", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.equal(
    html.includes(" reveal"),
    false,
    "Expected generated HTML to avoid scroll reveal classes so content is always visible"
  );
});

test("renders indented markdown sub-items as nested lists", { concurrency: false }, async () => {
  await withTemporarySource(
    `---
pageTitle: Nested List Test | CV
description: Nested list rendering regression test
promptPrefix: test@cv:~$
promptCommand: cat nested-list.txt
name: Nested List Test
subtitle: Markdown list coverage
location: Test Lab
---

## Summary
- Parent item, e.g.:
  - First child item
  - Second child item
`,
    async () => {
      await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

      const html = await readFile(outputPath, "utf8");

      assert.ok(
        /<li>Parent item, e\.g\.:\s*<ul>\s*<li>First child item<\/li>\s*<li>Second child item<\/li>\s*<\/ul><\/li>/.test(
          html
        ),
        "Expected parent list item to contain nested sub-list markup"
      );
      assert.equal(
        html.includes("Parent item, e.g.:</li>"),
        false,
        "Expected parent list item not to close before nested sub-items render"
      );
      assert.equal(
        html.includes("- First child item"),
        false,
        "Expected indented sub-items not to remain as raw markdown text"
      );
    }
  );
});

test("does not render Top Skills section", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.equal(html.includes("<h2>Top Skills</h2>"), false, "Expected Top Skills section to be removed");
  assert.ok(html.includes("<h2>Contact</h2>"), "Expected Contact section to remain present");
});

test("uses content-based asset version for stylesheet and script URLs", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const [html, expectedVersion] = await Promise.all([
    readFile(outputPath, "utf8"),
    getExpectedAssetVersion()
  ]);

  assert.ok(
    html.includes(`./styles.css?v=${expectedVersion}`),
    "Expected stylesheet URL to include a cache-busting version derived from asset contents"
  );
  assert.ok(
    html.includes(`./script.js?v=${expectedVersion}`),
    "Expected script URL to include a cache-busting version derived from asset contents"
  );
});

test("renders markdown emphasis markers as semantic inline HTML", { concurrency: false }, async () => {
  await withTemporarySource(
    `---
pageTitle: Emphasis Test | CV
description: Inline emphasis regression test
promptPrefix: test@cv:~$
promptCommand: cat emphasis.txt
name: Emphasis Test
subtitle: Markdown emphasis coverage
location: Test Lab
---

## Summary
This paragraph uses *italic* and **bold** text.

- A bullet with *emphasis*
- Another bullet with **strength**
`,
    async () => {
      await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

      const html = await readFile(outputPath, "utf8");

      assert.ok(html.includes("<p>This paragraph uses <em>italic</em> and <strong>bold</strong> text.</p>"));
      assert.ok(html.includes("<li>A bullet with <em>emphasis</em></li>"));
      assert.ok(html.includes("<li>Another bullet with <strong>strength</strong></li>"));
      assert.equal(html.includes("*italic*"), false, "Expected raw italic markdown not to appear in rendered HTML");
    }
  );
});

test("loads italic font variants needed for rendered emphasis", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes("family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"),
    "Expected generated HTML to load italic IBM Plex Mono variants for emphasis rendering"
  );
});

test("renders bold inline text with ampersands without double-escaping entities", { concurrency: false }, async () => {
  await withTemporarySource(
    `---
pageTitle: Ampersand Test | CV
description: Ampersand rendering regression test
promptPrefix: test@cv:~$
promptCommand: cat ampersand.txt
name: Ampersand Test
subtitle: Inline entity coverage
location: Test Lab
---

## Technologies
- **Languages & Core:** Python
`,
    async () => {
      await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

      const html = await readFile(outputPath, "utf8");

      assert.ok(html.includes("<li><strong>Languages &amp; Core:</strong> Python</li>"));
      assert.equal(html.includes("&amp;amp;"), false, "Expected ampersands not to be double-escaped inside bold text");
    }
  );
});
