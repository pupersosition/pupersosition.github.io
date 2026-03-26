import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("pdf mode in script supports prompt animation on web while allowing static PDF", async () => {
  const scriptPath = path.join(rootDir, "site", "script.js");
  const script = await readFile(scriptPath, "utf8");

  assert.ok(
    script.includes('new URLSearchParams(window.location.search).get("pdf") === "1"'),
    "Expected script to detect pdf mode from URL params"
  );
  assert.ok(script.includes("typedCommand"), "Expected typed prompt logic to be restored for webpage view");
});

test("print styles allow role content to flow without forced blank pages", async () => {
  const stylesPath = path.join(rootDir, "site", "styles.css");
  const css = await readFile(stylesPath, "utf8");

  assert.equal(
    css.includes(".section,\n  .role {\n    break-inside: avoid;\n  }"),
    false,
    "Expected print CSS to stop forcing section/role blocks to stay on one page"
  );
  assert.ok(
    css.includes(".prompt") && css.includes("display: none !important;"),
    "Expected print CSS to hide prompt line for PDF output"
  );
  assert.ok(
    css.includes(".role-subsection {") && css.includes("font-size: 0.5rem;"),
    "Expected print CSS to explicitly set smaller subsection heading size"
  );
  assert.equal(
    css.includes(".role-subsection {\n    font-size: 0.44rem;"),
    false,
    "Expected ##### heading not to become too tiny"
  );
  assert.ok(
    css.includes(".meta {") && css.includes("font-size: 0.66rem;"),
    "Expected print CSS to make #### meta headings clearly smaller than parent sections"
  );
  assert.ok(
    css.includes("@media print") &&
      css.includes("  .grid-two {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }"),
    "Expected print CSS to preserve two-column layout for CONTACT and TOP SKILLS"
  );
});
