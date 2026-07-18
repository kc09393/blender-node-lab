import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_ridged_terrain",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "山脊多重分形：裂紋岩石質感", en: "Ridged Multifractal: Cracked Rock Look" },
  description: {
    zh: "雜訊紋理（Noise Texture）除了預設的 fBM（柔和雲霧感）之外，還有 Ridged Multifractal 這種會刻出銳利山脊狀裂紋的類型，很適合做岩石、峽谷、乾裂地面的質感。",
    en: "Beyond the default fBM (soft, cloud-like noise), Noise Texture also has Ridged Multifractal — a type that carves sharp, ridge-like creases. Great for rock, canyons, and cracked ground.",
  },
  startGraph: {
    nodes: [
      { id: "t_rt_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_rt_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_rt_l1", fromNode: "t_rt_principled", fromSocket: "bsdf", toNode: "t_rt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_rt_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_rt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.7 } },
      {
        id: "te_rt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0.1, color: [0.04, 0.04, 0.05, 1] },
            { position: 0.6, color: [0.35, 0.28, 0.22, 1] },
            { position: 1.3, color: [0.9, 0.85, 0.75, 1] },
          ],
        },
      },
      {
        id: "te_rt_noise",
        typeId: "texture_noise",
        x: 300,
        y: 100,
        params: { noiseType: "ridged_multifractal", scale: 3, detail: 6, roughness: 0.55, lacunarity: 2.0, offset: 1.0, gain: 2.0 },
      },
    ],
    links: [
      { id: "te_rt_l1", fromNode: "te_rt_principled", fromSocket: "bsdf", toNode: "te_rt_out", toSocket: "surface" },
      { id: "te_rt_l2", fromNode: "te_rt_ramp", fromSocket: "color", toNode: "te_rt_principled", toSocket: "baseColor" },
      { id: "te_rt_l3", fromNode: "te_rt_noise", fromSocket: "fac", toNode: "te_rt_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入雜訊紋理", en: "Step 1: Add a Noise Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入雜訊紋理（Noise Texture）。預設類型是 fBM，先不用調整，下一步再切換。",
        en: "Drag in a Noise Texture from the Texture category. It defaults to fBM — leave it for now, we'll switch it in the next step.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_noise"),
    },
    {
      title: { zh: "第二步：切換成 Ridged Multifractal", en: "Step 2: Switch to Ridged Multifractal" },
      instruction: {
        zh: "把雜訊紋理的「類型 Type」下拉選單切換成「山脊多重分形 Ridged Multifractal」。畫面應該會立刻出現銳利的白色裂紋，這是這個類型的正字標記——公式是 offset 減去雜訊絕對值再平方，讓接近 0 的地方變成又窄又亮的稜線。",
        en: "Switch the Noise Texture's Type dropdown to 'Ridged Multifractal'. You should immediately see sharp white creases appear — that's this type's signature look, from squaring (offset minus the absolute noise value), which turns near-zero crossings into narrow, bright ridges.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_noise", "noiseType", (v) => v === "ridged_multifractal"),
    },
    {
      title: { zh: "第三步：加入 Color Ramp 馴服範圍", en: "Step 3: Tame the Range with Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp，轉換器 Converter 分類），把雜訊紋理的係數（Fac）接到它的係數。\n\n⚠️ Ridged Multifractal 這類非 fBM 類型的輸出範圍常常明顯超出 0-1、而且整體偏高（這是公式本身的特性——每一疊代都是非負值累加，Blender 也一樣），直接接顏色常常會整片死白，接 Color Ramp 才能把裂紋跟底色分開上色。\n\n試著把停駐點的位置往右移（例如落在 0.1／0.6／1.3 這種範圍，而不是預設的 0-1），顏色從深灰經過中間的褐色、過渡到淺米白色，做出岩石的明暗對比。",
        en: "Add a Color Ramp (Converter category), and connect Noise Texture's Fac to its Fac.\n\n⚠️ Non-fBM types like Ridged Multifractal often output well beyond 0-1, and skew high overall (that's inherent to the formula — every octave adds a non-negative amount, true in real Blender too) — feeding it straight into a color often looks blown-out white. A Color Ramp lets you color the ridges and the base separately.\n\nTry shifting the stop positions to the right (e.g. around 0.1 / 0.6 / 1.3 instead of the default 0-1 range), going from dark gray through a mid brown to a light cream, for a rock-like contrast.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac"),
    },
    {
      title: { zh: "第四步：接到 Base Color", en: "Step 4: Feed Base Color" },
      instruction: {
        zh: "把顏色漸變（Color Ramp）的顏色（Color）輸出接到原理化 BSDF（Principled BSDF）的底色（Base Color），完成裂紋岩石材質。也可以把粗糙度（Roughness）調高一點（例如 0.7），讓表面看起來更霧面、更像真的岩石。",
        en: "Connect Color Ramp's Color output to Principled BSDF's Base Color to finish the cracked rock material. You can also raise Roughness (e.g. to 0.7) for a more matte, rock-like finish.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "為什麼切到 Ridged Multifractal 之後，顏色漸變的停駐點要往右移（例如 0.1／0.6／1.3），不能沿用 fBM 習慣的 0-1 範圍？",
        en: "Why do the Color Ramp stops need to shift right (e.g. 0.1 / 0.6 / 1.3) after switching to Ridged Multifractal, instead of keeping fBM's usual 0-1 range?",
      },
      options: [
        {
          zh: "Ridged Multifractal 每一疊代都是非負值累加，典型輸出中心明顯高於 0-1，直接沿用 fBM 的停駐點範圍會整片死白",
          en: "Ridged Multifractal accumulates non-negative amounts every octave, so its typical output sits well above 0-1 — reusing fBM's stop range would blow the whole thing out to white",
        },
        { zh: "因為 Ridged Multifractal 這個類型本身有 bug，本沙盒建議不要使用", en: "Because Ridged Multifractal itself is buggy in this sandbox and shouldn't really be used" },
        { zh: "因為顏色漸變的停駐點位置只對這一種雜訊類型才有效", en: "Because Color Ramp stop positions only work correctly for this one noise type" },
        { zh: "純粹是美術喜好，跟雜訊的實際輸出範圍無關", en: "It's purely an artistic preference, unrelated to the noise's actual output range" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "fBM 是唯一被標準化到 0-1 的雜訊類型；Multifractal／Hybrid／Ridged／Hetero Terrain 這幾種類型的輸出範圍可能明顯超出 0-1（這是公式本身的特性，Blender 也一樣），Ridged Multifractal 又因為公式是「offset 減去絕對值」，非負值不斷疊代累加，典型輸出中心落在 1.0 附近而不是 0.5——不重新校準顏色漸變的範圍，畫面很容易整片死白，這不是本沙盒特有的限制，是這幾種非 fBM 類型共通的特性。",
        en: "fBM is the only noise type normalized to 0-1. Multifractal / Hybrid / Ridged / Hetero Terrain can output well beyond that range (inherent to the formulas, true in real Blender too), and Ridged Multifractal specifically — being 'offset minus absolute value' accumulated non-negatively every octave — typically centers around 1.0 rather than 0.5. Without recalibrating the Color Ramp's range, the result easily blows out to solid white. This isn't a sandbox-specific quirk — it's shared behavior across these non-fBM types.",
      },
    },
  ],
};
