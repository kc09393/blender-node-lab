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
  "sandbox.blenderExport": { zh: "匯出 Blender", en: "Export to Blender" },
  "sandbox.blenderLibrary": { zh: "90 材質庫", en: "90-Material Library" },
  "sandbox.abSave": { zh: "儲存 A", en: "Save A" },
  "sandbox.abCompare": { zh: "比較 A/B", en: "Compare A/B" },
  "sandbox.export": { zh: "匯出 JSON", en: "Export JSON" },
  "sandbox.import": { zh: "匯入 JSON", en: "Import JSON" },
  "sandbox.clear": { zh: "清空", en: "Clear" },
  "sandbox.more": { zh: "更多工具", en: "More Tools" },
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
  "tutorials.viewCourses": { zh: "課程路徑", en: "Course Path" },
  "tutorials.viewChallenges": { zh: "實作挑戰", en: "Challenges" },
  "tutorials.viewDebug": { zh: "除錯實驗", en: "Debug Labs" },
  "tutorials.viewReview": { zh: "診斷與複習", en: "Review" },
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
  "landing.heroEyebrow": { zh: "互動式 Blender 材質節點學習工具", en: "Interactive Blender Material-Node Learning" },
  "landing.heroTitle1": { zh: "看懂節點怎麼連，", en: "Understand the connections." },
  "landing.heroTitle2": { zh: "真正做出 Blender 材質", en: "Build the Blender material." },
  "landing.heroSubtitle": {
    zh: "從拆解材質效果開始，跟著課程接線、做挑戰、練除錯；每一次修改都能立即看到 3D 結果。",
    en: "Start from a visible material result, then follow lessons, build challenges, and debug graphs while every change updates in 3D.",
  },
  "landing.ctaLearningPath": { zh: "開始第一堂課", en: "Start the First Lesson" },
  "landing.ctaSandbox": { zh: "開啟節點沙盒", en: "Open the Node Sandbox" },
  "landing.enable3d": { zh: "啟用互動 3D", en: "Enable Interactive 3D" },
  "landing.loading3d": { zh: "正在載入 3D…", en: "Loading 3D…" },
  "landing.unavailable3d": { zh: "此裝置無法啟用 3D", en: "3D Unavailable on This Device" },
  "landing.materialPeacock": { zh: "孔雀羽毛", en: "Peacock Feather" },
  "landing.materialHolographic": { zh: "全像箔膜", en: "Holographic Foil" },
  "landing.materialGold": { zh: "熔化黃金", en: "Molten Gold" },
  "landing.materialJade": { zh: "翡翠玉石", en: "Jade Stone" },
  "landing.materialDragon": { zh: "龍鱗盔甲", en: "Dragon Scale Armor" },
  "landing.materialMeteorite": { zh: "外星隕石", en: "Alien Meteorite" },
  "landing.pathwaysTitle": { zh: "你現在想做什麼？", en: "What Do You Want to Do?" },
  "landing.pathwaysSub": { zh: "不用先理解全部功能，直接選最接近你現在需求的入口。", en: "Skip the feature tour and choose the route that matches what you need now." },
  "landing.pathCourseTitle": { zh: "從基礎開始學", en: "Start from the Basics" },
  "landing.pathCourseDesc": { zh: "照課程路徑一步步完成節點接線。", en: "Follow the course path and wire each graph step by step." },
  "landing.pathChallengeTitle": { zh: "看效果做挑戰", en: "Build from a Result" },
  "landing.pathChallengeDesc": { zh: "從目標材質反推節點與參數。", en: "Work backward from a target material to nodes and values." },
  "landing.pathDebugTitle": { zh: "練習排除錯誤", en: "Practice Debugging" },
  "landing.pathDebugDesc": { zh: "修好故意弄壞的材質節點圖。", en: "Repair material graphs that were intentionally broken." },
  "landing.pathLookupTitle": { zh: "查一個節點", en: "Look Up a Node" },
  "landing.pathLookupDesc": { zh: "快速確認插槽、用途與使用方式。", en: "Quickly check sockets, purpose, and practical use." },
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
  "landing.featureValidationTitle": { zh: "Blender 一致性驗證", en: "Blender Conformance" },
  "landing.featureValidationDesc": { zh: "查看官方節點結構、Blender 真實渲染 A/B、瀏覽器近似邊界與可下載資產庫。", en: "Inspect official node schemas, real Blender A/B renders, browser approximation boundaries, and downloadable assets." },
  "validation.metaTitle": { zh: "Blender 一致性驗證 · Blender 5.2 LTS 材質節點", en: "Blender Conformance · Blender 5.2 LTS Material Nodes" },
  "validation.metaDescription": { zh: "查看本站如何使用 Blender 5.2.2 官方執行檔核對節點結構、參數、渲染差異與資產庫。", en: "See how the site verifies node structures, parameters, render differences and assets with official Blender 5.2.2." },
  "validation.title": { zh: "節點和效果怎麼確認與 Blender 一致？", en: "How Are Nodes and Effects Checked Against Blender?" },
  "validation.lead": { zh: "不是只看名稱：本站保存 Blender 官方執行檔匯出的節點結構，並用真實 EEVEE 渲染做 A/B 基準。瀏覽器做不到的部分會明確標示。", en: "This goes beyond labels: the site stores node schemas exported by official Blender and uses real EEVEE renders as A/B references. Browser limits are stated explicitly." },
  "validation.schemaStat": { zh: "節點映射到官方 5.2.2 結構；1 個為已移除舊節點", en: "nodes mapped to official 5.2.2 schemas; one retired legacy node" },
  "validation.renderStat": { zh: "官方 Blender 參考渲染", en: "official Blender reference renders" },
  "validation.pairStat": { zh: "通過像素門檻的單一參數 A/B 效果組", en: "single-parameter A/B pairs above the pixel-difference threshold" },
  "validation.assetStat": { zh: "已驗證 Material Assets", en: "verified Material Assets" },
  "validation.methodTitle": { zh: "驗證方法", en: "Validation Method" },
  "validation.method1": { zh: "以 Blender 5.2.2 執行檔匯出 118 種著色節點的中英文名稱、插槽、預設值與選項。", en: "Export names, sockets, defaults and options for 118 shader nodes from Blender 5.2.2 itself." },
  "validation.method2": { zh: "自動比對網站 82 個節點；81 個對應現行官方節點，Point Density 保留為歷史文件。", en: "Automatically audit 82 site nodes: 81 map to current official nodes, while Point Density remains as historical documentation." },
  "validation.method3": { zh: "固定場景、攝影機與燈光，只改一個參數後由 EEVEE 渲染；解碼 PNG 逐像素比較 RGB，未達可量化差異門檻的組合不列入有效證據。", en: "Hold scene, camera and lighting fixed, vary one parameter, render in EEVEE, then decode each PNG and compare RGB pixel by pixel; pairs below the measurable threshold are not counted as evidence." },
  "validation.method4": { zh: "將網站節點圖匯出到 Blender，重建所有 90 個材質並重新開啟 .blend 檢查資產與接線。", en: "Export site graphs to Blender, rebuild all 90 materials, and reopen the .blend to audit assets and links." },
  "validation.examplesTitle": { zh: "Blender 5.2.2 真實渲染 A/B", en: "Real Blender 5.2.2 A/B Renders" },
  "validation.examplesLead": { zh: "以下圖片不是網站預覽，而是測試時由 Blender 5.2.2 EEVEE 自動輸出的固定基準。", en: "These are not site previews; they are fixed references generated automatically by Blender 5.2.2 EEVEE during testing." },
  "validation.boundaryTitle": { zh: "誠實的邊界", en: "Honest Boundaries" },
  "validation.boundaryText": { zh: "Three.js 即時光柵預覽不等於 Cycles 路徑追蹤。體積、間接照明、多物體光線互動和部分 EEVEE／Cycles 專屬功能必須回 Blender 驗證；百科會逐節點標示「公式對齊」「視覺近似」或「僅文件」。", en: "A Three.js raster preview is not Cycles path tracing. Volume, indirect lighting, multi-object light transport and engine-specific features must be verified in Blender; each encyclopedia entry labels formula alignment, visual approximation or documentation-only support." },
  "validation.manifestLink": { zh: "查看渲染基準資料", en: "View render manifest" },
  "validation.libraryLink": { zh: "下載 90 材質 Blender 資產庫", en: "Download the 90-material Blender library" },
  "landing.galleryTitle": { zh: "先看效果，再拆開節點", en: "See the Result, Then Open the Graph" },
  "landing.gallerySub": {
    zh: "每張縮圖都由真正的節點圖即時算出；點一下就能在沙盒裡查看接線。",
    en: "Every thumbnail is rendered from a real node graph. Click one to inspect its connections in the Sandbox.",
  },
  "landing.galleryAll": { zh: "查看全部 90 個材質 →", en: "Explore All 90 Materials →" },
  "landing.galleryLoading": { zh: "材質縮圖渲染中…", en: "Rendering material thumbnails…" },
  "landing.statsNodes": { zh: "個節點", en: "Nodes" },
  "landing.statsPresets": { zh: "個材質案例", en: "Material Examples" },
  "landing.statsTutorials": { zh: "篇互動課程", en: "Interactive Lessons" },
  "landing.statsPractice": { zh: "個挑戰與除錯", en: "Challenges and Debug Labs" },
  "landing.transferTitle": { zh: "想把練習帶進 Blender？", en: "Ready to Continue in Blender?" },
  "landing.transferDesc": { zh: "下載 90 個材質資產，或查看本站如何用 Blender 5.2.2 驗證節點與效果。", en: "Download 90 material assets or inspect how the site validates nodes and effects with Blender 5.2.2." },
  "landing.transferDownload": { zh: "下載材質庫", en: "Download Library" },
  "landing.transferValidation": { zh: "查看驗證方法", en: "View Validation" },
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
  root.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
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
