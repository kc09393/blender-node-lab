import { hasNodeOfType, nodeHasIncomingFromType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_layer_weight_clearcoat",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "層權重：清漆塗層", en: "Layer Weight: Clearcoat Finish" },
  description: {
    zh: "層權重（Layer Weight）節點跟菲涅爾（Fresnel）很像，但多了一個更直覺的 Blend 滑桿，常用來在原本的材質上疊一層清漆/光澤塗層。",
    en: "Layer Weight is similar to Fresnel but adds a more intuitive Blend slider — commonly used to layer a clearcoat/gloss finish on top of a base material.",
  },
  startGraph: {
    nodes: [
      { id: "t_lw_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_lw_principled", typeId: "shader_principled_bsdf", x: 0, y: 60, params: { baseColor: [0.05, 0.15, 0.45, 1], roughness: 0.5 } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_lw_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_lw_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_lw_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.05, 0.15, 0.45, 1], roughness: 0.5 } },
      { id: "te_lw_glossy", typeId: "shader_glossy_bsdf", x: 500, y: 280, params: { roughness: 0.05 } },
      { id: "te_lw_lw", typeId: "input_layer_weight", x: 500, y: 460, params: { blend: 0.2 } },
    ],
    links: [
      { id: "te_lw_l1", fromNode: "te_lw_mix", fromSocket: "bsdf", toNode: "te_lw_out", toSocket: "surface" },
      { id: "te_lw_l2", fromNode: "te_lw_principled", fromSocket: "bsdf", toNode: "te_lw_mix", toSocket: "shader1" },
      { id: "te_lw_l3", fromNode: "te_lw_glossy", fromSocket: "bsdf", toNode: "te_lw_mix", toSocket: "shader2" },
      { id: "te_lw_l4", fromNode: "te_lw_lw", fromSocket: "fresnel", toNode: "te_lw_mix", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入光澤 BSDF 當作清漆層", en: "Step 1: Add a Glossy BSDF for the Clearcoat" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入光澤 BSDF（Glossy BSDF），粗糙度（Roughness）調到接近 0（例如 0.05）——清漆通常非常光滑。",
        en: "Drag in a Glossy BSDF from the Shader category, with Roughness near 0 (e.g. 0.05) — clearcoat is usually very smooth.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_glossy_bsdf") && anyNodeParamMatches(graph, "shader_glossy_bsdf", "roughness", (v) => v <= 0.1),
    },
    {
      title: { zh: "第二步：用混合著色器疊上底漆", en: "Step 2: Layer It Over the Base Coat with Mix Shader" },
      instruction: {
        zh: "拖入混合著色器（Mix Shader），把原本的原理化 BSDF（Principled BSDF，車身底色）跟光澤 BSDF 分別接到兩個著色器（Shader）插槽，再接到材質輸出（Material Output）。",
        en: "Drag in a Mix Shader, connect the existing Principled BSDF (car body base color) and the Glossy BSDF to its two Shader sockets, then wire it to Material Output.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_glossy_bsdf") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader"),
    },
    {
      title: { zh: "第三步：用層權重驅動混合比例", en: "Step 3: Drive the Blend with Layer Weight" },
      instruction: {
        zh: "加入層權重（Layer Weight）節點（輸入 Input 分類），把它的 Fresnel 輸出接到混合著色器的 Fac，取代固定滑桿。\n\n清漆現在只會在邊緣角度顯現。",
        en: "Add a Layer Weight node (Input category) and connect its Fresnel output to Mix Shader's Fac, replacing the fixed slider.\n\nThe clearcoat now only shows up at grazing angles.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_layer_weight", "fresnel", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第四步：調整 Blend 集中程度", en: "Step 4: Adjust How Concentrated the Blend Is" },
      instruction: {
        zh: "把層權重的 Blend 調離預設的 0.5（例如 0.2），過渡效果集中在邊緣的程度會跟著改變。\n\n這是它比純菲涅爾多出來的直覺調整項。",
        en: "Move Layer Weight's Blend away from the default 0.5 (e.g. 0.2) — how concentrated the transition is at the edges will change.\n\nThis is the extra intuitive control it has over plain Fresnel.",
      },
      check: (graph) => anyNodeParamMatches(graph, "input_layer_weight", "blend", (v) => Math.abs(v - 0.5) > 0.15),
    },
  ],
};
