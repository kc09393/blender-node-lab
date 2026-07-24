export default {
  id: "tutorial_opal_gem_gradient",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "蛋白石效果：雙重驅動的漸層", en: "Opal Gem: A Gradient Driven by Two Sources" },
  description: {
    zh: "真正好看的漸層效果很少只靠單一輸入驅動——蛋白石（Opal）的變彩效果同時受「觀察角度」跟「內部雜訊結構」影響。這篇教學把菲涅爾（Fresnel）跟雜訊紋理（Noise Texture）用數學節點結合成一個驅動值，再接到顏色漸變（Color Ramp）做出比單一輸入更有機、更不規則的多彩漸層。",
    en: "The best-looking gradients rarely come from a single input — an opal's play-of-color depends on both viewing angle and its internal noise structure. This tutorial combines Fresnel and Noise Texture with a Math node into one driving value, feeding a Color Ramp for a more organic, irregular multicolor gradient than either input alone could produce.",
  },
  startGraph: {
    nodes: [
      { id: "t_op_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_op_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.08, metallic: 0 } },
    ],
    links: [{ id: "t_op_l1", fromNode: "t_op_principled", fromSocket: "bsdf", toNode: "t_op_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_op_out", typeId: "output_material", x: 1500, y: 220, params: {} },
      { id: "te_op_principled", typeId: "shader_principled_bsdf", x: 1220, y: 120, params: { roughness: 0.08, metallic: 0 } },
      {
        id: "te_op_ramp",
        typeId: "converter_color_ramp",
        x: 960,
        y: 120,
        params: {
          stops: [
            { position: 0, color: [0.9, 0.92, 0.95, 1] },
            { position: 0.25, color: [0.2, 0.55, 0.9, 1] },
            { position: 0.5, color: [0.25, 0.85, 0.4, 1] },
            { position: 0.75, color: [0.95, 0.6, 0.15, 1] },
            { position: 1, color: [0.9, 0.25, 0.55, 1] },
          ],
        },
      },
      { id: "te_op_add", typeId: "converter_math", x: 700, y: 120, params: { operation: "add" } },
      { id: "te_op_fresnel", typeId: "input_fresnel", x: 460, y: 40, params: { ior: 1.4 } },
      { id: "te_op_noise", typeId: "texture_noise", x: 460, y: 240, params: { scale: 6, detail: 4 } },
    ],
    links: [
      { id: "te_op_l1", fromNode: "te_op_principled", fromSocket: "bsdf", toNode: "te_op_out", toSocket: "surface" },
      { id: "te_op_l2", fromNode: "te_op_ramp", fromSocket: "color", toNode: "te_op_principled", toSocket: "baseColor" },
      { id: "te_op_l3", fromNode: "te_op_add", fromSocket: "value", toNode: "te_op_ramp", toSocket: "fac" },
      { id: "te_op_l4", fromNode: "te_op_fresnel", fromSocket: "fac", toNode: "te_op_add", toSocket: "value1" },
      { id: "te_op_l5", fromNode: "te_op_noise", fromSocket: "fac", toNode: "te_op_add", toSocket: "value2" },
    ],
  },
  loadSteps: () => import("./opal_gem_gradient.steps.js").then((m) => m.default),
};
