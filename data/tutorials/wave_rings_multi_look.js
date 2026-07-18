import { anyNodeParamMatches, findNodesOfType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_wave_rings_multi_look",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "同一張圖，三種長相：波浪環狀模式的百變用途", en: "One Graph, Three Looks: Wave Rings' Many Disguises" },
  description: {
    zh: "波浪紋理的環狀模式（Rings）長得都一樣（同心圓），但只要換顏色漸變的配色跟扭曲程度，就能從「木頭年輪」變成「水波漣漪」再變成「陶土拉坯痕」——這篇不換任何節點結構，只調參數，讓你體會到「很多材質的差異其實只在數值，不在接線方式」。",
    en: "Wave Texture's Rings mode always looks the same structurally (concentric circles), but just changing the Color Ramp's palette and the distortion amount takes it from 'wood end-grain' to 'water ripples' to 'hand-thrown pottery grooves' — this tutorial never changes the node structure, only the numbers, so you feel firsthand that many materials differ only in values, not in wiring.",
  },
  startGraph: {
    nodes: [
      { id: "t_wrml_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_wrml_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_wrml_l1", fromNode: "t_wrml_principled", fromSocket: "bsdf", toNode: "t_wrml_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wrml_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_wrml_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.35 } },
      {
        id: "te_wrml_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.55, 0.35, 0.1, 1] },
            { position: 1, color: [0.35, 0.55, 0.75, 1] },
          ],
        },
      },
      { id: "te_wrml_wave", typeId: "texture_wave", x: 300, y: 100, params: { waveType: "rings", scale: 4, distortion: 8, profile: "sine" } },
    ],
    links: [
      { id: "te_wrml_l1", fromNode: "te_wrml_principled", fromSocket: "bsdf", toNode: "te_wrml_out", toSocket: "surface" },
      { id: "te_wrml_l2", fromNode: "te_wrml_ramp", fromSocket: "color", toNode: "te_wrml_principled", toSocket: "baseColor" },
      { id: "te_wrml_l3", fromNode: "te_wrml_wave", fromSocket: "fac", toNode: "te_wrml_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接上環狀波浪，先做木頭年輪", en: "Step 1: Wire Up Rings — Start with Wood Grain" },
      instruction: {
        zh: "加入波浪紋理（Wave Texture，波形 Type 切成環狀 Rings）跟顏色漸變（Color Ramp），把波浪的係數（Fac）接到顏色漸變的係數，再接到原理化 BSDF 的底色（Base Color）。顏色漸變兩個停駐點設成深棕跟淺棕（例如 0.25/0.13/0.05 跟 0.55/0.35/0.15）——這是最基本的木頭年輪配色。",
        en: "Add a Wave Texture (Type set to Rings) and a Color Ramp, connect Wave's Fac to Color Ramp's Fac, then to Principled BSDF's Base Color. Set the two stops to dark and light brown (e.g. 0.25/0.13/0.05 and 0.55/0.35/0.15) — the classic wood-grain palette.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_wave", "waveType", (v) => v === "rings") &&
        hasLinkBetweenTypes(graph, "texture_wave", "fac", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：換成藍白配色＋加大扭曲，變成水波", en: "Step 2: Switch to Blue/White and Raise Distortion — Now Water Ripples" },
      instruction: {
        zh: "把顏色漸變的兩個停駐點都改成藍色系（例如深藍 0.05/0.15/0.35 跟淺藍白 0.75/0.85/0.95），再把波浪紋理的扭曲（Distortion）調到 8 以上。同心圓被扭曲得歪七扭八，配上藍白色調，看起來完全像水面的漣漪——節點結構完全沒變，只是換了顏色跟扭曲程度。",
        en: "Change both Color Ramp stops to blues (e.g. dark blue 0.05/0.15/0.35 and light blue-white 0.75/0.85/0.95), then raise Wave Texture's Distortion above 8. The concentric rings warp irregularly, and with the blue-white palette, it now reads entirely as water ripples — the node structure never changed, only the color and distortion amount.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_wave", "distortion", (v) => v >= 8) &&
        anyNodeParamMatches(graph, "converter_color_ramp", "stops", (stops) => Array.isArray(stops) && stops.some((s) => s.color[2] > s.color[0])),
    },
    {
      title: { zh: "第三步：換成陶土橘紅＋降低扭曲，變成拉坯痕", en: "Step 3: Switch to Terracotta Orange, Lower Distortion — Now Pottery Grooves" },
      instruction: {
        zh: "把顏色漸變改成陶土橘紅色系（例如深赭 0.35/0.16/0.08 跟淺陶土 0.68/0.4/0.24），把扭曲（Distortion）調低到 1 以下，讓同心圓變回規律整齊。畫面現在看起來像手工拉坯陶器留下的一圈圈刻痕——同樣的環狀波浪，第三種截然不同的材質。",
        en: "Change the Color Ramp to terracotta orange-red (e.g. dark ochre 0.35/0.16/0.08 and light clay 0.68/0.4/0.24), and lower Distortion below 1 so the rings become regular and even again. It now reads as the concentric grooves left by hand-thrown pottery — the same Rings wave, a third completely different material.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "texture_wave", "distortion", (v) => v <= 1) &&
        anyNodeParamMatches(graph, "converter_color_ramp", "stops", (stops) => Array.isArray(stops) && stops.some((s) => s.color[0] > s.color[2])),
    },
    {
      title: { zh: "第四步：回顧：三種材質，同一份接線", en: "Step 4: Look Back — Three Materials, One Wiring" },
      instruction: {
        zh: "從頭到尾，波浪紋理→顏色漸變→底色這條接線一次都沒變過，你只調了顏色漸變的配色跟波浪的扭曲程度，就做出木頭、水波、陶土三種完全不同的材質。這說明了一個很重要的觀念：材質設計很多時候不是「想不同的節點組合」，而是「想清楚數值該填多少」——先確定接線邏輯是對的，之後靠調參數就能有很多變化。",
        en: "From start to finish, the Wave Texture → Color Ramp → Base Color wiring never changed once — you only adjusted the Color Ramp's palette and the Wave's distortion amount, and got three completely different materials: wood, water, pottery. This illustrates an important idea: material design is often not about inventing new node combinations, but about deciding what values to plug in — once the wiring logic is right, tuning parameters alone unlocks a lot of variety.",
      },
      check: (graph) => findNodesOfType(graph, "texture_wave").some((n) => n.params.waveType === "rings"),
    },
  ],
};
