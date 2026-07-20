import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_frosted_glass",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "毛玻璃：用雜訊驅動玻璃的粗糙度", en: "Frosted Glass: Driving Glass Roughness with Noise" },
  description: {
    zh: "浴室毛玻璃是「玻璃 BSDF（Glass BSDF）＋不均勻粗糙度」做出來的——不是整片統一模糊，而是有細緻顆粒感的霧面。這篇示範把雜訊紋理（Noise Texture）接到玻璃的粗糙度（Roughness），再用映射範圍（Map Range）把範圍收在一個合理的區間，避免霧面收過頭變成完全不透光的白霧。",
    en: "Bathroom frosted glass is Glass BSDF plus uneven roughness — not a uniform blur, but a finely grained frost. This tutorial wires Noise Texture into Glass BSDF's Roughness, then uses Map Range to keep the result in a reasonable range so the frosting doesn't go so far it turns into an opaque white haze.",
  },
  startGraph: {
    nodes: [
      { id: "t_fg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_fg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_fg_l1", fromNode: "t_fg_principled", fromSocket: "bsdf", toNode: "t_fg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_fg_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_fg_glass", typeId: "shader_glass_bsdf", x: 820, y: 100, params: { ior: 1.45 } },
      { id: "te_fg_maprange", typeId: "converter_map_range", x: 560, y: 100, params: { toMin: 0.15, toMax: 0.35 } },
      { id: "te_fg_noise", typeId: "texture_noise", x: 300, y: 100, params: { scale: 18 } },
    ],
    links: [
      { id: "te_fg_l1", fromNode: "te_fg_glass", fromSocket: "bsdf", toNode: "te_fg_out", toSocket: "surface" },
      { id: "te_fg_l2", fromNode: "te_fg_maprange", fromSocket: "value", toNode: "te_fg_glass", toSocket: "roughness" },
      { id: "te_fg_l3", fromNode: "te_fg_noise", fromSocket: "fac", toNode: "te_fg_maprange", toSocket: "value" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先做出一般清澈玻璃", en: "Step 1: Start with Plain Clear Glass" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入玻璃 BSDF（Glass BSDF），接到材質輸出（Material Output）。IOR 維持 1.45（玻璃的真實折射率）。\n\n粗糙度先不用管，等一下會改成接線控制。",
        en: "Drag in a Glass BSDF from the Shader category and connect it to Material Output. Keep IOR at 1.45 (glass's real index of refraction).\n\nDon't worry about Roughness yet; it'll be driven by a connection next.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_glass_bsdf", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第二步：用雜訊紋理直接驅動粗糙度", en: "Step 2: Drive Roughness Directly with Noise" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture），把它的係數（Fac）接到玻璃 BSDF 的粗糙度（Roughness）。兩者剛好都是 0-1 範圍，不需要額外換算就能直接接。\n\n畫面應該會從清澈變成不均勻的毛玻璃霧面。",
        en: "Add a Noise Texture and connect its Fac output to Glass BSDF's Roughness. Both are already 0-1, so no rescaling is needed.\n\nThe glass should shift from clear to an uneven frosted haze.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "fac", "shader_glass_bsdf", "roughness"),
    },
    {
      title: { zh: "第三步：用映射範圍收窄粗糙度區間", en: "Step 3: Tighten the Range with Map Range" },
      instruction: {
        zh: "在雜訊紋理跟玻璃 BSDF 中間插入映射範圍（Map Range），把目標最小（To Min）設成 0.15、目標最大（To Max）設成 0.35。\n\n這樣粗糙度只會在「有點霧」到「中度霧」之間變化，不會出現粗糙度衝到 1（完全霧面、幾乎看不透）的區塊，效果更接近真實浴室玻璃的樣子。",
        en: "Insert a Map Range between Noise Texture and Glass BSDF, setting To Min to 0.15 and To Max to 0.35.\n\nRoughness now only varies between 'slightly hazy' and 'moderately hazy', never spiking to 1 (fully frosted, nearly opaque) — closer to how real bathroom glass actually looks.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_map_range", "value") &&
        hasLinkBetweenTypes(graph, "converter_map_range", "value", "shader_glass_bsdf", "roughness") &&
        anyNodeParamMatches(graph, "converter_map_range", "toMax", (v) => v <= 0.5),
    },
    {
      title: { zh: "第四步：調高雜訊縮放，做出更細緻的顆粒", en: "Step 4: Raise Noise Scale for a Finer Grain" },
      instruction: {
        zh: "把雜訊紋理的縮放（Scale）調高（例如 18 以上）。\n\n真實的毛玻璃是用砂輪細細噴砂出來的，顆粒非常細密——縮放太低會變成一塊塊模糊的大斑塊，不像磨砂質感。",
        en: "Raise Noise Texture's Scale (e.g. above 18).\n\nReal frosted glass is sandblasted with very fine grain — too low a scale gives large blotchy patches instead of a proper sandblasted texture.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_noise", "scale", (v) => v >= 15),
    },
  ],
  quiz: [
    {
      question: {
        zh: "為什麼要在雜訊紋理跟玻璃 BSDF 的粗糙度之間插入映射範圍（Map Range），把範圍收窄到 0.15~0.35，而不是讓雜訊 0-1 直接接上去？",
        en: "Why insert a Map Range between Noise Texture and Glass BSDF's Roughness, narrowing the range to 0.15–0.35, instead of wiring the noise's 0-1 output straight in?",
      },
      options: [
        {
          zh: "避免粗糙度衝到 1（完全霧化、幾乎不透光），讓效果維持在「有點霧到中度霧」之間，更接近真實毛玻璃",
          en: "To keep Roughness from spiking to 1 (fully frosted, nearly opaque), keeping the look between 'slightly hazy' and 'moderately hazy' — closer to real frosted glass",
        },
        { zh: "因為玻璃 BSDF 的粗糙度插槽本來就只接受 0.15~0.35 這個範圍的數值", en: "Because Glass BSDF's Roughness socket technically only accepts values in 0.15–0.35" },
        { zh: "因為雜訊紋理本身的輸出範圍不是 0-1，需要換算", en: "Because Noise Texture's output isn't actually 0-1 and needs rescaling" },
        { zh: "只是為了讓畫面看起來色調偏藍", en: "Just to give the image a bluish tint" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "雜訊輸出本來就是 0-1，跟粗糙度插槽的範圍原本就相容，直接接上去技術上沒問題——但那樣粗糙度偶爾會衝到接近 1，讓局部完全霧化到看不透。插入 Map Range 是美術上的控制，把效果收在寫實的區間內，不是為了修正型別不相容。",
        en: "Noise output is already 0-1 and technically compatible with the Roughness socket — wiring it directly works fine. But that lets Roughness occasionally spike near 1, turning spots fully opaque. Map Range is an artistic control to keep the effect in a realistic range, not a fix for a type mismatch.",
      },
    },
  ],
};
