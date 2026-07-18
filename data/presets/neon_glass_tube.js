export default {
  id: "neon_glass_tube",
  name: { zh: "霓虹燈管", en: "Neon Glass Tube" },
  description: {
    zh: "跟既有的霓虹發光（單純一片 Emission）不同，這個材質用混合著色器真的疊了兩層：菲涅爾算出「正對鏡頭 vs 側邊掠視」的比例、Math 節點把它反過來（1 減菲涅爾），讓正面看得到的核心區域混入明亮的 Emission、側邊掠視角度露出玻璃 BSDF 的反光——很接近真正霓虹燈管「玻璃管壁包著發光氣體」的雙層結構。",
    en: "Unlike the existing flat-Emission neon material, this one genuinely layers two shaders with Mix Shader: Fresnel computes how head-on vs. grazing the view is, a Math node inverts it (1 minus Fresnel), so the head-on core blends in bright Emission while grazing angles reveal the Glass BSDF's reflections — closer to a real neon tube's glowing-gas-inside-a-glass-tube structure.",
  },
  graph: {
    nodes: [
      { id: "ngt_out", typeId: "output_material", x: 820, y: 220, params: {} },
      { id: "ngt_fresnel", typeId: "input_fresnel", x: 0, y: 100, params: { ior: 1.45 } },
      { id: "ngt_invert", typeId: "converter_math", x: 260, y: 100, params: { value1: 1, operation: "subtract" } },
      { id: "ngt_glass", typeId: "shader_glass_bsdf", x: 260, y: 300, params: { color: [0.85, 0.95, 1, 1], roughness: 0.02, ior: 1.45 } },
      { id: "ngt_emission", typeId: "shader_emission", x: 260, y: 440, params: { color: [1, 0.2, 0.75, 1], strength: 3 } },
      { id: "ngt_mix", typeId: "shader_mix_shader", x: 560, y: 300, params: {} },
    ],
    links: [
      { id: "ngt_l1", fromNode: "ngt_fresnel", fromSocket: "fac", toNode: "ngt_invert", toSocket: "value2" },
      { id: "ngt_l2", fromNode: "ngt_invert", fromSocket: "value", toNode: "ngt_mix", toSocket: "fac" },
      { id: "ngt_l3", fromNode: "ngt_glass", fromSocket: "bsdf", toNode: "ngt_mix", toSocket: "shader1" },
      { id: "ngt_l4", fromNode: "ngt_emission", fromSocket: "bsdf", toNode: "ngt_mix", toSocket: "shader2" },
      { id: "ngt_l5", fromNode: "ngt_mix", fromSocket: "bsdf", toNode: "ngt_out", toSocket: "surface" },
    ],
  },
};
