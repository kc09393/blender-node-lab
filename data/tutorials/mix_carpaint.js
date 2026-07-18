import { hasNodeOfType, nodeHasIncomingFromType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mix_carpaint",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "混合節點：車漆效果", en: "Mix Shader: Car Paint" },
  description: {
    zh: "用混合著色器（Mix Shader）把原理化 BSDF（底漆）跟光澤 BSDF（Glossy BSDF，光澤反射）混合，做出邊緣會反光的車漆材質，學會怎麼把兩個材質疊在一起。",
    en: "Blend a Diffuse (base coat) and a Glossy (reflective) shader with Mix Shader to get a car-paint look with edge highlights — learn how to layer two materials together.",
  },
  startGraph: {
    nodes: [
      { id: "t_cp_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cp_principled", typeId: "shader_principled_bsdf", x: 0, y: 100, params: { baseColor: [0.75, 0.05, 0.05, 1] } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_cp_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_cp_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_cp_principled", typeId: "shader_principled_bsdf", x: 500, y: 60, params: { baseColor: [0.75, 0.05, 0.05, 1] } },
      { id: "te_cp_glossy", typeId: "shader_glossy_bsdf", x: 500, y: 300, params: {} },
      { id: "te_cp_fresnel", typeId: "input_fresnel", x: 500, y: 460, params: {} },
    ],
    links: [
      { id: "te_cp_l1", fromNode: "te_cp_mix", fromSocket: "bsdf", toNode: "te_cp_out", toSocket: "surface" },
      { id: "te_cp_l2", fromNode: "te_cp_principled", fromSocket: "bsdf", toNode: "te_cp_mix", toSocket: "shader1" },
      { id: "te_cp_l3", fromNode: "te_cp_glossy", fromSocket: "bsdf", toNode: "te_cp_mix", toSocket: "shader2" },
      { id: "te_cp_l4", fromNode: "te_cp_fresnel", fromSocket: "fac", toNode: "te_cp_mix", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Glossy BSDF", en: "Step 1: Add a Glossy BSDF" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入光澤 BSDF（Glossy BSDF）——它是純反射，等一下會疊在底漆（原理化 BSDF，Principled BSDF）上面。",
        en: "Drag in a Glossy BSDF from the Shader category — it's pure reflection, which we'll layer on top of the base coat (Principled BSDF).",
      },
      check: (graph) => hasNodeOfType(graph, "shader_glossy_bsdf"),
    },
    {
      title: { zh: "第二步：加入 Mix Shader，接上兩個材質", en: "Step 2: Add Mix Shader and Connect Both" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入混合著色器（Mix Shader）。把原理化 BSDF（Principled BSDF）的 BSDF 輸出接到混合著色器上面的著色器（Shader）插槽，光澤 BSDF（Glossy BSDF）接到下面的著色器插槽（順序不影響效果）。",
        en: "Drag in a Mix Shader. Connect Principled BSDF's output to Mix Shader's top Shader socket, and Glossy BSDF to the bottom one (the order doesn't matter functionally).",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_glossy_bsdf"),
    },
    {
      title: { zh: "第三步：接到 Material Output", en: "Step 3: Connect to Material Output" },
      instruction: {
        zh: "把混合著色器（Mix Shader）的輸出接到材質輸出（Material Output）的表面（Surface）。這時候球體看起來應該介於底漆色跟純反射之間（依 Fac 的比例）。",
        en: "Connect Mix Shader's output to Material Output's Surface. The sphere should now look like a blend of the base coat and pure reflection (based on Fac).",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader"),
    },
    {
      title: { zh: "第四步：用 Fresnel 做出邊緣反光", en: "Step 4: Edge Highlights with Fresnel" },
      instruction: {
        zh: "真正的車漆是「正面看得到底漆、側邊會反光」。加入菲涅爾（Fresnel）節點（輸入 Input 分類），把它的係數（Fac）輸出接到混合著色器（Mix Shader）的 Fac，取代原本固定的滑桿數值——這樣反光比例會依角度自動變化。",
        en: "Real car paint shows the base coat head-on but reflects more at grazing angles. Add a Fresnel node (Input category) and connect its Fac output to Mix Shader's Fac, replacing the fixed slider — now the reflection ratio changes automatically with viewing angle.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac"),
    },
  ],
};
