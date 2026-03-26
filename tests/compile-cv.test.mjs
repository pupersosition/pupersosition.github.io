import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
const outputPath = path.join(rootDir, "site", "index.html");

test("renders level-5 markdown headings in Experience roles", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes('<h4 class="role-subsection">Scope &amp; Systems</h4>'),
    "Expected ##### heading to render as a subsection heading"
  );
  assert.equal(
    html.includes("##### Scope &amp; Systems"),
    false,
    "Expected raw ##### markdown not to appear in rendered HTML"
  );
});

test("renders export control as a direct link to pre-generated PDF", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes('<a id="export-pdf" class="export-pdf" href="./cv.pdf" target="_blank" rel="noopener">Download PDF</a>'),
    "Expected export control to point to the generated PDF file"
  );
  assert.equal(
    html.includes('<button id="export-pdf" class="export-pdf" type="button">Download PDF</button>'),
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

test("does not include reveal animation classes in generated HTML", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.equal(
    html.includes(" reveal"),
    false,
    "Expected generated HTML to avoid scroll reveal classes so content is always visible"
  );
});

test("renders indented markdown sub-items as nested lists", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.ok(
    html.includes("<li>Defined and enforced pipeline-level SLOs (latency and data completeness), e.g.:\n              <ul>"),
    "Expected parent list item to contain nested sub-list markup"
  );
  assert.equal(
    html.includes("<li>Defined and enforced pipeline-level SLOs (latency and data completeness), e.g.:\n- metric generation every minute with ≤5 min latency"),
    false,
    "Expected indented sub-items not to remain as raw markdown text"
  );
});

test("does not render Top Skills section", async () => {
  await execFileAsync(process.execPath, [compileScript], { cwd: rootDir });

  const html = await readFile(outputPath, "utf8");

  assert.equal(html.includes("<h2>Top Skills</h2>"), false, "Expected Top Skills section to be removed");
  assert.ok(html.includes("<h2>Contact</h2>"), "Expected Contact section to remain present");
});
