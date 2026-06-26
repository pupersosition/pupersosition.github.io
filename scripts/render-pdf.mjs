import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const htmlPath = path.join(rootDir, "site", "index.html");
const pdfPath = path.join(rootDir, "site", "cv.pdf");

const pdfCss = String.raw`
  @page {
    size: A4;
    margin: 14mm 15mm 15mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 0;
    background: #ffffff !important;
    color: #1f2933;
  }

  body {
    font-family: Helvetica, Arial, sans-serif !important;
    font-size: 8.45pt;
    line-height: 1.255;
    overflow: visible;
  }

  a {
    color: #0f6b7a;
    text-decoration: none;
  }

  strong,
  b {
    color: inherit;
    font-weight: 700;
  }

  em,
  i {
    color: inherit;
    font-style: italic;
  }

  .screen-noise,
  .cursor-swarm,
  .codefield,
  .code-shroud,
  .hero-top,
  .contact-section {
    display: none !important;
  }

  .cv-shell {
    position: static;
    z-index: auto;
    width: 100%;
    margin: 0;
    border: 0;
    background: #ffffff;
    box-shadow: none;
  }

  .section {
    padding: 0;
    border-bottom: 0;
  }

  .hero {
    padding-bottom: 7px;
    border-bottom: 1.2pt solid #0f6b7a;
    margin-bottom: 10px;
    width: calc(100% - 2mm);
  }

  .hero-body {
    display: grid;
    grid-template-columns: 91mm minmax(0, 1fr);
    column-gap: 0;
    align-items: start;
  }

  .hero-summary h1 {
    margin: 0 0 6px;
    font-size: 24pt;
    line-height: 1.125;
    font-weight: 700;
    letter-spacing: 0;
    color: #1f2933;
  }

  .subtitle {
    max-width: 82mm;
    margin: 0;
    color: #5b6770;
    font-size: 9.8pt;
    line-height: 1.35;
    text-align: left;
  }

  .hero-contact {
    padding-top: 10px;
    text-align: right;
  }

  .hero-contact-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hero-contact-list li,
  .hero-tag {
    margin: 0;
    padding-left: 0;
    color: #5b6770;
    font-size: 8.6pt;
    line-height: 1.3;
    letter-spacing: 0;
    text-transform: none;
    opacity: 1;
  }

  .hero-contact-list li::before {
    display: none;
  }

  .hero-contact-label {
    color: #0f6b7a;
    font-weight: 700;
  }

  .hero-tag {
    margin-top: 5px;
    padding: 0;
    border: 0;
    color: #0f6b7a;
    font-weight: 700;
  }

  h2 {
    margin: 0 0 7px;
    color: #0f6b7a;
    font-size: 10.5pt;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  h3 {
    margin: 15px 0 4px;
    color: #1f2933;
    font-size: 12.2pt;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: 0;
  }

  .role:first-of-type h3 {
    margin-top: 0;
  }

  .role-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 74mm;
    align-items: baseline;
    gap: 0;
    margin-top: 0;
    margin-right: 3mm;
    padding-top: 0;
    padding-bottom: 2px;
    border-bottom: 0.25pt solid #eef2f4;
  }

  .role-header-marker {
    display: none;
  }

  .role-title {
    color: #1f2933;
    font-size: 9.7pt;
    line-height: 1.2;
    font-weight: 700;
  }

  .role-title::after {
    display: none !important;
    content: none !important;
  }

  .role-details {
    color: #0f6b7a;
    font-size: 9pt;
    line-height: 1.2;
    font-weight: 700;
    text-align: right;
  }

  .role-tags {
    margin-top: 10px;
    margin-bottom: 10px;
    margin-right: 0;
    margin-left: 0;
    color: #5b6770;
    font-size: 7.7pt;
    line-height: 1.1;
    font-style: normal;
  }

  .role-tag-group {
    display: block;
    margin: 0;
  }

  .role-tag-label {
    display: inline;
    color: #0f6b7a;
    font-weight: 700;
  }

  .role-tag-label::after {
    content: ": ";
  }

  .role-tag-items {
    display: inline;
    font-style: normal;
  }

  .role-tag {
    display: inline;
    padding: 0;
    border: 0;
    background: transparent;
    font-style: normal;
    white-space: normal;
  }

  .role-tag:not(:last-child)::after {
    content: ", ";
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    margin: 0 14mm 6px 10mm;
    padding-left: 5mm;
    color: #1f2933;
    font-size: 8.45pt;
    line-height: 1.255;
    text-align: justify;
  }

  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.43em;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #0f6b7a;
  }

  .role + .role {
    margin-top: 0;
  }

  .role-header:not(:first-child) {
    margin-top: 11px;
  }

  .pdf-page-start {
    break-before: page;
  }

  .role {
    break-inside: auto;
  }

  .role h3,
  .role-header,
  .role-tags {
    break-after: avoid;
  }

  .grid-two {
    display: grid;
    grid-template-columns: 96mm 72mm;
    column-gap: 0;
    margin-top: 9px;
    margin-right: 3mm;
    padding-top: 7px;
    border-top: 0.8pt solid #ccd5db;
  }

  .grid-two h2 {
    margin-bottom: 7px;
  }

  .grid-two li {
    margin-right: 4mm;
    text-align: left;
  }

  .pdf-technologies {
    margin-top: 9px;
    margin-right: 3mm;
    padding-top: 7px;
    border-top: 0.8pt solid #ccd5db;
  }

  .pdf-technologies ul {
    padding: 6px 6px 5px;
    border: 0.25pt solid #ccd5db;
    background: #e7f3f5;
  }

  .pdf-technologies li {
    margin-right: 2mm;
    text-align: left;
  }

  .pdf-hobbies {
    margin-top: 9px;
    margin-right: 3mm;
    padding-top: 7px;
    border-top: 0.8pt solid #ccd5db;
  }

  .pdf-hobbies li {
    text-align: left;
  }
`;

async function main() {
  await access(htmlPath);

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1810, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url)) {
        request.abort();
        return;
      }
      request.continue();
    });

    const url = `${pathToFileURL(htmlPath).href}?pdf=1`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: pdfCss });
    await page.evaluate(() => {
      for (const section of document.querySelectorAll("main.cv-shell > section")) {
        const title = section.querySelector("h2")?.textContent?.trim();
        if (title === "Technologies") {
          section.classList.add("pdf-technologies");
        }
        if (title === "Current Hobbies") {
          section.classList.add("pdf-hobbies");
        }
      }

      for (const item of document.querySelectorAll(".hero-contact-list li")) {
        if (/linkedin\.com/i.test(item.textContent || "")) {
          const label = item.querySelector(".hero-contact-label");
          label?.remove();
        }
      }

      for (const header of document.querySelectorAll(".role-header")) {
        const title = header.querySelector(".role-title")?.textContent?.trim();
        if (title === "Python Developer / Machine Learning Engineer") {
          header.classList.add("pdf-page-start");
        }
      }
    });

    await page.emulateMediaType("print");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width: calc(100% - 30mm); margin: 0 15mm; font-family: Helvetica, Arial, sans-serif; font-size: 7pt; color: #5b6770;">
          <div style="border-top: 0.3pt solid #ccd5db; padding-top: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>Nikita Vostrosablin | CV</span>
            <span>Page <span class="pageNumber"></span></span>
          </div>
        </div>
      `
    });

    process.stdout.write(`Generated ${path.relative(rootDir, pdfPath)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
