import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tutorials from "../data/tutorials/index.js";
import { listNodeTypes } from "../js/core/nodeRegistry.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = "https://kc09393.github.io/blender-node-lab";
const generatedAt = new Date().toISOString().slice(0, 10);

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageShell({ lang, title, description, canonicalPath, alternatePath, type, body, jsonLd }) {
  const isEnglish = lang === "en";
  const homeLabel = isEnglish ? "Home" : "首頁";
  const encyclopediaLabel = isEnglish ? "Node Encyclopedia" : "節點百科";
  const tutorialsLabel = isEnglish ? "Guided Tutorials" : "引導教學";
  return `<!DOCTYPE html>
<html lang="${isEnglish ? "en" : "zh-Hant"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="theme-color" content="#1b1b1e" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${siteRoot}/${canonicalPath}" />
<meta property="og:image" content="${siteRoot}/img/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="canonical" href="${siteRoot}/${canonicalPath}" />
<link rel="alternate" hreflang="${isEnglish ? "zh-Hant" : "en"}" href="${siteRoot}/${alternatePath}" />
<link rel="alternate" hreflang="x-default" href="${siteRoot}/${canonicalPath.replace(/\.en\.html$/, ".html")}" />
<link rel="stylesheet" href="../css/theme.css" />
<link rel="stylesheet" href="../css/content-page.css" />
<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>
</head>
<body class="content-page">
  <header class="content-nav">
    <a href="../index.html">${homeLabel}</a>
    <a href="../encyclopedia.html">${encyclopediaLabel}</a>
    <a href="../tutorials.html">${tutorialsLabel}</a>
    <span>Blender 5.0</span>
  </header>
  <main class="content-main">
    ${body}
  </main>
  <footer class="content-footer">Blender Material Node Lab · Blender 5.0 · ${generatedAt}</footer>
</body>
</html>
`;
}

function tutorialPage(tutorial, lang) {
  const isEnglish = lang === "en";
  const suffix = isEnglish ? "Blender 5.0 Guided Tutorial" : "Blender 5.0 引導教學";
  const title = `${tutorial.name[lang]} · ${suffix}`;
  const description = tutorial.description[lang];
  const filename = `${tutorial.id}${isEnglish ? ".en" : ""}.html`;
  const alternate = `${tutorial.id}${isEnglish ? "" : ".en"}.html`;
  const steps = tutorial.steps.map((step, index) => `
    <section class="content-step">
      <h2>${index + 1}. ${esc(step.title?.[lang] || (isEnglish ? `Step ${index + 1}` : `步驟 ${index + 1}`))}</h2>
      <p>${esc(step.instruction?.[lang] || "").replaceAll("\n", "<br />")}</p>
    </section>`).join("");
  const body = `
    <div class="content-kicker">${suffix}</div>
    <h1>${esc(tutorial.name[lang])}</h1>
    <p class="content-lead">${esc(description)}</p>
    <div class="content-actions">
      <a class="content-primary" href="../tutorials.html?tutorial=${encodeURIComponent(tutorial.id)}${isEnglish ? "&amp;lang=en" : ""}">${isEnglish ? "Open the interactive tutorial" : "開啟互動教學"}</a>
      <a href="${alternate}">${isEnglish ? "繁體中文" : "English"}</a>
    </div>
    <div class="content-facts"><span>${esc(tutorial.level[lang])}</span><span>${tutorial.steps.length} ${isEnglish ? "steps" : "個步驟"}</span></div>
    ${steps}`;
  return {
    filename,
    html: pageShell({
      lang,
      title,
      description,
      canonicalPath: `learn/${filename}`,
      alternatePath: `learn/${alternate}`,
      type: "LearningResource",
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: tutorial.name[lang],
        description,
        inLanguage: isEnglish ? "en" : "zh-Hant",
        educationalLevel: tutorial.level[lang],
        teaches: "Blender 5.0 material nodes",
        url: `${siteRoot}/learn/${filename}`,
        isPartOf: `${siteRoot}/tutorials.html`,
      },
    }),
  };
}

function nodePage(node, lang) {
  const isEnglish = lang === "en";
  const suffix = isEnglish ? "Blender 5.0 Node Encyclopedia" : "Blender 5.0 節點百科";
  const title = `${node.name[lang]} · ${suffix}`;
  const description = node.summary[lang];
  const filename = `${node.id}${isEnglish ? ".en" : ""}.html`;
  const alternate = `${node.id}${isEnglish ? "" : ".en"}.html`;
  let activeSection = null;
  const inputRows = node.inputs.map((socket) => {
    const section = socket.section?.[lang] || socket.section?.zh || null;
    const sectionRow = section && section !== activeSection
      ? `<tr class="socket-section"><th colspan="3">${esc(section)}</th></tr>`
      : "";
    activeSection = section || activeSection;
    return `${sectionRow}<tr><td>IN</td><td>${esc(socket.label[lang] || socket.label.zh || socket.key)}</td><td>${esc(socket.type)}</td></tr>`;
  }).join("");
  const outputRows = node.outputs.map((socket) => `<tr><td>OUT</td><td>${esc(socket.label[lang] || socket.label.zh || socket.key)}</td><td>${esc(socket.type)}</td></tr>`).join("");
  const sockets = `${inputRows}${outputRows}`;
  const body = `
    <div class="content-kicker">${suffix}</div>
    <h1>${esc(node.name[lang])}</h1>
    <p class="content-lead">${esc(description)}</p>
    <div class="content-actions">
      ${node.supported === false ? "" : `<a class="content-primary" href="../sandbox.html?addNode=${encodeURIComponent(node.id)}${isEnglish ? "&amp;lang=en" : ""}">${isEnglish ? "Try it in the sandbox" : "在沙盒中試用"}</a>`}
      <a href="${alternate}">${isEnglish ? "繁體中文" : "English"}</a>
    </div>
    <section><h2>${isEnglish ? "Beginner explanation" : "新手說明"}</h2><p>${esc(node.docBeginner[lang])}</p></section>
    <section><h2>${isEnglish ? "Technical notes" : "進階說明"}</h2><p>${esc(node.docPro[lang])}</p></section>
    <section><h2>${isEnglish ? "Sockets" : "插槽"}</h2><table><thead><tr><th>${isEnglish ? "Direction" : "方向"}</th><th>${isEnglish ? "Name" : "名稱"}</th><th>${isEnglish ? "Type" : "型別"}</th></tr></thead><tbody>${sockets}</tbody></table></section>`;
  return {
    filename,
    html: pageShell({
      lang,
      title,
      description,
      canonicalPath: `nodes/${filename}`,
      alternatePath: `nodes/${alternate}`,
      type: "TechArticle",
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: node.name[lang],
        description,
        inLanguage: isEnglish ? "en" : "zh-Hant",
        about: "Blender 5.0 material nodes",
        url: `${siteRoot}/nodes/${filename}`,
        isPartOf: `${siteRoot}/encyclopedia.html`,
      },
    }),
  };
}

const learnDir = resolve(root, "learn");
const nodesDir = resolve(root, "nodes");
await rm(learnDir, { recursive: true, force: true });
await rm(nodesDir, { recursive: true, force: true });
await mkdir(learnDir, { recursive: true });
await mkdir(nodesDir, { recursive: true });

const sitemapUrls = [
  ["", "weekly", "1.0"],
  ["tutorials.html", "weekly", "0.9"],
  ["encyclopedia.html", "weekly", "0.9"],
  ["sandbox.html", "monthly", "0.8"],
  ["reference.html", "monthly", "0.6"],
  ["troubleshoot.html", "monthly", "0.6"],
];
for (const [path, changefreq, priority] of [...sitemapUrls]) {
  const separator = path.includes("?") ? "&" : "?";
  sitemapUrls.push([`${path}${separator}lang=en`, changefreq, String(Math.max(Number(priority) - 0.1, 0.5))]);
}

for (const tutorial of tutorials) {
  for (const lang of ["zh", "en"]) {
    const page = tutorialPage(tutorial, lang);
    await writeFile(resolve(learnDir, page.filename), page.html, "utf8");
    sitemapUrls.push([`learn/${page.filename}`, "monthly", lang === "zh" ? "0.8" : "0.7"]);
  }
}

for (const node of listNodeTypes()) {
  for (const lang of ["zh", "en"]) {
    const page = nodePage(node, lang);
    await writeFile(resolve(nodesDir, page.filename), page.html, "utf8");
    sitemapUrls.push([`nodes/${page.filename}`, "monthly", lang === "zh" ? "0.8" : "0.7"]);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(([path, changefreq, priority]) => `  <url><loc>${siteRoot}/${path}</loc><lastmod>${generatedAt}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;
await writeFile(resolve(root, "sitemap.xml"), sitemap, "utf8");

console.log(`Generated ${tutorials.length * 2} tutorial pages, ${listNodeTypes().length * 2} node pages, and ${sitemapUrls.length} sitemap URLs.`);
