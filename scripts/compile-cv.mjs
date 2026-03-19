import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const siteDir = path.join(rootDir, "site");
const sourcePath = path.join(rootDir, "content", "cv.md");
const webOutputPath = path.join(siteDir, "index.html");
const pdfStylesPath = path.join(siteDir, "pdf.css");
const assetVersion = "20260320-2";

async function main() {
  const source = await readFile(sourcePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(source);
  const documentAst = parseDocument(body);
  const pdfFileName = createPdfFileName(frontmatter);
  const pdfSourceFileName = pdfFileName.replace(/\.pdf$/i, ".print.html");
  const pdfOutputPath = path.join(siteDir, pdfFileName);
  const pdfSourcePath = path.join(siteDir, pdfSourceFileName);
  const html = renderPage(frontmatter, documentAst, { pdfFileName });
  const pdfHtml = renderPdfPage(frontmatter, documentAst);

  await mkdir(path.dirname(webOutputPath), { recursive: true });
  await writeFile(webOutputPath, `${html}\n`, "utf8");
  await writeFile(pdfSourcePath, `${pdfHtml}\n`, "utf8");
  await renderPreparedPdf(pdfSourcePath, pdfOutputPath);

  process.stdout.write(
    `Compiled ${path.relative(rootDir, webOutputPath)}, ${path.relative(rootDir, pdfSourcePath)}, and ${path.relative(rootDir, pdfOutputPath)} from ${path.relative(rootDir, sourcePath)}\n`
  );
}

function splitFrontmatter(source) {
  const normalized = normalizeLineEndings(source);

  if (!normalized.startsWith("---\n")) {
    throw new Error("The markdown file must start with frontmatter delimited by ---");
  }

  const endMarker = "\n---\n";
  const endIndex = normalized.indexOf(endMarker, 4);
  if (endIndex === -1) {
    throw new Error("Could not find the closing frontmatter delimiter");
  }

  const frontmatterBlock = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + endMarker.length);
  const frontmatter = {};

  for (const rawLine of frontmatterBlock.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid frontmatter line: ${rawLine}`);
    }

    const [, key, value] = match;
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function parseDocument(body) {
  const lines = normalizeLineEndings(stripHtmlComments(body)).split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1;
      continue;
    }

    if (lines[index].trim() === "::: columns") {
      const result = parseColumns(lines, index);
      blocks.push(result.block);
      index = result.index;
      continue;
    }

    if (lines[index].startsWith("## ")) {
      const result = parseSection(lines, index, { insideColumns: false });
      blocks.push(result.block);
      index = result.index;
      continue;
    }

    throw new Error(`Unexpected content at line ${index + 1}: ${lines[index]}`);
  }

  return blocks;
}

function parseColumns(lines, startIndex) {
  let index = startIndex + 1;
  const sections = [];

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1;
      continue;
    }

    if (lines[index].trim() === ":::") {
      return {
        block: { type: "columns", sections },
        index: index + 1
      };
    }

    if (!lines[index].startsWith("## ")) {
      throw new Error(`Expected a ## section inside columns at line ${index + 1}`);
    }

    const result = parseSection(lines, index, { insideColumns: true });
    sections.push(result.block);
    index = result.index;
  }

  throw new Error("Unclosed ::: columns block");
}

function parseSection(lines, startIndex, options) {
  const title = lines[startIndex].slice(3).trim();
  let index = startIndex + 1;

  if (title === "Experience") {
    const roles = [];

    while (index < lines.length) {
      if (isBlank(lines[index])) {
        index += 1;
        continue;
      }

      if (isSectionBoundary(lines[index], options.insideColumns)) {
        break;
      }

      if (!lines[index].startsWith("### ")) {
        throw new Error(`Expected a ### role heading in Experience at line ${index + 1}`);
      }

      const result = parseRole(lines, index, options.insideColumns);
      roles.push(result.block);
      index = result.index;
    }

    return {
      block: { type: "experience", title, roles },
      index
    };
  }

  const content = parseContentBlocks(lines, index, {
    insideColumns: options.insideColumns,
    stopAtRoleHeading: true,
    stopAtMetaHeading: true
  });

  return {
    block: { type: "section", title, blocks: content.blocks },
    index: content.index
  };
}

function parseRole(lines, startIndex, insideColumns) {
  const company = lines[startIndex].slice(4).trim();
  const content = parseContentBlocks(lines, startIndex + 1, {
    insideColumns,
    stopAtRoleHeading: false,
    stopAtMetaHeading: false,
    roleMode: true
  });

  return {
    block: { type: "role", company, blocks: content.blocks },
    index: content.index
  };
}

function parseContentBlocks(lines, startIndex, options) {
  const blocks = [];
  let index = startIndex;

  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1;
      continue;
    }

    if (isSectionBoundary(lines[index], options.insideColumns)) {
      break;
    }

    if (options.roleMode && lines[index].startsWith("### ")) {
      break;
    }

    if (options.roleMode && lines[index].startsWith("#### ")) {
      blocks.push({
        type: "meta",
        text: lines[index].slice(5).trim()
      });
      index += 1;
      continue;
    }

    if (lines[index].startsWith("- ")) {
      const result = parseList(lines, index, options);
      blocks.push(result.block);
      index = result.index;
      continue;
    }

    const result = parseParagraph(lines, index, options);
    blocks.push(result.block);
    index = result.index;
  }

  return { blocks, index };
}

function parseList(lines, startIndex, options) {
  const items = [];
  let index = startIndex;

  while (index < lines.length && lines[index].startsWith("- ")) {
    const fragments = [lines[index].slice(2).trim()];
    index += 1;

    while (index < lines.length) {
      if (isBlank(lines[index]) || isSectionBoundary(lines[index], options.insideColumns)) {
        break;
      }

      if (options.roleMode && (lines[index].startsWith("### ") || lines[index].startsWith("#### "))) {
        break;
      }

      if (lines[index].startsWith("- ")) {
        break;
      }

      if (!/^\s{2,}\S/.test(lines[index]) && !/^\t/.test(lines[index])) {
        break;
      }

      fragments.push(lines[index].trim());
      index += 1;
    }

    items.push(fragments.join("\n"));

    while (index < lines.length && isBlank(lines[index])) {
      index += 1;
      if (index < lines.length && lines[index].startsWith("- ")) {
        break;
      }
      if (index < lines.length && !isBlank(lines[index])) {
        index -= 1;
        break;
      }
    }
  }

  return {
    block: { type: "list", items },
    index
  };
}

function parseParagraph(lines, startIndex, options) {
  const fragments = [];
  let index = startIndex;

  while (index < lines.length) {
    if (isBlank(lines[index]) || isSectionBoundary(lines[index], options.insideColumns)) {
      break;
    }

    if (options.roleMode && (lines[index].startsWith("### ") || lines[index].startsWith("#### "))) {
      break;
    }

    if (lines[index].startsWith("- ")) {
      break;
    }

    fragments.push(lines[index].trim());
    index += 1;
  }

  return {
    block: { type: "paragraph", text: fragments.join(" ") },
    index
  };
}

function renderPage(frontmatter, blocks, options) {
  const promptPrefix = frontmatter.promptPrefix || "";
  const promptCommand = frontmatter.promptCommand || "";
  const promptPrefixHtml = promptPrefix ? `${escapeHtml(promptPrefix)} ` : "";
  const pdfFileName = options.pdfFileName;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(frontmatter.pageTitle || "CV")}</title>
    <meta
      name="description"
      content="${escapeAttribute(frontmatter.description || "")}"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <script>
      (() => {
        const key = "cv-theme";
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        try {
          const storedTheme = localStorage.getItem(key);
          document.documentElement.dataset.theme =
            storedTheme === "dark" || storedTheme === "light"
              ? storedTheme
              : prefersDark
                ? "dark"
                : "light";
        } catch {
          document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
        }
      })();
    </script>
    <link rel="stylesheet" href="./styles.css?v=${assetVersion}" />
  </head>
  <body>
    <div class="screen-noise" aria-hidden="true"></div>
    <canvas id="cursor-swarm" class="cursor-swarm" aria-hidden="true"></canvas>
    <div id="codefield" class="codefield" aria-hidden="true"></div>
    <div class="code-shroud" aria-hidden="true"></div>
    <main class="cv-shell">
      <header class="hero section reveal">
        <div class="hero-top">
          <p class="prompt" data-command="${escapeAttribute(promptCommand)}">${promptPrefixHtml}<span id="typed-command"></span></p>
          <div class="hero-actions">
            <button
              id="export-pdf"
              class="export-pdf"
              type="button"
              data-pdf-href="./${escapeAttribute(pdfFileName)}"
              data-pdf-filename="${escapeAttribute(pdfFileName)}"
            >
              Download PDF
            </button>
            <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle color theme">
              <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="2" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"></line>
                <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"></line>
                <line x1="16.95" y1="7.05" x2="19.07" y2="4.93"></line>
                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"></line>
              </svg>
              <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z"></path>
              </svg>
            </button>
          </div>
        </div>
        <h1>${escapeHtml(frontmatter.name || "")}</h1>
        <p class="subtitle">${escapeHtml(frontmatter.subtitle || "")}</p>
        <p class="location">${escapeHtml(frontmatter.location || "")}</p>
      </header>
${blocks.map(renderTopLevelBlock).join("\n")}
    </main>

    <script src="./script.js?v=${assetVersion}"></script>
  </body>
</html>`;
}

function renderPdfPage(frontmatter, blocks) {
  const pdfSections = planPdfSections(blocks);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(frontmatter.pageTitle || "CV")} PDF</title>
    <meta
      name="description"
      content="${escapeAttribute(frontmatter.description || "")}"
    />
    <link rel="stylesheet" href="./${path.basename(pdfStylesPath)}?v=${assetVersion}" />
  </head>
  <body>
    <main class="pdf-page">
      <header class="pdf-header">
        <div>
          <p class="pdf-eyebrow">Curriculum Vitae</p>
          <h1>${escapeHtml(frontmatter.name || "")}</h1>
          <p class="pdf-subtitle">${escapeHtml(frontmatter.subtitle || "")}</p>
          <p class="pdf-location">${escapeHtml(frontmatter.location || "")}</p>
        </div>
        ${pdfSections.contact ? renderPdfContact(pdfSections.contact) : ""}
      </header>

      <section class="pdf-overview">
        ${
          pdfSections.summary.length
            ? `<div class="pdf-card-grid">
${pdfSections.summary.map((section) => renderPdfSummaryCard(section)).join("\n")}
          </div>`
            : '<div class="pdf-card-grid pdf-card-grid--empty"></div>'
        }
        ${
          pdfSections.highlights
            ? renderPdfHighlights(pdfSections.highlights)
            : ""
        }
      </section>

      <section class="pdf-content">
        <div class="pdf-main">
          ${pdfSections.experience ? renderPdfExperience(pdfSections.experience) : ""}
${pdfSections.mainSections.map((section) => renderPdfContentSection(section)).join("\n")}
        </div>
        <aside class="pdf-sidebar">
${pdfSections.sidebarSections.map((section) => renderPdfSidebarSection(section)).join("\n")}
        </aside>
      </section>
    </main>
  </body>
</html>`;
}

function renderTopLevelBlock(block) {
  if (block.type === "columns") {
    return `      <section class="section reveal grid-two">
${block.sections.map((section) => renderColumn(section)).join("\n")}
      </section>`;
  }

  if (block.type === "experience") {
    return `      <section class="section reveal">
        <h2>${escapeHtml(block.title)}</h2>

${block.roles.map(renderRole).join("\n\n")}
      </section>`;
  }

  return `      <section class="section reveal">
        <h2>${escapeHtml(block.title)}</h2>
${renderGenericBlocks(block.blocks, "        ")}
      </section>`;
}

function renderColumn(section) {
  return `        <div>
          <h2>${escapeHtml(section.title)}</h2>
${renderGenericBlocks(section.blocks, "          ")}
        </div>`;
}

function renderRole(role) {
  return `        <article class="role">
          <h3>${escapeHtml(role.company)}</h3>
${renderRoleBlocks(role.blocks)}
        </article>`;
}

function renderRoleBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === "meta") {
        return `          <p class="meta">${renderInline(block.text)}</p>`;
      }

      if (block.type === "paragraph") {
        return `          <p>${renderInline(block.text)}</p>`;
      }

      if (block.type === "list") {
        return renderList(block.items, "          ");
      }

      throw new Error(`Unsupported role block type: ${block.type}`);
    })
    .join("\n");
}

function renderGenericBlocks(blocks, indent) {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return `${indent}<p>${renderInline(block.text)}</p>`;
      }

      if (block.type === "list") {
        return renderList(block.items, indent);
      }

      throw new Error(`Unsupported block type: ${block.type}`);
    })
    .join("\n");
}

function renderList(items, indent) {
  return `${indent}<ul>
${items.map((item) => `${indent}  <li>${renderInline(item)}</li>`).join("\n")}
${indent}</ul>`;
}

function planPdfSections(blocks) {
  const sections = flattenSections(blocks);
  const take = (title, type = "section") => {
    const index = sections.findIndex((section) => section.type === type && section.title === title);

    if (index === -1) {
      return null;
    }

    return sections.splice(index, 1)[0];
  };

  const contact = take("Contact");
  const topSkills = take("Top Skills");
  const experience = take("Experience", "experience");
  const education = take("Education");
  const languages = take("Languages");
  const certifications = take("Certifications");
  const publications = take("Selected Publications");
  const summary = [topSkills].filter(Boolean);
  const sidebarSections = [education, languages, certifications, publications].filter(Boolean);
  const mainSections = sections.filter((section) => section.type === "section");
  const highlights = mainSections.shift() || buildPdfHighlightsSection(experience);

  return {
    contact,
    experience,
    highlights,
    summary,
    mainSections,
    sidebarSections
  };
}

function flattenSections(blocks) {
  const sections = [];

  for (const block of blocks) {
    if (block.type === "columns") {
      sections.push(...block.sections);
      continue;
    }

    sections.push(block);
  }

  return sections;
}

function renderPdfContact(section) {
  return `        <div class="pdf-contact">
          <p class="pdf-contact-label">${escapeHtml(section.title)}</p>
${renderPdfList(section.blocks[0]?.items || [], "          ", "pdf-contact-list")}
        </div>`;
}

function renderPdfSummaryCard(section) {
  return `            <section class="pdf-card">
              <p class="pdf-card-label">${escapeHtml(section.title)}</p>
${renderPdfBlocks(section.blocks, "              ")}
            </section>`;
}

function renderPdfHighlights(section) {
  return `        <section class="pdf-card">
          <p class="pdf-card-label">${escapeHtml(section.title)}</p>
${renderPdfBlocks(section.blocks, "          ")}
        </section>`;
}

function buildPdfHighlightsSection(experience) {
  if (!experience) {
    return null;
  }

  const lead = findFirstParagraph(experience.roles);
  const items = collectHighlightItems(experience.roles);
  const blocks = [];

  if (lead) {
    blocks.push({
      type: "paragraph",
      text: lead
    });
  }

  if (items.length) {
    blocks.push({
      type: "list",
      items
    });
  }

  if (!blocks.length) {
    return null;
  }

  return {
    type: "section",
    title: "Professional Focus",
    blocks
  };
}

function findFirstParagraph(roles) {
  for (const role of roles) {
    for (const block of role.blocks) {
      if (block.type === "paragraph") {
        return block.text;
      }
    }
  }

  return "";
}

function collectHighlightItems(roles) {
  const seen = new Set();
  const items = [];

  for (const role of roles) {
    for (const block of role.blocks) {
      if (block.type !== "list") {
        continue;
      }

      for (const item of block.items) {
        const key = item.toLowerCase();

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        items.push(item);

        if (items.length === 3) {
          return items;
        }
      }
    }
  }

  return items;
}

function renderPdfExperience(block) {
  return `          <section class="pdf-section pdf-section--experience">
            <h2>${escapeHtml(block.title)}</h2>
${block.roles.map((role) => renderPdfRole(role)).join("\n")}
          </section>`;
}

function renderPdfRole(role) {
  const entries = groupRoleEntries(role.blocks);

  return `            <article class="pdf-role">
              <h3 class="pdf-company">${escapeHtml(role.company)}</h3>
${entries.map((entry) => renderPdfRoleEntry(entry)).join("\n")}
            </article>`;
}

function groupRoleEntries(blocks) {
  const entries = [];
  let current = null;

  for (const block of blocks) {
    if (block.type === "meta") {
      if (current) {
        entries.push(current);
      }

      current = {
        meta: block.text,
        blocks: []
      };
      continue;
    }

    if (!current) {
      current = { meta: "", blocks: [] };
    }

    current.blocks.push(block);
  }

  if (current) {
    entries.push(current);
  }

  return entries;
}

function renderPdfRoleEntry(entry) {
  const meta = splitMeta(entry.meta);

  return `              <section class="pdf-role-entry">
                <div class="pdf-role-meta">
                  <div>
                    <p class="pdf-role-title">${escapeHtml(meta.title)}</p>
                    ${meta.location ? `<p class="pdf-role-location">${escapeHtml(meta.location)}</p>` : ""}
                  </div>
                  ${meta.period ? `<p class="pdf-role-period">${escapeHtml(meta.period)}</p>` : ""}
                </div>
${renderPdfBlocks(entry.blocks, "                ")}
              </section>`;
}

function splitMeta(value) {
  const parts = value.split("|").map((part) => part.trim()).filter(Boolean);

  return {
    title: parts[0] || "",
    period: parts[1] || "",
    location: parts.slice(2).join(" | ")
  };
}

function renderPdfContentSection(section) {
  return `          <section class="pdf-section">
            <h2>${escapeHtml(section.title)}</h2>
${renderPdfBlocks(section.blocks, "            ")}
          </section>`;
}

function renderPdfSidebarSection(section) {
  return `          <section class="pdf-section pdf-section--sidebar">
            <h2>${escapeHtml(section.title)}</h2>
${renderPdfBlocks(section.blocks, "            ")}
          </section>`;
}

function renderPdfBlocks(blocks, indent) {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return `${indent}<p class="pdf-paragraph">${renderInline(block.text)}</p>`;
      }

      if (block.type === "list") {
        return renderPdfList(block.items, indent, "pdf-list");
      }

      throw new Error(`Unsupported PDF block type: ${block.type}`);
    })
    .join("\n");
}

function renderPdfList(items, indent, className) {
  return `${indent}<ul class="${className}">
${items.map((item) => `${indent}  <li>${renderInline(item)}</li>`).join("\n")}
${indent}</ul>`;
}

async function renderPreparedPdf(inputPath, outputPath) {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: "load" });
    await page.emulateMediaType("print");
    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }
}

function createPdfFileName(frontmatter) {
  const explicit = sanitizePdfFileName(frontmatter.pdfFileName || "");

  if (explicit) {
    return explicit;
  }

  const base = slugify(frontmatter.name || "cv").replace(/-phd\b/, "");
  return `${base || "cv"}-cv.pdf`;
}

function sanitizePdfFileName(value) {
  const normalized = value
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");

  return normalized ? `${normalized}.pdf` : "";
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function renderInline(text, options = {}) {
  const { allowLinks = true } = options;
  const breakToken = "__CV_BREAK__";
  let output = text.replace(/<br\s*\/?>/gi, breakToken);
  output = escapeHtml(output);

  if (allowLinks) {
    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const href = escapeAttribute(url.trim());
      const linkText = renderInline(label, { allowLinks: false });
      const external = /^https?:\/\//i.test(url.trim());
      const attrs = external ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${href}"${attrs}>${linkText}</a>`;
    });
  }

  output = output.replace(/\*\*([^*]+)\*\*/g, (_, value) => `<strong>${renderInline(value, { allowLinks: false })}</strong>`);
  output = output.replace(new RegExp(breakToken, "g"), "<br />");
  return output;
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

function stripHtmlComments(value) {
  return value.replace(/<!--[\s\S]*?-->/g, "");
}

function isBlank(line) {
  return line.trim() === "";
}

function isSectionBoundary(line, insideColumns) {
  if (line.startsWith("## ")) {
    return true;
  }

  if (insideColumns) {
    return line.trim() === ":::";
  }

  return line.trim() === "::: columns";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
