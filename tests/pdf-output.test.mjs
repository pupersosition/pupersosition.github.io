import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function getRuleBlock(css, selector, occurrence = "first") {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const selectorMatches = [...css.matchAll(new RegExp(`(^|\\n)\\s*${escapedSelector}\\s*\\{`, "g"))];
  assert.ok(selectorMatches.length > 0, `Expected CSS rule for ${selector}`);

  const selectorMatch = occurrence === "last" ? selectorMatches.at(-1) : selectorMatches[0];
  const selectorIndex = selectorMatch.index + selectorMatch[0].length - 1;

  const blockStart = css.indexOf("{", selectorIndex);
  assert.notEqual(blockStart, -1, `Expected opening brace for ${selector}`);

  let depth = 0;
  for (let index = blockStart; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1;
    }

    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return css.slice(blockStart + 1, index);
      }
    }
  }

  assert.fail(`Expected closing brace for ${selector}`);
}

function getMediaPrintBlock(css, selector) {
  const mediaBlock = getRuleBlock(css, "@media print");
  return getRuleBlock(mediaBlock, selector, "last");
}

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
  const metaBlock = getRuleBlock(css, ".meta", "first");
  const metaBeforeBlock = getRuleBlock(css, ".meta::before", "first");
  const roleSubsectionBlock = getRuleBlock(css, ".role-subsection", "first");
  const printMetaBlock = getMediaPrintBlock(css, ".meta");
  const printMetaBeforeBlock = getMediaPrintBlock(css, ".meta::before");
  const printRoleSubsectionBlock = getMediaPrintBlock(css, ".role-subsection");

  assert.ok(
    metaBlock.includes("font-size: 0.92rem;"),
    "Expected screen CSS to promote role meta lines with a larger font size"
  );
  assert.ok(
    metaBeforeBlock.includes('content: ">";'),
    "Expected role meta lines to include a subtle '>' marker"
  );
  assert.ok(
    metaBlock.includes("font-weight: 700;"),
    "Expected screen CSS to render role meta lines with bold weight"
  );
  assert.ok(
    metaBlock.includes("color: var(--text);"),
    "Expected screen CSS to render role meta lines with strong text color"
  );
  assert.ok(
    metaBeforeBlock.includes("margin-right: 0.55rem;"),
    "Expected the arrow marker to keep some spacing before the role text"
  );

  assert.ok(
    css.includes("strong,") && css.includes("font-weight: 700;"),
    "Expected CSS to explicitly render strong text with a heavier weight"
  );
  assert.ok(
    css.includes("strong,") && css.includes("color: color-mix(in srgb, var(--accent) 72%, var(--text) 28%);"),
    "Expected strong text to get a visible accent treatment"
  );
  assert.ok(
    css.includes("em,") && css.includes("font-style: italic;"),
    "Expected CSS to explicitly render emphasis text in italics"
  );
  assert.ok(
    css.includes("em,") && css.includes("color: color-mix(in srgb, var(--accent) 58%, var(--text) 42%);"),
    "Expected emphasized text to get a visible accent treatment"
  );

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
    printRoleSubsectionBlock.includes("font-size: 0.48rem;"),
    "Expected print CSS to explicitly set smaller subsection heading size"
  );
  assert.equal(
    css.includes(".role-subsection {\n    font-size: 0.44rem;"),
    false,
    "Expected ##### heading not to become too tiny"
  );
  assert.ok(
    printMetaBlock.includes("font-size: 0.66rem;"),
    "Expected print CSS to make #### meta headings clearly readable in the PDF"
  );
  assert.ok(
    printMetaBlock.includes("font-weight: 700;"),
    "Expected print CSS to render #### meta headings with bold weight"
  );
  assert.ok(
    printMetaBlock.includes("color: #1f1f1f;"),
    "Expected print CSS to render #### meta headings in a dark, readable color"
  );
  assert.ok(
    printMetaBeforeBlock.includes("color: #555555;"),
    "Expected the print arrow marker to remain visible but subdued"
  );
  assert.ok(
    css.includes("@media print") &&
      css.includes("  .grid-two {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }"),
    "Expected print CSS to preserve two-column layout for CONTACT and TOP SKILLS"
  );
  assert.ok(
    roleSubsectionBlock.includes("font-size: 0.72rem;") && printRoleSubsectionBlock.includes("font-size: 0.48rem;"),
    "Expected print subsection headings to remain smaller than role meta lines"
  );
});
