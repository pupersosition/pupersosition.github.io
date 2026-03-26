import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const htmlPath = path.join(rootDir, "site", "index.html");
const pdfPath = path.join(rootDir, "site", "cv.pdf");

async function main() {
  await access(htmlPath);

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1810, deviceScaleFactor: 1 });
    const url = `${pathToFileURL(htmlPath).href}?pdf=1`;
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    await page.emulateMediaType("print");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
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
