import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

function buildSite() {
  execFileSync("npm", ["run", "build"], { stdio: "pipe" });
}

function readGeneratedHtml() {
  return readFileSync("site/index.html", "utf8");
}

function readStyles() {
  return readFileSync("site/styles.css", "utf8");
}

test("PDF header exposes profile and contact information as separate columns", () => {
  buildSite();

  const html = readGeneratedHtml();

  const heroContact = html.match(/<aside class="hero-contact"[\s\S]*?<\/aside>/)?.[0] || "";

  assert.match(html, /class="hero-summary"/);
  assert.match(heroContact, /class="hero-contact"/);
  assert.match(heroContact, /class="hero-contact-list"/);
  assert.match(heroContact, /location:<\/span> Prague, Czechia/);
  assert.match(heroContact, /phone:<\/span> \+420 722 439 593/);
  assert.match(heroContact, /email:<\/span> nikita\.vostrosablin@gmail\.com/);
  assert.match(heroContact, /linkedin:<\/span> linkedin\.com\/in\/nikita-vostrosablin-phd-98461594/);
  assert.match(heroContact, /Open to relocation/);
  assert.doesNotMatch(heroContact, /<a\s/i);
});

test("print stylesheet renders hero contact as a PDF-only column and hides duplicate contact section", () => {
  buildSite();

  const css = readStyles();

  assert.match(css, /@media print[\s\S]*\.hero-body[\s\S]*grid-template-columns:[^;]+minmax\(0, 1fr\)[^;]+;/);
  assert.match(css, /@media print[\s\S]*\.hero-contact[\s\S]*text-align:\s*right/);
  assert.match(css, /@media print[\s\S]*\.hero-contact[\s\S]*margin-top:\s*2\.65rem/);
  assert.match(css, /@media print[\s\S]*\.hero-tag[\s\S]*margin-left:\s*auto/);
  assert.match(css, /@media print[\s\S]*\.contact-section[\s\S]*display:\s*none/);
});
