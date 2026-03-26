import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "content", "cv.md");
const outputPath = path.join(rootDir, "site", "index.html");
const assetVersion = "20260326-2";

async function main() {
  const source = await readFile(sourcePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(source);
  const documentAst = parseDocument(body);
  const html = renderPage(frontmatter, documentAst);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${html}\n`, "utf8");

  process.stdout.write(`Compiled ${path.relative(rootDir, outputPath)} from ${path.relative(rootDir, sourcePath)}\n`);
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

    if (options.roleMode && lines[index].startsWith("##### ")) {
      blocks.push({
        type: "subsection",
        text: lines[index].slice(6).trim()
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
    const subItems = [];
    index += 1;

    while (index < lines.length) {
      if (isBlank(lines[index]) || isSectionBoundary(lines[index], options.insideColumns)) {
        break;
      }

      if (
        options.roleMode &&
        (lines[index].startsWith("### ") || lines[index].startsWith("#### ") || lines[index].startsWith("##### "))
      ) {
        break;
      }

      if (lines[index].startsWith("- ")) {
        break;
      }

      const nestedMatch = lines[index].match(/^\s{2,}-\s+(.+)$/);
      if (nestedMatch) {
        subItems.push(nestedMatch[1].trim());
        index += 1;
        continue;
      }

      if (!/^\s{2,}\S/.test(lines[index]) && !/^\t/.test(lines[index])) {
        break;
      }

      fragments.push(lines[index].trim());
      index += 1;
    }

    items.push({ text: fragments.join("\n"), subItems });

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

    if (
      options.roleMode &&
      (lines[index].startsWith("### ") || lines[index].startsWith("#### ") || lines[index].startsWith("##### "))
    ) {
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

function renderPage(frontmatter, blocks) {
  const promptPrefix = frontmatter.promptPrefix || "";
  const promptCommand = frontmatter.promptCommand || "";
  const promptPrefixHtml = promptPrefix ? `${escapeHtml(promptPrefix)} ` : "";

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
    <link rel="stylesheet" href="./styles.css?v=${assetVersion}" />
  </head>
  <body>
    <div class="screen-noise" aria-hidden="true"></div>
    <canvas id="cursor-swarm" class="cursor-swarm" aria-hidden="true"></canvas>
    <div id="codefield" class="codefield" aria-hidden="true"></div>
    <div class="code-shroud" aria-hidden="true"></div>
    <main class="cv-shell">
      <header class="hero section">
        <div class="hero-top">
          <p class="prompt" data-command="${escapeAttribute(promptCommand)}">${promptPrefixHtml}<span id="typed-command"></span></p>
          <div class="hero-actions">
            <a id="export-pdf" class="export-pdf" href="./cv.pdf" target="_blank" rel="noopener">Export PDF</a>
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

function renderTopLevelBlock(block) {
  if (block.type === "columns") {
    return `      <section class="section grid-two">
${block.sections.map((section) => renderColumn(section)).join("\n")}
      </section>`;
  }

  if (block.type === "experience") {
    return `      <section class="section">
        <h2>${escapeHtml(block.title)}</h2>

${block.roles.map(renderRole).join("\n\n")}
      </section>`;
  }

  return `      <section class="section">
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

      if (block.type === "subsection") {
        return `          <h4 class="role-subsection">${renderInline(block.text)}</h4>`;
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
${items
  .map((item) => {
    if (typeof item === "string") {
      return `${indent}  <li>${renderInline(item)}</li>`;
    }

    const nestedHtml = item.subItems.length
      ? `\n${indent}    <ul>\n${item.subItems
          .map((subItem) => `${indent}      <li>${renderInline(subItem)}</li>`)
          .join("\n")}\n${indent}    </ul>`
      : "";

    return `${indent}  <li>${renderInline(item.text)}${nestedHtml}</li>`;
  })
  .join("\n")}
${indent}</ul>`;
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
