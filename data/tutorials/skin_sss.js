import { hasNodeOfType, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_skin_sss",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "次表面散射：皮膚材質", en: "Subsurface Scattering: Skin Material" },
  description: {
    zh: "用次表面散射（Subsurface Scattering）節點做出皮膚特有的透光邊緣，再疊一層微弱的高光，學會這種「多層 BSDF 疊加模擬複雜有機材質」的技巧。",
    en: "Use the Subsurface Scattering node to get skin's characteristic translucent edge glow, then layer a subtle highlight on top — learn the 'stack multiple BSDFs' technique for complex organic materials.",
  },
  startGraph: {
    nodes: [{ id: "t_sss_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_sss_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_sss_mix", typeId: "shader_mix_shader", x: 600, y: 160, params: { fac: 0.08 } },
      {
        id: "te_sss_sss",
        typeId: "shader_subsurface_scattering",
        x: 300,
        y: 60,
        params: { color: [0.92, 0.68, 0.58, 1], radius: [1, 0.3, 0.15] },
      },
      { id: "te_sss_glossy", typeId: "shader_glossy_bsdf", x: 300, y: 280, params: { roughness: 0.3 } },
    ],
    links: [
      { id: "te_sss_l1", fromNode: "te_sss_mix", fromSocket: "bsdf", toNode: "te_sss_out", toSocket: "surface" },
      { id: "te_sss_l2", fromNode: "te_sss_sss", fromSocket: "bsdf", toNode: "te_sss_mix", toSocket: "shader1" },
      { id: "te_sss_l3", fromNode: "te_sss_glossy", fromSocket: "bsdf", toNode: "te_sss_mix", toSocket: "shader2" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Subsurface Scattering", en: "Step 1: Add Subsurface Scattering" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入次表面散射（Subsurface Scattering），先直接接到材質輸出（Material Output）的表面（Surface）。顏色（Color）改成偏膚色的暖色調（例如淡橘/淡粉）。",
        en: "Drag in Subsurface Scattering from the Shader category and connect it directly to Material Output's Surface. Change Color to a warm skin tone (e.g. light orange/pink).",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_subsurface_scattering") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_subsurface_scattering"),
    },
    {
      title: { zh: "第二步：調整 Radius 做出紅潤邊緣", en: "Step 2: Tune Radius for a Reddish Edge" },
      instruction: {
        zh: "各色道半徑（Radius）的三個分量分別對應紅/綠/藍三個色道各自的散射距離。把 R 調得比 G、B 都大（例如 1 / 0.3 / 0.15），球體側邊逆光處就會透出偏紅的光暈——這正是耳朵、鼻尖逆光時會發紅的原因。",
        en: "Radius's three components are the scattering distance for red/green/blue individually. Set R higher than G and B (e.g. 1 / 0.3 / 0.15) and the sphere's backlit edges will glow reddish — the same reason a backlit ear or nose tip looks red.",
      },
      check: (graph) =>
        anyNodeParamMatches(
          graph,
          "shader_subsurface_scattering",
          "radius",
          (v) => Array.isArray(v) && v[0] > v[1] && v[1] > v[2]
        ),
    },
    {
      title: { zh: "第三步：加入 Glossy BSDF 做表層反光", en: "Step 3: Add a Glossy BSDF for Surface Sheen" },
      instruction: {
        zh: "真實皮膚表面有一層薄薄的油脂/水分，會產生微弱但清楚的高光。拖入光澤 BSDF（Glossy BSDF），粗糙度（Roughness）設中等（例如 0.3），先不用接線。",
        en: "Real skin has a thin oily/moist layer that creates a subtle but distinct highlight. Drag in a Glossy BSDF with medium Roughness (e.g. 0.3) — don't wire it up yet.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_glossy_bsdf"),
    },
    {
      title: { zh: "第四步：用 Mix Shader 疊上少量高光", en: "Step 4: Blend In a Little Highlight with Mix Shader" },
      instruction: {
        zh: "拖入混合著色器（Mix Shader），上面接次表面散射（Subsurface Scattering）、下面接光澤 BSDF（Glossy BSDF），Fac 調很低（例如 0.08）——高光應該只佔一點點，皮膚看起來才不會像打了蠟。把混合著色器接到材質輸出（Material Output）取代原本的直接連線。",
        en: "Drag in a Mix Shader, connect Subsurface Scattering to the top and Glossy BSDF to the bottom, and set Fac very low (e.g. 0.08) — the highlight should only be a small amount, or the skin will look waxy. Connect Mix Shader to Material Output, replacing the direct connection.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_subsurface_scattering") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_glossy_bsdf") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader") &&
        anyNodeParamMatches(graph, "shader_mix_shader", "fac", (v) => typeof v === "number" && v <= 0.15),
    },
  ],
  quiz: [
    {
      question: {
        zh: "次表面散射（SSS）的 Radius 插槽有 R/G/B 三個分量，想做出耳朵、鼻尖逆光時常見的紅潤透光邊緣，該怎麼設定？",
        en: "Subsurface Scattering's Radius has separate R/G/B components. To get the reddish backlit glow common on ears or nose tips, how should you set them?",
      },
      options: [
        { zh: "三個分量都設成一樣的數值", en: "Set all three components to the same value" },
        { zh: "把 R 設得比 G、B 都大", en: "Set R higher than G and B" },
        { zh: "把 B 設得比 R、G 都大", en: "Set B higher than G and B" },
        { zh: "Radius 只有一個數值，不能分開設定", en: "Radius is a single value — it can't be set per channel" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Radius 的三個分量分別代表紅/綠/藍三個色道各自的散射距離——紅光在真實皮膚組織裡確實比藍光穿透得更遠，把 R 設得比 G、B 都大，逆光邊緣才會透出偏紅的光暈，這正是耳朵、鼻尖逆光發紅的真實原因。",
        en: "Radius's three components are each color channel's scattering distance — red light genuinely penetrates real skin tissue farther than blue. Setting R higher than G and B produces the reddish backlit glow — the actual reason a backlit ear or nose tip looks red.",
      },
    },
  ],
};
