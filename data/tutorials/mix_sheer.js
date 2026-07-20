import { hasNodeOfType, nodeHasIncomingFromType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mix_sheer",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合節點：局部穿透網紗", en: "Mix Shader: Sheer Pattern" },
  description: {
    zh: "用紋理節點的輸出（而不是固定滑桿）當作混合著色器（Mix Shader）的 Fac，做出規律穿透的網紗/窗簾材質。",
    en: "Use a texture node's output (instead of a fixed slider) as Mix Shader's Fac to create a regularly-patterned sheer fabric / curtain material.",
  },
  startGraph: {
    nodes: [
      { id: "t_sh_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_sh_principled", typeId: "shader_principled_bsdf", x: 0, y: 60, params: { baseColor: [0.9, 0.9, 0.85, 1] } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_sh_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_sh_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_sh_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.9, 0.9, 0.85, 1] } },
      { id: "te_sh_transparent", typeId: "shader_transparent_bsdf", x: 500, y: 280, params: {} },
      { id: "te_sh_checker", typeId: "texture_checker", x: 500, y: 460, params: {} },
    ],
    links: [
      { id: "te_sh_l1", fromNode: "te_sh_mix", fromSocket: "bsdf", toNode: "te_sh_out", toSocket: "surface" },
      { id: "te_sh_l2", fromNode: "te_sh_principled", fromSocket: "bsdf", toNode: "te_sh_mix", toSocket: "shader1" },
      { id: "te_sh_l3", fromNode: "te_sh_transparent", fromSocket: "bsdf", toNode: "te_sh_mix", toSocket: "shader2" },
      { id: "te_sh_l4", fromNode: "te_sh_checker", fromSocket: "fac", toNode: "te_sh_mix", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Transparent BSDF", en: "Step 1: Add a Transparent BSDF" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入透明 BSDF（Transparent BSDF），等一下會跟原理化 BSDF（Principled BSDF）混合，做出「有些地方穿透、有些地方不透」的效果。",
        en: "Drag in a Transparent BSDF from the Shader category — we'll mix it with Principled BSDF to make some areas see-through and others opaque.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_transparent_bsdf"),
    },
    {
      title: { zh: "第二步：加入 Mix Shader，接上兩個材質", en: "Step 2: Add Mix Shader and Connect Both" },
      instruction: {
        zh: "拖入混合著色器（Mix Shader），把原理化 BSDF（Principled BSDF）跟透明 BSDF（Transparent BSDF）分別接到它的兩個著色器（Shader）插槽。",
        en: "Drag in a Mix Shader and connect Principled BSDF and Transparent BSDF to its two Shader sockets.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_transparent_bsdf"),
    },
    {
      title: { zh: "第三步：接到 Material Output", en: "Step 3: Connect to Material Output" },
      instruction: {
        zh: "先把混合著色器（Mix Shader）接到材質輸出（Material Output）的表面（Surface），這時候 Fac 還是固定值，整個表面會是均勻的半透明。",
        en: "Connect Mix Shader to Material Output's Surface. With a fixed Fac, the whole surface will be uniformly semi-transparent for now.",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader"),
    },
    {
      title: { zh: "第四步：用棋盤格紋理驅動 Fac", en: "Step 4: Drive Fac with a Checker Texture" },
      instruction: {
        zh: "加入棋盤格紋理（Checker Texture，紋理 Texture 分類），把它的係數（Fac）輸出接到混合著色器（Mix Shader）的 Fac。現在穿透的地方會變成規律的格紋，而不是整片均勻的半透明。\n\n這就是「用紋理節點來控制混合比例」的概念，跟接一個固定滑桿完全不同。",
        en: "Add a Checker Texture (Texture category) and connect its Fac output to Mix Shader's Fac. Now the transparent areas form a regular grid pattern instead of uniform semi-transparency.\n\nThis is the idea of 'driving a blend ratio with a texture node' instead of a fixed slider.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "fac", "shader_mix_shader", "fac"),
    },
  ],
};
