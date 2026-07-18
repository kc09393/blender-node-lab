import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_float_curve",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "曲線編輯器：反轉粗糙度", en: "Curve Editor: Invert Roughness" },
  description: {
    zh: "用數值曲線（Float Curve）節點拖拉出一條自訂的數值對應曲線，把雜訊紋理（Noise Texture）的明暗關係整個反過來，理解曲線編輯器比顏色漸變（Color Ramp）/映射範圍（Map Range）更自由的地方。",
    en: "Drag out a custom value-mapping curve with the Float Curve node to flip Noise Texture's light/dark relationship entirely — see how the curve editor is more flexible than Color Ramp or Map Range.",
  },
  startGraph: {
    nodes: [
      { id: "t_fc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_fc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_fc_l1", fromNode: "t_fc_principled", fromSocket: "bsdf", toNode: "t_fc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_fc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_fc_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_fc_curve",
        typeId: "converter_float_curve",
        x: 560,
        y: 100,
        params: { fac: 1, points: [{ x: 0, y: 1 }, { x: 1, y: 0 }] },
      },
      { id: "te_fc_noise", typeId: "texture_noise", x: 320, y: 100, params: {} },
    ],
    links: [
      { id: "te_fc_l1", fromNode: "te_fc_principled", fromSocket: "bsdf", toNode: "te_fc_out", toSocket: "surface" },
      { id: "te_fc_l2", fromNode: "te_fc_curve", fromSocket: "value", toNode: "te_fc_principled", toSocket: "roughness" },
      { id: "te_fc_l3", fromNode: "te_fc_noise", fromSocket: "fac", toNode: "te_fc_curve", toSocket: "value" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Noise Texture", en: "Step 1: Add a Noise Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入雜訊紋理（Noise Texture），等一下用它的雜訊當作曲線的輸入來源。",
        en: "Drag in a Noise Texture from the Texture category — we'll feed its noise into the curve.",
      },
      check: (graph) => hasNodeOfType(graph, "texture_noise"),
    },
    {
      title: { zh: "第二步：加入 Float Curve", en: "Step 2: Add a Float Curve" },
      instruction: {
        zh: "從「轉換器 Converter」分類拖入數值曲線（Float Curve），把雜訊紋理（Noise Texture）的係數（Fac）接到它的數值（Value）輸入。",
        en: "Drag in a Float Curve from the Converter category and connect Noise Texture's Fac to its Value input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_float_curve", "value"),
    },
    {
      title: { zh: "第三步：接到 Roughness", en: "Step 3: Feed Roughness" },
      instruction: {
        zh: "把數值曲線（Float Curve）的數值（Value）輸出接到原理化 BSDF（Principled BSDF）的粗糙度（Roughness）。預設曲線是一條對角直線（等於沒有改變原本的值）。",
        en: "Connect Float Curve's Value output to Principled BSDF's Roughness. The default curve is a diagonal line — it doesn't change the value yet.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_float_curve", "value", "shader_principled_bsdf", "roughness"),
    },
    {
      title: { zh: "第四步：把曲線拖成反向", en: "Step 4: Drag the Curve Into Reverse" },
      instruction: {
        zh: "在數值曲線（Float Curve）節點卡片上，把左下角的控制點拖到左上角，右上角的控制點拖到右下角——曲線從「左低右高」變成「左高右低」。雜訊裡原本比較亮的地方，粗糙度反而會變低（更光滑）。",
        en: "On the Float Curve node card, drag the bottom-left control point to the top-left, and the top-right point to the bottom-right — the curve flips from rising to falling. Areas that were brighter in the noise now get lower roughness (smoother) instead.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "converter_float_curve", "points", (pts) => {
          if (!Array.isArray(pts) || pts.length < 2) return false;
          const sorted = [...pts].sort((a, b) => a.x - b.x);
          return sorted[0].y - sorted[sorted.length - 1].y > 0.4;
        }),
    },
  ],
};
