import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tutorials from "../data/tutorials/index.js";
import { learningActivities } from "../data/learningActivities.js";
import { listNodeTypes } from "../js/core/nodeRegistry.js";
import { nodeFidelity } from "../js/core/nodeFidelity.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = "https://kc09393.github.io/blender-node-lab";
const blenderVersion = "5.2 LTS";
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
    <span>Blender ${blenderVersion}</span>
  </header>
  <main class="content-main">
    ${body}
  </main>
  <footer class="content-footer">Blender Material Node Lab · Blender ${blenderVersion} · ${generatedAt}</footer>
</body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function tutorialPage(tutorial, lang) {
  const isEnglish = lang === "en";
  const suffix = isEnglish ? `Blender ${blenderVersion} Guided Tutorial` : `Blender ${blenderVersion} 引導教學`;
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
        teaches: `Blender ${blenderVersion} material nodes`,
        url: `${siteRoot}/learn/${filename}`,
        isPartOf: `${siteRoot}/tutorials.html`,
      },
    }),
  };
}

function nodePage(node, lang) {
  const isEnglish = lang === "en";
  const suffix = isEnglish ? `Blender ${blenderVersion} Node Encyclopedia` : `Blender ${blenderVersion} 節點百科`;
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
    <section><h2>${isEnglish ? "Blender compatibility" : "Blender 相容程度"}</h2><p>${esc(nodeFidelity(node, lang))}</p></section>
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
        about: `Blender ${blenderVersion} material nodes`,
        url: `${siteRoot}/nodes/${filename}`,
        isPartOf: `${siteRoot}/encyclopedia.html`,
      },
    }),
  };
}

function activityPage(activity, lang) {
  const isEnglish = lang === "en";
  const kind = activity.kind === "debug"
    ? (isEnglish ? "Blender Material Debug Lab" : "Blender 材質除錯實驗")
    : (isEnglish ? "Blender Material Challenge" : "Blender 材質實戰挑戰");
  const title = `${activity.name[lang]} · ${kind}`;
  const description = activity.description[lang];
  const filename = `${activity.id}${isEnglish ? ".en" : ""}.html`;
  const alternate = `${activity.id}${isEnglish ? "" : ".en"}.html`;
  const hints = (activity.hints || []).map((hint, index) => `<li><strong>${isEnglish ? `Hint ${index + 1}` : `提示 ${index + 1}`}：</strong>${esc(hint[lang])}</li>`).join("");
  const body = `
    <div class="content-kicker">${kind}</div>
    <h1>${esc(activity.name[lang])}</h1>
    <p class="content-lead">${esc(description)}</p>
    <div class="content-actions">
      <a class="content-primary" href="../tutorials.html?activity=${encodeURIComponent(activity.id)}${isEnglish ? "&amp;lang=en" : ""}">${isEnglish ? "Open the interactive activity" : "開啟互動實作"}</a>
      <a href="${alternate}">${isEnglish ? "繁體中文" : "English"}</a>
    </div>
    <section><h2>${isEnglish ? "Goal" : "實作目標"}</h2><p>${esc(activity.objective[lang])}</p></section>
    <section><h2>${isEnglish ? "Progressive hints" : "漸進提示"}</h2><ol>${hints}</ol></section>
    <section><h2>${isEnglish ? "How to use this lab" : "如何使用這個實驗"}</h2><p>${isEnglish ? "Try the graph without revealing every hint. The interactive checker verifies the required node structure and values, then lets you compare your result with the reference graph." : "先不要一次展開所有提示，自己完成節點圖。互動檢查會驗證必要結構與數值，最後可以和參考節點圖比較。"}</p></section>`;
  return {
    filename,
    html: pageShell({
      lang,
      title,
      description,
      canonicalPath: `practice/${filename}`,
      alternatePath: `practice/${alternate}`,
      type: "LearningResource",
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: activity.name[lang],
        description,
        inLanguage: isEnglish ? "en" : "zh-Hant",
        educationalLevel: activity.level[lang],
        learningResourceType: activity.kind === "debug" ? "debugging lab" : "practice challenge",
        teaches: activity.objective[lang],
        url: `${siteRoot}/practice/${filename}`,
        isPartOf: `${siteRoot}/tutorials.html`,
      },
    }),
  };
}

const learnDir = resolve(root, "learn");
const nodesDir = resolve(root, "nodes");
const practiceDir = resolve(root, "practice");
await rm(learnDir, { recursive: true, force: true });
await rm(nodesDir, { recursive: true, force: true });
await rm(practiceDir, { recursive: true, force: true });
await mkdir(learnDir, { recursive: true });
await mkdir(nodesDir, { recursive: true });
await mkdir(practiceDir, { recursive: true });

const sitemapUrls = [
  ["", "weekly", "1.0"],
  ["tutorials.html", "weekly", "0.9"],
  ["encyclopedia.html", "weekly", "0.9"],
  ["sandbox.html", "monthly", "0.8"],
  ["reference.html", "monthly", "0.6"],
  ["troubleshoot.html", "monthly", "0.6"],
  ["validation.html", "monthly", "0.8"],
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

for (const activity of learningActivities) {
  for (const lang of ["zh", "en"]) {
    const page = activityPage(activity, lang);
    await writeFile(resolve(practiceDir, page.filename), page.html, "utf8");
    sitemapUrls.push([`practice/${page.filename}`, "monthly", lang === "zh" ? "0.8" : "0.7"]);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(([path, changefreq, priority]) => `  <url><loc>${siteRoot}/${path}</loc><lastmod>${generatedAt}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n")}
</urlset>
`;
await writeFile(resolve(root, "sitemap.xml"), sitemap, "utf8");

console.log(`Generated ${tutorials.length * 2} tutorial pages, ${listNodeTypes().length * 2} node pages, ${learningActivities.length * 2} practice pages, and ${sitemapUrls.length} sitemap URLs.`);
