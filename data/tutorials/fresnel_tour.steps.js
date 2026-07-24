import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：直接看 Fresnel 的灰階輸出", en: "Step 1: See Fresnel's Raw Grayscale Output" },
      instruction: {
        zh: "加入菲涅爾（Fresnel，輸入 Input 分類），把它的係數（Fac）輸出直接接到原理化 BSDF 的底色（Base Color）。你會看到球體中心（正對鏡頭處）是黑色、邊緣是白色。\n\n這就是 Fresnel 的本質：一個從 0（正面）到 1（側邊）的數值。",
        en: "Add a Fresnel node (Input category) and connect its Fac output directly to Principled BSDF's Base Color. The sphere's center (facing the camera) shows black, the rim shows white.\n\nThat's Fresnel's essence: a value from 0 (head-on) to 1 (grazing edge).",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：調高 IOR，看中心變亮、對比縮小", en: "Step 2: Raise IOR — the Center Brightens, Contrast Shrinks" },
      instruction: {
        zh: "把 IOR 調到 2.5 以上。中心不再是純黑，會跟著變亮一些。\n\nIOR 越高，正對鏡頭時的基礎反光量也越高，中心跟邊緣的亮度差距會縮小。IOR 越接近 1，中心越接近全黑、對比越強烈。",
        en: "Raise IOR above 2.5. The center is no longer pure black — it brightens too.\n\nHigher IOR raises the baseline reflectance even when facing the camera head-on, narrowing the gap between center and rim. The closer IOR is to 1, the darker the center and the stronger the contrast.",
      },
      check: (graph) => anyNodeParamMatches(graph, "input_fresnel", "ior", (v) => v >= 2.5),
    },
    {
      title: { zh: "第三步：用 Fresnel 驅動 Mix Shader", en: "Step 3: Drive a Mix Shader with Fresnel" },
      instruction: {
        zh: "加入漫射 BSDF（Diffuse BSDF）跟光澤 BSDF（Glossy BSDF，粗糙度調低一點），再加入混合著色器（Mix Shader）把兩者混合。把 Fresnel 的係數（Fac）接到 Mix Shader 的 Fac（不是接到顏色），再把 Mix Shader 接到材質輸出。",
        en: "Add a Diffuse BSDF and a Glossy BSDF (with a low Roughness), then a Mix Shader to blend them. Connect Fresnel's Fac to the Mix Shader's Fac input (not a color), then connect Mix Shader to Material Output.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第四步：看邊緣自動浮現反光", en: "Step 4: Watch the Edge Reflection Appear on Its Own" },
      instruction: {
        zh: "檢查混合著色器的兩個輸入：漫射 BSDF 接第一個、光澤 BSDF 接第二個。畫面正面看起來是霧面的漫射材質，但邊緣會自動浮現一圈光澤反光。\n\n這就是為什麼 Fresnel 幾乎不會直接拿來當顏色用，而是拿來當 Mix Shader 的 Fac，做出「正面霧面、邊緣反光」這種幾乎所有真實材質都有的效果。",
        en: "Check the Mix Shader's two inputs: Diffuse BSDF as the first, Glossy BSDF as the second. The material looks matte head-on, but a ring of glossy reflection appears automatically at the edges.\n\nThis is why Fresnel is rarely used directly as a color, but almost always as a Mix Shader's Fac, producing the 'matte-faced, reflective-edged' look nearly every real material has.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_diffuse_bsdf", "bsdf", "shader_mix_shader", "shader1") &&
        hasLinkBetweenTypes(graph, "shader_glossy_bsdf", "bsdf", "shader_mix_shader", "shader2"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "菲涅爾（Fresnel）的原始灰階輸出，中心（正對鏡頭）跟邊緣（掠視角度）哪個比較亮？",
        en: "In Fresnel's raw grayscale output, which is brighter: the center (head-on) or the edge (grazing angle)?",
      },
      options: [
        { zh: "中心比較亮，邊緣比較暗", en: "The center is brighter, the edge is darker" },
        { zh: "邊緣比較亮，中心比較暗", en: "The edge is brighter, the center is darker" },
        { zh: "全部均勻一致", en: "It's uniform everywhere" },
        { zh: "隨機分布", en: "It's random" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "菲涅爾模擬真實世界「正面看較不反光、側邊掠視角度反光更強」的現象，所以原始輸出是中心暗、邊緣亮——這正是它常被拿去驅動 Mix Shader 疊一層邊緣反光的原因。",
        en: "Fresnel simulates the real-world effect where surfaces reflect less head-on and more at grazing angles, so its raw output is dark at the center and bright at the edges — exactly why it's commonly used to drive a Mix Shader for edge-reflection layering.",
      },
    },
  ],
};
