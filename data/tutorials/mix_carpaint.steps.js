import { hasNodeOfType, nodeHasIncomingFromType, hasLinkBetweenTypes } from "../../js/core/tutorialChecks.js";

export default {
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
        zh: "真正的車漆是「正面看得到底漆、側邊會反光」。\n\n加入菲涅爾（Fresnel）節點（輸入 Input 分類），把它的係數（Fac）輸出接到混合著色器（Mix Shader）的 Fac，取代原本固定的滑桿數值。這樣反光比例會依角度自動變化。",
        en: "Real car paint shows the base coat head-on but reflects more at grazing angles.\n\nAdd a Fresnel node (Input category) and connect its Fac output to Mix Shader's Fac, replacing the fixed slider. Now the reflection ratio changes automatically with viewing angle.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac"),
    },
  ],
};
