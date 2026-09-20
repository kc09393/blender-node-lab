// 極輕量雙語切換：文字字典 + 套用到 data-i18n / data-i18n-placeholder 屬性。
// 節點資料本身（data/nodes/*.js）用 {zh,en} 物件，不透過這裡的字典，見 nodeRegistry.js 的 t() helper。
const STORAGE_KEY = "bml_lang";

const DICT = {
  "meta.index.title": { zh: "Blender 材質節點｜從 0 基礎到專業", en: "Blender Material Nodes | From Beginner to Pro" },
  "meta.index.description": {
    zh: "免費的 Blender 5.2 LTS 材質節點學習網站：節點百科、互動沙盒與逐步教學，中英雙語，適合從 0 基礎到專業使用者。",
    en: "A free bilingual Blender 5.2 LTS material-node learning site with a node encyclopedia, interactive sandbox, and guided step-by-step tutorials.",
  },
  "meta.tutorials.title": { zh: "互動學習中心 · Blender 5.2 LTS 材質節點", en: "Interactive Learning Center · Blender 5.2 LTS Material Nodes" },
  "meta.tutorials.description": {
    zh: "用程度診斷、挑戰題、除錯實驗、間隔複習與智慧節點檢查，真正學會 Blender 5.2 LTS 材質節點。",
    en: "Master Blender 5.2 LTS material nodes with a skill check, challenges, debugging labs, spaced review, and smart graph diagnostics.",
  },
  "meta.encyclopedia.title": { zh: "節點百科 · Blender 5.2 LTS 材質節點", en: "Node Encyclopedia · Blender 5.2 LTS Material Nodes" },
  "meta.encyclopedia.description": {
    zh: "Blender 5.2 LTS 材質節點百科，提供中英雙語說明、輸入輸出與互動範例。",
    en: "A bilingual Blender 5.2 LTS material-node encyclopedia with socket references, explanations, and interactive examples.",
  },
  "meta.sandbox.title": { zh: "自由沙盒 · Blender 5.2 LTS 材質節點", en: "Interactive Sandbox · Blender 5.2 LTS Material Nodes" },
  "meta.sandbox.description": {
    zh: "拖拉 Blender 5.2 LTS 材質節點、自己接線，並用即時 3D 預覽觀察每一次修改。",
    en: "Drag, connect, and experiment with Blender 5.2 LTS material nodes while a live 3D preview reacts to every change.",
  },
  "meta.reference.title": { zh: "材質參考表 · Blender 5.2 LTS 材質節點", en: "Material Reference · Blender 5.2 LTS Material Nodes" },
  "meta.reference.description": {
    zh: "Blender 5.2 LTS 材質製作常用的 IOR、粗糙度與純金屬反射顏色速查表。",
    en: "A quick Blender 5.2 LTS material reference for IOR, roughness ranges, and pure-metal reflectance colors.",
  },
  "meta.troubleshoot.title": { zh: "疑難排解 · Blender 5.2 LTS 材質節點", en: "Troubleshooting · Blender 5.2 LTS Material Nodes" },
  "meta.troubleshoot.description": {
    zh: "Blender 5.2 LTS 材質節點常見問題的症狀、原因與修法。",
    en: "Symptoms, causes, and fixes for common Blender 5.2 LTS material-node problems.",
  },
  "nav.home": { zh: "首頁", en: "Home" },
  "nav.encyclopedia": { zh: "節點百科", en: "Encyclopedia" },
  "nav.sandbox": { zh: "自由沙盒", en: "Sandbox" },
  "nav.tutorials": { zh: "學習中心", en: "Learning Center" },
  "nav.reference": { zh: "參考表", en: "Reference" },
  "nav.troubleshoot": { zh: "疑難排解", en: "Troubleshooting" },
  "nav.github": { zh: "⭐ GitHub", en: "⭐ GitHub" },
  "sandbox.palette": { zh: "節點面板", en: "Nodes" },
  "sandbox.searchPlaceholder": { zh: "搜尋節點…", en: "Search nodes…" },
  "sandbox.loadPreset": { zh: "載入預設材質…", en: "Load preset…" },
  "sandbox.share": { zh: "🔗 分享連結", en: "🔗 Share Link" },
  "sandbox.export": { zh: "匯出 JSON", en: "Export JSON" },
  "sandbox.import": { zh: "匯入 JSON", en: "Import JSON" },
  "sandbox.clear": { zh: "清空", en: "Clear" },
  "sandbox.undo": { zh: "↶ 復原", en: "↶ Undo" },
  "sandbox.redo": { zh: "↷ 重做", en: "↷ Redo" },
  "sandbox.preview": { zh: "即時預覽", en: "Live Preview" },
  "sandbox.inspector": { zh: "節點屬性", en: "Properties" },
  "sandbox.selectHint": { zh: "選取一個節點以編輯參數", en: "Select a node to edit its properties" },
  "sandbox.delete": { zh: "🗑 刪除", en: "🗑 Delete" },
  "sandbox.duplicate": { zh: "⧉ 複製", en: "⧉ Duplicate" },
  "sandbox.frameAll": { zh: "⤢ 縮放至全部", en: "⤢ Frame All" },
  "sandbox.tabNodes": { zh: "節點", en: "Nodes" },
  "sandbox.tabCanvas": { zh: "畫布", en: "Canvas" },
  "sandbox.tabProps": { zh: "預覽/屬性", en: "Preview" },
  "sandbox.addStop": { zh: "新增停駐點", en: "Add stop" },
  "sandbox.addControlPoint": { zh: "新增控制點", en: "Add control point" },
  "encyclopedia.searchPlaceholder": { zh: "搜尋節點名稱、功能…", en: "Search node name or function…" },
  "encyclopedia.tryInSandbox": { zh: "在沙盒中試試看 →", en: "Try it in the sandbox →" },
  "encyclopedia.learnInTutorial": { zh: "在教學中學習 →", en: "Learn it in a tutorial →" },
  "encyclopedia.notSupportedYet": { zh: "沙盒中尚未支援即時預覽", en: "Not yet live in the sandbox" },
  "encyclopedia.usedInPresets": { zh: "用在這些預設材質裡", en: "Used in these presets" },
  "tutorials.title": { zh: "互動學習中心", en: "Interactive Learning Center" },
  "tutorials.dashboardEyebrow": { zh: "你的學習儀表板", en: "Your Learning Dashboard" },
  "tutorials.dashboardTitle": { zh: "今天要練什麼？", en: "What should you practice today?" },
  "tutorials.assessmentButton": { zh: "能力診斷", en: "Skill Check" },
  "tutorials.reviewButton": { zh: "到期複習", en: "Due Review" },
  "tutorials.mistakeButton": { zh: "錯題複習", en: "Mistake Review" },
  "tutorials.randomChallengeButton": { zh: "隨機挑戰", en: "Random Challenge" },
  "tutorials.challengeTitle": { zh: "實戰挑戰", en: "Hands-on Challenges" },
  "tutorials.challengeSub": { zh: "只給目標，不給逐步答案；完成後再與參考材質比較。", en: "Build from an objective instead of a recipe, then compare with the reference material." },
  "tutorials.debugTitle": { zh: "除錯實驗室", en: "Debugging Labs" },
  "tutorials.debugSub": { zh: "從壞掉的節點圖開始，練習找出真正的原因並修好。", en: "Start with a broken graph, identify the real cause, and repair it." },
  "tutorials.conceptEyebrow": { zh: "間隔複習", en: "Spaced Review" },
  "tutorials.conceptTitle": { zh: "觀念卡片", en: "Concept Cards" },
  "tutorials.conceptSub": { zh: "先在腦中回答，再翻面確認；記熟的卡片會留在本機。", en: "Answer from memory before flipping. Cards you know are saved on this device." },
  "tutorials.conceptFlip": { zh: "翻面看答案", en: "Reveal Answer" },
  "tutorials.conceptKnown": { zh: "我已記熟", en: "I Know This" },
  "tutorials.searchPlaceholder": { zh: "搜尋教學名稱、內容…", en: "Search tutorial name or content…" },
  "tutorials.searchChallenges": { zh: "搜尋實戰案例…", en: "Search challenges…" },
  "tutorials.searchDebugLabs": { zh: "搜尋除錯案例…", en: "Search debug labs…" },
  "tutorials.caseFilterAll": { zh: "全部難度", en: "All levels" },
  "tutorials.filterBasic": { zh: "基礎", en: "Basic" },
  "tutorials.filterAll": { zh: "全部", en: "All" },
  "tutorials.filterBeginner": { zh: "入門", en: "Beginner" },
  "tutorials.filterIntermediate": { zh: "中階", en: "Intermediate" },
  "tutorials.filterAdvanced": { zh: "進階", en: "Advanced" },
  "tutorials.noResults": { zh: "沒有符合條件的教學", en: "No tutorials match your filters" },
  "tutorials.pathTitle": { zh: "建議學習路徑", en: "Suggested Learning Path" },
  "tutorials.pathSub": {
    zh: "不知道從哪裡開始？照這條主線走一輪，從材質圖基礎到綜合實戰，一步一步循序漸進。",
    en: "Not sure where to start? Follow this main sequence from material-graph basics all the way to putting it all together.",
  },
  "tutorials.browseAllHeading": { zh: "瀏覽全部教學", en: "Browse All Tutorials" },
  "landing.heroTitle1": { zh: "從 0 基礎到專業，", en: "From absolute beginner to pro —" },
  "landing.versionBadge": { zh: "依 Blender 5.2 LTS 校對", en: "Aligned with Blender 5.2 LTS" },
  "landing.heroTitle2": { zh: "看懂 Blender 每一個材質節點", en: "understand every Blender material node" },
  "landing.heroSubtitle": {
    zh: "不知道怎麼開始？跟著建議學習路徑一步步學會材質怎麼連接、怎麼使用；已經有想法的話，也可以直接查節點百科或動手玩沙盒。",
    en: "Not sure where to start? Follow the Suggested Learning Path to learn how to connect and use materials, step by step. Already have an idea? Jump straight to the Encyclopedia or Sandbox instead.",
  },
  "landing.ctaLearningPath": { zh: "不知道從哪開始？跟著學", en: "New here? Follow the Guided Path" },
  "landing.ctaSandbox": { zh: "直接動手玩沙盒", en: "Or Jump Into the Sandbox" },
  "landing.featureEncyclopediaTitle": { zh: "節點百科", en: "Node Encyclopedia" },
  "landing.featureEncyclopediaDesc": {
    zh: "依分類瀏覽所有材質節點，每個節點都有新手／進階雙層說明與輸入輸出圖解。",
    en: "Browse every material node by category — each one has beginner and pro-level explanations plus an input/output diagram.",
  },
  "landing.featureSandboxTitle": { zh: "自由沙盒", en: "Free Sandbox" },
  "landing.featureSandboxDesc": {
    zh: "拖拉節點、自己接線，右側 3D 預覽即時反應每一次修改。",
    en: "Drag nodes, wire them up yourself, and watch the 3D preview react instantly to every change.",
  },
  "landing.featureTutorialsTitle": { zh: "互動學習中心", en: "Interactive Learning Center" },
  "landing.featureTutorialsDesc": {
    zh: "從能力診斷、逐步教學到實戰挑戰與除錯練習，每一步都有智慧檢查，進度只存在你的瀏覽器。",
    en: "Move from a skill check and guided lessons to challenges and debugging practice, with smart checks and progress stored only in your browser.",
  },
  "landing.galleryTitle": { zh: "材質範例，點一下直接開始玩", en: "Material Gallery — Click to Jump Right In" },
  "landing.gallerySub": {
    zh: "全部都是真的節點圖算出來的，不是照片——點縮圖直接在沙盒裡打開，拆開來看怎麼接的。",
    en: "Every one of these is computed live from a real node graph, not a photo — click a thumbnail to open it in the Sandbox and see exactly how it's wired.",
  },
  "landing.galleryLoading": { zh: "材質縮圖渲染中…", en: "Rendering material thumbnails…" },
  "landing.statsNodes": { zh: "個節點", en: "Nodes" },
  "landing.statsPresets": { zh: "個預設材質", en: "Presets" },
  "landing.statsTutorials": { zh: "篇引導教學", en: "Tutorials" },
  "reference.title": { zh: "材質參考表", en: "Materials Reference" },
  "reference.intro": {
    zh: "調材質時忘記真實世界的數字該填多少？這裡整理了常見材質的折射率（IOR）、粗糙度（Roughness）大致範圍，跟純金屬該填的反射率顏色——都是公開的物理量測值，不是憑感覺猜的。",
    en: "Forgot what real-world value to type in? Here's a quick reference for common materials' IOR, typical Roughness ranges, and the reflectance color to use for pure metals — all published physical measurements, not guesses.",
  },
  "reference.introLink": { zh: "想知道「為什麼」，看這篇教學 →", en: "Want to know why? See this tutorial →" },
  "reference.iorTitle": { zh: "折射率 IOR", en: "Index of Refraction (IOR)" },
  "reference.iorSub": {
    zh: "接在玻璃 BSDF（Glass BSDF）、折射 BSDF（Refraction BSDF）、菲涅爾（Fresnel）等節點的 IOR 插槽。",
    en: "Plug into the IOR socket on Glass BSDF, Refraction BSDF, Fresnel, and similar nodes.",
  },
  "reference.roughnessLink": { zh: "想知道粗糙度背後的原理，看這篇教學 →", en: "Want to know the physics behind roughness? See this tutorial →" },
  "reference.roughnessTitle": { zh: "粗糙度 Roughness 常見範圍", en: "Common Roughness Ranges" },
  "reference.roughnessSub": {
    zh: "粗糙度是「表面加工方式」而不是材質本身固定的物理量，這裡的數字只是常見情況的參考範圍，不是唯一正確答案。",
    en: "Roughness describes a surface finish, not a fixed property of the material itself — these are typical reference ranges, not the one correct answer.",
  },
  "reference.metalTitle": { zh: "純金屬（Metallic = 1）的底色", en: "Base Color for Pure Metals (Metallic = 1)" },
  "reference.metalSub": {
    zh: "這是金屬在正視角的反射率顏色，不是「印象中的顏色」，通常比想像中更接近灰階、更不飽和。",
    en: "This is the metal's reflectance color at normal incidence, not its 'remembered' color — usually closer to gray and less saturated than you'd expect.",
  },
  "reference.iorColHeader": { zh: "材質", en: "Material" },
  "reference.iorColValue": { zh: "IOR", en: "IOR" },
  "reference.roughnessColValue": { zh: "建議範圍", en: "Typical Range" },
  "reference.metalColValue": { zh: "RGB 數值", en: "RGB Values" },
  "troubleshoot.title": { zh: "疑難排解", en: "Troubleshooting" },
  "troubleshoot.intro": {
    zh: "畫面死黑、死白、接線被擋、調了滑桿沒反應？以下是開發這個網站過程中真的遇過的問題，按症狀分類，點開看原因跟修法——不是憑空猜測使用者會卡在哪裡。",
    en: "Black screen, blown-out white, a blocked connection, a slider that does nothing? These are real problems hit while building this site, grouped by symptom — click one open for the cause and the fix. Not guesses about what might go wrong.",
  },
  "troubleshoot.searchPlaceholder": { zh: "搜尋症狀關鍵字…", en: "Search by symptom…" },
  "troubleshoot.noResults": { zh: "找不到符合的症狀", en: "No matching symptoms" },
  "troubleshoot.causeLabel": { zh: "原因：", en: "Cause: " },
  "troubleshoot.fixLabel": { zh: "修法：", en: "Fix: " },
  "troubleshoot.seeTutorial": { zh: "看這篇教學：", en: "See the tutorial: " },
  "troubleshoot.seePreset": { zh: "看這個預設材質：", en: "See this preset: " },
  "troubleshoot.seeReference": { zh: "看材質參考表", en: "See the reference table" },
  "search.button": { zh: "搜尋", en: "Search" },
  "search.placeholder": { zh: "搜尋節點、材質、教學、挑戰、疑難排解…", en: "Search nodes, materials, tutorials, challenges, troubleshooting…" },
  "search.idleHint": { zh: "輸入關鍵字，跨全站學習內容一起搜。", en: "Type to search across every learning resource on the site." },
  "search.noResults": { zh: "找不到符合的結果", en: "No matching results" },
  "search.groupNode": { zh: "節點百科", en: "Encyclopedia" },
  "search.groupPreset": { zh: "預設材質", en: "Presets" },
  "search.groupTutorial": { zh: "引導教學", en: "Tutorials" },
  "search.groupActivity": { zh: "實戰與除錯", en: "Practice & Debugging" },
  "search.groupTroubleshoot": { zh: "疑難排解", en: "Troubleshooting" },
};

// localStorage 在某些環境（Safari 私密瀏覽舊版本、被政策封鎖的瀏覽器）存取時會直接
// 拋出例外，而不是單純回傳 null。getLang() 幾乎在每一次畫面渲染都會被呼叫到
// （t()/tBi() 都靠它），沒有這層防呆的話，一次拋錯就會讓全站所有頁面整個掛掉。
let inMemoryLang = "zh";

function urlLang() {
  const value = new URLSearchParams(location.search).get("lang");
  return value === "en" || value === "zh" ? value : null;
}

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 存不進去就退回只在記憶體裡記住這次的語言選擇，不影響當次瀏覽。
  }
}

export function getLang() {
  return urlLang() || safeGetItem(STORAGE_KEY) || inMemoryLang;
}

export function setLang(lang) {
  inMemoryLang = lang;
  safeSetItem(STORAGE_KEY, lang);
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.set("lang", "en");
  else url.searchParams.delete("lang");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
  applyI18n();
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

export function t(key) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[getLang()] || entry.zh;
}

// 給節點資料等 {zh, en} 形式的雙語物件用
export function tBi(obj) {
  if (!obj) return "";
  return obj[getLang()] || obj.zh || obj.en || "";
}

export function applyI18n(root = document) {
  if (root === document) {
    document.documentElement.lang = getLang() === "en" ? "en" : "zh-Hant";
  }
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-content]").forEach((el) => {
    el.setAttribute("content", t(el.getAttribute("data-i18n-content")));
  });
  if (root === document) {
    const currentUrl = new URL(location.href);
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (canonical) canonical.href = currentUrl.href;
    if (ogUrl) ogUrl.content = currentUrl.href;
  }
}

export function initLangToggle() {
  const btn = document.getElementById("lang-toggle");
  applyI18n();
  if (!btn) return;
  btn.addEventListener("click", () => {
    setLang(getLang() === "zh" ? "en" : "zh");
  });
}
