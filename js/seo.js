import { getLang, tBi } from "./i18n.js";

const SITE_ROOT = "https://kc09393.github.io/blender-node-lab/";

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.setAttribute("content", value);
}

function setAlternate(hreflang, url) {
  const el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (el) el.href = url;
}

function localizedUrls(url) {
  const zh = new URL(url);
  const en = new URL(url);
  const isStaticContent = /\/(?:learn|nodes)\/[^/]+(?:\.en)?\.html$/.test(url.pathname);
  if (isStaticContent) {
    zh.pathname = zh.pathname.replace(/\.en\.html$/, ".html");
    en.pathname = zh.pathname.replace(/\.html$/, ".en.html");
    zh.searchParams.delete("lang");
    en.searchParams.delete("lang");
  } else {
    zh.searchParams.delete("lang");
    en.searchParams.set("lang", "en");
  }
  return { zh: zh.href, en: en.href };
}

export function setPageSeo({ title, description, path, type = "website" }) {
  const resolvedTitle = typeof title === "string" ? title : tBi(title);
  const resolvedDescription = typeof description === "string" ? description : tBi(description);
  const resolvedUrl = new URL(path, SITE_ROOT);
  if (getLang() === "en" && !resolvedUrl.pathname.endsWith(".en.html")) resolvedUrl.searchParams.set("lang", "en");
  else resolvedUrl.searchParams.delete("lang");
  const url = resolvedUrl.href;

  document.title = resolvedTitle;
  setMeta('meta[name="description"]', resolvedDescription);
  setMeta('meta[property="og:title"]', resolvedTitle);
  setMeta('meta[property="og:description"]', resolvedDescription);
  setMeta('meta[property="og:type"]', type);
  setMeta('meta[property="og:url"]', url);
  setMeta('meta[name="twitter:title"]', resolvedTitle);
  setMeta('meta[name="twitter:description"]', resolvedDescription);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url;
  const alternates = localizedUrls(resolvedUrl);
  setAlternate("zh-Hant", alternates.zh);
  setAlternate("en", alternates.en);
  setAlternate("x-default", alternates.zh);
}

export function tutorialSeo(tutorial) {
  const suffix = getLang() === "en" ? "Blender 5.2 LTS Guided Tutorial" : "Blender 5.2 LTS 引導教學";
  setPageSeo({
    title: { zh: `${tutorial.name.zh} · ${suffix}`, en: `${tutorial.name.en} · ${suffix}` },
    description: tutorial.description,
    path: `learn/${encodeURIComponent(tutorial.id)}${getLang() === "en" ? ".en" : ""}.html`,
    type: "article",
  });
}

export function nodeSeo(typeDef) {
  const suffix = getLang() === "en" ? "Blender 5.2 LTS Node Encyclopedia" : "Blender 5.2 LTS 節點百科";
  setPageSeo({
    title: { zh: `${typeDef.name.zh} · ${suffix}`, en: `${typeDef.name.en} · ${suffix}` },
    description: typeDef.summary,
    path: `nodes/${encodeURIComponent(typeDef.id)}${getLang() === "en" ? ".en" : ""}.html`,
    type: "article",
  });
}
