import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

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

test("mobile role headers stack dates below readable role names", async () => {
  buildSite();

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await page.goto(pathToFileURL(path.resolve("site/index.html")).href);

    const roleHeaders = await page.$$eval(".role-header", (headers) =>
      headers.map((header) => {
        const title = header.querySelector(".role-title");
        const details = header.querySelector(".role-details");
        const titleBox = title.getBoundingClientRect();
        const detailsBox = details.getBoundingClientRect();

        return {
          title: title.textContent.trim(),
          details: details.textContent.trim(),
          titleWidth: titleBox.width,
          titleBottom: titleBox.bottom,
          detailsTop: detailsBox.top,
          detailsLeft: detailsBox.left,
          titleLeft: titleBox.left
        };
      })
    );

    for (const roleHeader of roleHeaders) {
      assert.ok(roleHeader.titleWidth > 240, `${roleHeader.title} should have a readable title column`);
      assert.ok(
        roleHeader.detailsTop >= roleHeader.titleBottom - 1,
        `${roleHeader.details} should render below ${roleHeader.title}`
      );
      assert.ok(
        Math.abs(roleHeader.detailsLeft - roleHeader.titleLeft) <= 1,
        `${roleHeader.details} should align with ${roleHeader.title}`
      );
    }
  } finally {
    await browser.close();
  }
});
