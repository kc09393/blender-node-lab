import { hasLinkBetweenTypes, anyNodeParamMatches, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_dual_tone_fabric_colorway",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "雙色織布：用 HSV 一次換掉整個配色", en: "Two-Tone Fabric: Recoloring the Whole Pattern with HSV" },
  description: {
    zh: "做好一個雙色織紋圖案之後，如果想要換一個配色（例如藍白格改成綠白格），不需要重新調整顏色漸變（Color Ramp）裡的每一個停駐點——接一個色相/飽和度/明度（Hue Saturation Value）節點在後面，轉一下 Hue，整組配色會保持原本的明暗對比跟圖案，一次全部換色。這篇示範這個「圖案跟配色分開處理」的實用技巧。",
    en: "Once you've built a two-tone weave pattern, switching its colorway (say, blue-and-white to green-and-white) doesn't require re-tuning every Color Ramp stop — pipe a Hue Saturation Value node afterward, turn Hue, and the whole colorway shifts at once while keeping the original contrast and pattern. This tutorial demonstrates that 'separate the pattern from its colorway' technique.",
  },
  startGraph: {
    nodes: [
      { id: "t_dtf_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_dtf_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_dtf_l1", fromNode: "t_dtf_principled", fromSocket: "bsdf", toNode: "t_dtf_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_dtf_out", typeId: "output_material", x: 1400, y: 200, params: {} },
      { id: "te_dtf_principled", typeId: "shader_principled_bsdf", x: 1140, y: 100, params: {} },
      { id: "te_dtf_hsv", typeId: "color_hsv", x: 880, y: 100, params: { hue: 0.15, saturation: 1.3 } },
      {
        id: "te_dtf_ramp",
        typeId: "converter_color_ramp",
        x: 620,
        y: 100,
        params: { interpolation: "constant", stops: [{ position: 0, color: [0.05, 0.1, 0.35, 1] }, { position: 0.5, color: [0.95, 0.95, 0.95, 1] }] },
      },
      { id: "te_dtf_noise", typeId: "texture_noise", x: 360, y: 100, params: { scale: 22, detail: 2 } },
    ],
    links: [
      { id: "te_dtf_l1", fromNode: "te_dtf_principled", fromSocket: "bsdf", toNode: "te_dtf_out", toSocket: "surface" },
      { id: "te_dtf_l2", fromNode: "te_dtf_hsv", fromSocket: "color", toNode: "te_dtf_principled", toSocket: "baseColor" },
      { id: "te_dtf_l3", fromNode: "te_dtf_ramp", fromSocket: "color", toNode: "te_dtf_hsv", toSocket: "color" },
      { id: "te_dtf_l4", fromNode: "te_dtf_noise", fromSocket: "fac", toNode: "te_dtf_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用雜訊＋硬邊漸變做出雙色織紋", en: "Step 1: Build a Two-Tone Weave with Noise + Hard-Edge Ramp" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture），縮放（Scale）調高（例如 22）做出細密的紋理。加入顏色漸變（Color Ramp），插值方式切換成常量（Constant），兩個停駐點：位置 0 深藍、位置 0.5 接近白色——硬邊過渡會產生清楚的深/淺兩色交錯圖案，很像織布的經緯紋理。",
        en: "Add a Noise Texture with a higher Scale (e.g. 22) for a fine texture. Add a Color Ramp, switch Interpolation to Constant, with two stops: position 0 dark blue, position 0.5 near-white — the hard transition creates a clear dark/light interlocking pattern, like woven fabric threads.",
      },
      check: (graph) => {
        const ramps = findNodesOfType(graph, "converter_color_ramp");
        return (
          hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac") &&
          ramps.some((n) => n.params.interpolation === "constant")
        );
      },
    },
    {
      title: { zh: "第二步：接到底色，確認圖案", en: "Step 2: Connect to Base Color and Confirm the Pattern" },
      instruction: {
        zh: "先把顏色漸變的顏色（Color）直接接到原理化 BSDF 的底色（Base Color），確認圖案是清楚的深藍/白兩色交錯，不是模糊漸層。",
        en: "First connect Color Ramp's Color directly to Principled BSDF's Base Color, and confirm the pattern is a clear dark-blue/white interlocking weave, not a soft gradient.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第三步：插入色相/飽和度/明度節點", en: "Step 3: Insert Hue Saturation Value" },
      instruction: {
        zh: "在顏色漸變跟原理化 BSDF 中間插入色相/飽和度/明度（Hue Saturation Value）節點：顏色漸變的顏色接到它的顏色（Color）輸入，它的顏色輸出改接到原理化 BSDF 的底色，取代原本的直接連線。",
        en: "Insert a Hue Saturation Value node between Color Ramp and Principled BSDF: connect Color Ramp's Color to its Color input, then connect its Color output to Principled BSDF's Base Color, replacing the direct connection.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "color_hsv", "color") &&
        hasLinkBetweenTypes(graph, "color_hsv", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第四步：轉 Hue 換配色，調 Saturation 換飽和度", en: "Step 4: Turn Hue for a New Colorway, Saturation for Vividness" },
      instruction: {
        zh: "把 Hue 從預設的 0.5 調開（例如 0.15），深藍會整組轉成另一個色相（例如綠色），但兩色之間的明暗對比、圖案本身完全不變——因為 Hue 是對整張圖統一旋轉色相，不是重新調整某一個停駐點。再把 Saturation 調高（例如 1.3），顏色會更加鮮豔飽和，適合做出「亮色系」款式而不用回頭改顏色漸變。",
        en: "Move Hue away from the default 0.5 (e.g. to 0.15) — the dark blue shifts to a different hue (e.g. green) as a set, while the contrast between the two tones and the pattern itself stay completely unchanged, because Hue rotates the whole image's hue uniformly rather than re-tuning any single stop. Then raise Saturation (e.g. to 1.3) for a more vivid, saturated variant — no need to go back and edit the Color Ramp at all.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "color_hsv", "hue", (v) => Math.abs(v - 0.5) > 0.2) &&
        anyNodeParamMatches(graph, "color_hsv", "saturation", (v) => v > 1.1),
    },
  ],
  quiz: [
    {
      question: {
        zh: "把色相/飽和度/明度（HSV）節點接在「雜訊→顏色漸變」產生的雙色織紋圖案後面，轉動 Hue 之後，圖案的深淺對比、雙色交錯的花紋分布會怎麼變化？",
        en: "With an HSV node inserted after a 'noise → Color Ramp' two-tone weave pattern, what happens to the pattern's contrast and interlocking layout when you turn Hue?",
      },
      options: [
        { zh: "花紋分布跟深淺對比完全不變，只有整體色相統一轉成另一個顏色", en: "The layout and contrast stay completely unchanged — only the overall hue shifts to a different color" },
        { zh: "花紋分布會被打散重新隨機排列", en: "The layout gets shuffled and re-randomized" },
        { zh: "深淺對比會被壓平，兩色會變得幾乎一樣亮", en: "The contrast gets flattened, making both tones nearly equally bright" },
        { zh: "只有顏色漸變裡的第一個停駐點顏色會變，第二個不受影響", en: "Only the Color Ramp's first stop color changes; the second one is unaffected" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "HSV 的 Hue 是對整張圖統一旋轉色相，不會重新計算圖案本身（那是上游雜訊+顏色漸變的工作），也不會動明度/飽和度的相對關係，所以深淺對比、哪裡深哪裡淺（花紋分布）完全保持原樣，只有整體「是哪個顏色系」被整批換掉——這正是「圖案生成」跟「配色」分開處理的好處：換配色不用回頭重新調整顏色漸變的每個停駐點。",
        en: "HSV's Hue rotates the entire image's hue uniformly — it doesn't recompute the pattern itself (that's the upstream noise + Color Ramp's job), and it doesn't touch the relative relationship between lightness/saturation, so the contrast and which areas are dark vs. light (the pattern layout) stay exactly as they were — only which color family the whole thing belongs to shifts. This is exactly the benefit of separating 'pattern generation' from 'colorway': switching the palette never requires re-tuning every Color Ramp stop.",
      },
    },
  ],
};
