import { anyNodeParamMatches, hasLinkBetweenTypes } from "../js/core/tutorialChecks.js";

const output = { id: "a_out", typeId: "output_material", x: 900, y: 180, params: {} };

export const challenges = [
  {
    id: "challenge-polished-metal",
    kind: "challenge",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "拋光金屬：只靠 Principled 完成", en: "Polished Metal with Principled Only" },
    description: { zh: "把灰色塑膠調成真正的拋光金屬，不提供逐步答案。", en: "Turn gray plastic into polished metal without step-by-step instructions." },
    objective: { zh: "做出金屬度至少 0.9、粗糙度不超過 0.2，並正確連到材質輸出的材質。", en: "Create a material with Metallic ≥ 0.9, Roughness ≤ 0.2, connected to Material Output." },
    startGraph: {
      nodes: [output, { id: "a_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.35, 0.35, 0.35, 1], metallic: 0, roughness: 0.55 } }],
      links: [{ id: "a_l1", fromNode: "a_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    targetGraph: {
      nodes: [output, { id: "a_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.55, 0.57, 0.6, 1], metallic: 1, roughness: 0.12 } }],
      links: [{ id: "a_l1", fromNode: "a_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [
      { label: { zh: "原理化 BSDF 已接到材質輸出", en: "Principled BSDF reaches Material Output" }, test: (g) => hasLinkBetweenTypes(g, "shader_principled_bsdf", "bsdf", "output_material", "surface") },
      { label: { zh: "金屬度至少 0.9", en: "Metallic is at least 0.9" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "metallic", (v) => v >= 0.9) },
      { label: { zh: "粗糙度不超過 0.2", en: "Roughness is no more than 0.2" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "roughness", (v) => v <= 0.2) },
    ],
    hints: [
      { zh: "先想想金屬和塑膠最關鍵的差別是哪一個滑桿。", en: "Which single slider most directly separates metal from plastic?" },
      { zh: "把 Metallic 拉近 1，再處理高光是否夠銳利。", en: "Move Metallic close to 1, then decide whether the highlight is sharp enough." },
      { zh: "參考解法：Metallic = 1、Roughness 約 0.12。", en: "Reference: Metallic = 1 and Roughness around 0.12." },
    ],
  },
  {
    id: "challenge-time-pulse",
    kind: "challenge",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "時間脈衝：做出不會爆亮的循環發光", en: "Time Pulse Without Blown Highlights" },
    description: { zh: "把持續增加的時間轉成安全、可循環的發光強度。", en: "Turn ever-increasing time into a safe repeating emission pulse." },
    objective: { zh: "完成「場景時間 → Sine → 映射範圍 → 發光強度」並開啟 Clamp。", en: "Build Scene Time → Sine → Map Range → Emission Strength, with Clamp enabled." },
    sourceTutorialId: "tutorial_scene_time_pulse",
    checks: [
      { label: { zh: "秒數接到 Math", en: "Seconds connects to Math" }, test: (g) => hasLinkBetweenTypes(g, "input_scene_time", "seconds", "converter_math", "value1") },
      { label: { zh: "Math 使用 Sine", en: "Math uses Sine" }, test: (g) => anyNodeParamMatches(g, "converter_math", "operation", (v) => v === "sine") },
      { label: { zh: "Sine 經過映射範圍再進入發光", en: "Sine passes through Map Range before Emission" }, test: (g) => hasLinkBetweenTypes(g, "converter_math", "value", "converter_map_range", "value") && hasLinkBetweenTypes(g, "converter_map_range", "value", "shader_emission", "strength") },
      { label: { zh: "映射範圍已開啟 Clamp", en: "Map Range Clamp is enabled" }, test: (g) => anyNodeParamMatches(g, "converter_map_range", "clamp", (v) => v === true) },
    ],
    hints: [
      { zh: "一直增加的 Seconds 需要先變成週期波。", en: "Ever-increasing Seconds must first become a periodic wave." },
      { zh: "Sine 會輸出 -1 到 1，負值不適合直接當發光強度。", en: "Sine outputs -1 to 1; negative values are not useful as emission strength." },
      { zh: "用 Map Range 把 -1～1 轉成 0.25～5，並開啟 Clamp。", en: "Use Map Range to convert -1..1 into 0.25..5 and enable Clamp." },
    ],
  },
  {
    id: "challenge-frosted-glass",
    kind: "challenge",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "毛玻璃：讓雜訊只控制粗糙度", en: "Frosted Glass: Noise Controls Roughness" },
    description: { zh: "做出保留玻璃穿透、但表面有不均勻霧感的材質。", en: "Keep glass transmission while adding uneven surface frost." },
    objective: { zh: "使用雜訊紋理控制玻璃 BSDF 的粗糙度，玻璃仍需連到輸出。", en: "Use Noise Texture to drive Glass BSDF Roughness while keeping Glass connected to output." },
    sourceTutorialId: "tutorial_frosted_glass",
    checks: [
      { label: { zh: "玻璃 BSDF 已接到輸出", en: "Glass BSDF reaches output" }, test: (g) => hasLinkBetweenTypes(g, "shader_glass_bsdf", "bsdf", "output_material", "surface") },
      { label: { zh: "雜訊直接或經映射範圍控制玻璃粗糙度", en: "Noise drives Glass Roughness directly or through Map Range" }, test: (g) => hasLinkBetweenTypes(g, "texture_noise", "fac", "shader_glass_bsdf", "roughness") || (hasLinkBetweenTypes(g, "texture_noise", "fac", "converter_map_range", "value") && hasLinkBetweenTypes(g, "converter_map_range", "value", "shader_glass_bsdf", "roughness")) },
    ],
    hints: [
      { zh: "不要把雜訊接到玻璃顏色；霧感是表面微小粗糙變化。", en: "Do not connect Noise to glass color; frost is microscopic roughness variation." },
      { zh: "試著使用 Noise Texture 的 Fac 輸出。", en: "Try the Noise Texture Fac output." },
      { zh: "把 Noise Fac 接到 Glass BSDF 的 Roughness。", en: "Connect Noise Fac to Glass BSDF Roughness." },
    ],
  },
  {
    id: "challenge-edge-wear",
    kind: "challenge",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "邊緣磨損：讓金屬從油漆底下露出", en: "Edge Wear: Reveal Metal Through Paint" },
    description: { zh: "利用邊緣遮罩混合油漆與金屬兩種表面。", en: "Use an edge mask to mix painted and metallic surfaces." },
    objective: { zh: "完成邊緣遮罩驅動的兩層材質混合。", en: "Build a two-layer material mix driven by an edge mask." },
    sourceTutorialId: "tutorial_edge_wear_mask",
    checksFromTutorial: true,
    hints: [
      { zh: "先準備油漆與金屬兩個著色器，再思考用什麼控制混合係數。", en: "Prepare paint and metal shaders first, then choose what drives the mix factor." },
      { zh: "邊緣資訊通常需要經過 Color Ramp 強化。", en: "Edge information often needs a Color Ramp to sharpen it." },
      { zh: "參考教學的最終結構，但嘗試用自己的顏色完成。", en: "Use the tutorial's final structure as reference, but choose your own colors." },
    ],
  },
];

export const debugLabs = [
  {
    id: "debug-disconnected-output",
    kind: "debug",
    level: { zh: "基礎除錯", en: "Basic Debugging" },
    name: { zh: "材質為什麼完全沒反應？", en: "Why Does the Material Do Nothing?" },
    description: { zh: "節點都在，但預覽仍是預設材質；找出斷掉的關鍵連線。", en: "The nodes exist, but the preview stays default. Find the missing critical link." },
    objective: { zh: "修好節點圖，讓原理化 BSDF 真正送到材質輸出。", en: "Repair the graph so Principled BSDF reaches Material Output." },
    startGraph: {
      nodes: [output, { id: "d_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.1, 0.5, 0.9, 1], metallic: 0.7, roughness: 0.22 } }],
      links: [],
    },
    targetGraph: {
      nodes: [output, { id: "d_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.1, 0.5, 0.9, 1], metallic: 0.7, roughness: 0.22 } }],
      links: [{ id: "d_l1", fromNode: "d_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [{ label: { zh: "表面輸出已恢復", en: "Surface output is restored" }, test: (g) => hasLinkBetweenTypes(g, "shader_principled_bsdf", "bsdf", "output_material", "surface") }],
    hints: [
      { zh: "先從材質輸出往左追，看看 Surface 有沒有收到資料。", en: "Trace leftward from Material Output. Is Surface receiving anything?" },
      { zh: "著色器的 BSDF 輸出必須接到 Material Output 的 Surface。", en: "The shader's BSDF output must connect to Material Output Surface." },
    ],
  },
  {
    id: "debug-directx-normal",
    kind: "debug",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "法線貼圖的凹凸方向反了", en: "The Normal Map Looks Inverted" },
    description: { zh: "這張貼圖來自 DirectX 工作流，但節點仍使用 OpenGL 慣例。", en: "The texture came from a DirectX workflow, but the node still uses OpenGL convention." },
    objective: { zh: "把法線貼圖慣例切成 DirectX。", en: "Switch the Normal Map convention to DirectX." },
    startGraph: {
      nodes: [output, { id: "d2_p", typeId: "shader_principled_bsdf", x: 650, y: 100, params: {} }, { id: "d2_n", typeId: "vector_normal_map", x: 350, y: 260, params: { color: [0.5, 0.25, 1, 1], strength: 1, convention: "opengl" } }],
      links: [
        { id: "d2_l1", fromNode: "d2_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" },
        { id: "d2_l2", fromNode: "d2_n", fromSocket: "normal", toNode: "d2_p", toSocket: "normal" },
      ],
    },
    targetGraph: {
      nodes: [output, { id: "d2_p", typeId: "shader_principled_bsdf", x: 650, y: 100, params: {} }, { id: "d2_n", typeId: "vector_normal_map", x: 350, y: 260, params: { color: [0.5, 0.25, 1, 1], strength: 1, convention: "directx" } }],
      links: [
        { id: "d2_l1", fromNode: "d2_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" },
        { id: "d2_l2", fromNode: "d2_n", fromSocket: "normal", toNode: "d2_p", toSocket: "normal" },
      ],
    },
    checks: [{ label: { zh: "法線貼圖改為 DirectX", en: "Normal Map uses DirectX" }, test: (g) => anyNodeParamMatches(g, "vector_normal_map", "convention", (v) => v === "directx") }],
    hints: [
      { zh: "凹凸方向顛倒通常不是 Strength 的問題，而是綠色通道方向。", en: "Inverted bumps usually point to the green-channel direction, not Strength." },
      { zh: "在法線貼圖節點的 Convention 選單切換 OpenGL／DirectX。", en: "Use the Normal Map Convention menu to switch OpenGL/DirectX." },
    ],
  },
  {
    id: "debug-thin-wall",
    kind: "debug",
    level: { zh: "新版功能除錯", en: "New Feature Debugging" },
    name: { zh: "Thin Wall 開了卻完全看不出效果", en: "Thin Wall Is On but Nothing Changes" },
    description: { zh: "薄壁已啟用，但材質仍沒有任何光線穿透。", en: "Thin Wall is enabled, but no light passes through the material." },
    objective: { zh: "保留 Thin Wall，並把透射權重調到至少 0.8。", en: "Keep Thin Wall enabled and raise Transmission Weight to at least 0.8." },
    startGraph: {
      nodes: [output, { id: "d3_p", typeId: "shader_principled_bsdf", x: 500, y: 90, params: { baseColor: [0.9, 0.95, 1, 1], roughness: 0.18, thinWall: true, transmissionWeight: 0 } }],
      links: [{ id: "d3_l1", fromNode: "d3_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    targetGraph: {
      nodes: [output, { id: "d3_p", typeId: "shader_principled_bsdf", x: 500, y: 90, params: { baseColor: [0.9, 0.95, 1, 1], roughness: 0.18, thinWall: true, transmissionWeight: 1 } }],
      links: [{ id: "d3_l1", fromNode: "d3_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [
      { label: { zh: "Thin Wall 保持開啟", en: "Thin Wall remains enabled" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "thinWall", (v) => v === true) },
      { label: { zh: "透射權重至少 0.8", en: "Transmission Weight is at least 0.8" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "transmissionWeight", (v) => v >= 0.8) },
    ],
    hints: [
      { zh: "Thin Wall 只改變透射的厚度模型，不會自行增加透射。", en: "Thin Wall changes the transmission thickness model; it does not add transmission by itself." },
      { zh: "到原理化 BSDF 的透射區塊調高 Weight。", en: "Raise Weight in Principled BSDF's Transmission section." },
    ],
  },
];

export const assessmentQuestions = [
  {
    question: { zh: "哪個參數主要控制高光是銳利還是模糊？", en: "Which parameter mainly controls whether highlights are sharp or blurry?" },
    options: [{ zh: "粗糙度 Roughness", en: "Roughness" }, { zh: "金屬度 Metallic", en: "Metallic" }, { zh: "Alpha", en: "Alpha" }],
    correctIndex: 0,
  },
  {
    question: { zh: "要把 Noise 的 0～1 輸出改成 0.2～5，最適合用哪個節點？", en: "Which node is best for remapping Noise from 0–1 into 0.2–5?" },
    options: [{ zh: "映射範圍 Map Range", en: "Map Range" }, { zh: "反色 Invert", en: "Invert" }, { zh: "法線 Normal", en: "Normal" }],
    correctIndex: 0,
  },
  {
    question: { zh: "DirectX 法線貼圖和 OpenGL 最主要差在哪個通道？", en: "Which channel mainly differs between DirectX and OpenGL normal maps?" },
    options: [{ zh: "綠色 Y", en: "Green Y" }, { zh: "紅色 X", en: "Red X" }, { zh: "藍色 Z", en: "Blue Z" }],
    correctIndex: 0,
  },
  {
    question: { zh: "為什麼 Scene Time 後面常接 Sine？", en: "Why is Scene Time often followed by Sine?" },
    options: [{ zh: "把時間轉成循環波", en: "Turn time into a repeating wave" }, { zh: "轉換成顏色", en: "Convert it into color" }, { zh: "停止動畫", en: "Stop animation" }],
    correctIndex: 0,
  },
  {
    question: { zh: "金屬材質的反光顏色主要來自哪裡？", en: "Where does a metal material's reflection color mainly come from?" },
    options: [{ zh: "底色 Base Color", en: "Base Color" }, { zh: "Alpha", en: "Alpha" }, { zh: "法線強度", en: "Normal Strength" }],
    correctIndex: 0,
  },
  {
    question: { zh: "某個節點沒有連到 Material Output 的路徑上，會發生什麼事？", en: "What happens if a node is not on any path to Material Output?" },
    options: [{ zh: "不影響最終材質", en: "It does not affect the final material" }, { zh: "自動接到 Surface", en: "It automatically connects to Surface" }, { zh: "讓 Blender 崩潰", en: "It crashes Blender" }],
    correctIndex: 0,
  },
];

export const conceptCards = [
  { id: "roughness", tag: { zh: "PBR", en: "PBR" }, front: { zh: "Roughness 改變的是亮度嗎？", en: "Does Roughness change brightness?" }, back: { zh: "不是。它主要改變微表面反射的分散程度：低值銳利，高值寬而模糊。", en: "No. It mainly changes microfacet reflection spread: low is sharp, high is broad and blurry." } },
  { id: "metallic", tag: { zh: "PBR", en: "PBR" }, front: { zh: "為什麼金屬反光會帶顏色？", en: "Why are metal reflections colored?" }, back: { zh: "金屬幾乎沒有漫射層，Base Color 直接染色鏡面反射；非金屬的鏡面反射通常接近白色。", en: "Metals have almost no diffuse layer, so Base Color tints specular reflection; dielectrics usually reflect near-white." } },
  { id: "fac", tag: { zh: "遮罩", en: "Masks" }, front: { zh: "Fac 輸出通常代表什麼？", en: "What does a Fac output usually represent?" }, back: { zh: "一個 0～1 的控制值，可當作混合比例、粗糙度、遮罩或其他數值輸入。", en: "A 0–1 control value used as a mix factor, roughness, mask, or another numeric input." } },
  { id: "normal-map", tag: { zh: "法線", en: "Normals" }, front: { zh: "Normal Map 真的改變模型輪廓嗎？", en: "Does a Normal Map change the model silhouette?" }, back: { zh: "不會。它只改變光照用的法線方向；要改輪廓必須使用真正的位移或幾何。", en: "No. It changes lighting normals only; silhouettes require real displacement or geometry." } },
  { id: "color-space", tag: { zh: "貼圖", en: "Textures" }, front: { zh: "法線／粗糙度貼圖為什麼要用 Non-Color？", en: "Why use Non-Color for normal/roughness maps?" }, back: { zh: "它們存的是數據，不是人眼觀看的顏色；套用色彩管理會扭曲原始數值。", en: "They store data, not display color. Color management would distort their numeric values." } },
  { id: "sine", tag: { zh: "動畫", en: "Animation" }, front: { zh: "Sine 的輸出範圍是多少？", en: "What is Sine's output range?" }, back: { zh: "-1 到 1。接到只能接受正值的輸入前，通常要先用 Map Range 重新映射。", en: "-1 to 1. Remap it before feeding inputs that should stay positive." } },
  { id: "thin-wall", tag: { zh: "Blender 5.2", en: "Blender 5.2" }, front: { zh: "Thin Wall 會自動讓材質透明嗎？", en: "Does Thin Wall automatically make a material transparent?" }, back: { zh: "不會。它把表面視為零厚度薄片；仍需透射權重或其他透光設定。", en: "No. It treats the surface as a zero-thickness sheet; transmission still needs to be enabled separately." } },
  { id: "fresnel", tag: { zh: "光線", en: "Light" }, front: { zh: "Fresnel 為什麼常用來做邊緣效果？", en: "Why is Fresnel useful for edge effects?" }, back: { zh: "表面越接近掠視角，反射比例越高，因此物體輪廓附近自然得到較大的值。", en: "Reflection rises at grazing angles, so values naturally become stronger near silhouettes." } },
];

export const learningActivities = [...challenges, ...debugLabs];
