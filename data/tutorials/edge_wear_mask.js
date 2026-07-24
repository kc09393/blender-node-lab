export default {
  id: "tutorial_edge_wear_mask",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "邊緣磨損：油漆刮到露出金屬", en: "Edge Wear: Paint Chipping to Bare Metal" },
  description: {
    zh: "遊戲美術最常用的一招：邊緣磨損（Edge Wear）——物體的平坦處保留原本的漆面，稜角/邊緣則因為長期碰撞磨損露出底下的金屬。做法是用菲涅爾（Fresnel）算出「這裡有多接近邊緣」，接一個切成硬邊的顏色漸變（Color Ramp，常量 Constant 插值）做出「非黑即白」的遮罩，再用這個遮罩驅動混合著色器（Mix Shader）切換兩種完全不同的材質。",
    en: "A classic game-art technique: edge wear — flat surfaces keep their paint, while edges/corners show bare metal from repeated impact. The trick: Fresnel measures 'how close to an edge this is', a hard-edged Color Ramp (Constant interpolation) turns that into an all-or-nothing mask, and the mask drives a Mix Shader to swap between two completely different materials.",
  },
  startGraph: {
    nodes: [
      { id: "t_ewm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "t_ewm_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.65, 0.08, 0.08, 1], roughness: 0.4, metallic: 0 },
      },
    ],
    links: [{ id: "t_ewm_l1", fromNode: "t_ewm_principled", fromSocket: "bsdf", toNode: "t_ewm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ewm_out", typeId: "output_material", x: 1400, y: 260, params: {} },
      { id: "te_ewm_mix", typeId: "shader_mix_shader", x: 1140, y: 200, params: {} },
      {
        id: "te_ewm_paint",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 60,
        params: { baseColor: [0.65, 0.08, 0.08, 1], roughness: 0.4, metallic: 0 },
      },
      {
        id: "te_ewm_metal",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 320,
        params: { baseColor: [0.72, 0.72, 0.75, 1], roughness: 0.2, metallic: 1 },
      },
      { id: "te_ewm_ramp", typeId: "converter_color_ramp", x: 580, y: 460, params: { interpolation: "constant", stops: [{ position: 0, color: [0, 0, 0, 1] }, { position: 0.6, color: [1, 1, 1, 1] }] } },
      { id: "te_ewm_fresnel", typeId: "input_fresnel", x: 320, y: 460, params: { ior: 2.2 } },
    ],
    links: [
      { id: "te_ewm_l1", fromNode: "te_ewm_mix", fromSocket: "bsdf", toNode: "te_ewm_out", toSocket: "surface" },
      { id: "te_ewm_l2", fromNode: "te_ewm_paint", fromSocket: "bsdf", toNode: "te_ewm_mix", toSocket: "shader1" },
      { id: "te_ewm_l3", fromNode: "te_ewm_metal", fromSocket: "bsdf", toNode: "te_ewm_mix", toSocket: "shader2" },
      { id: "te_ewm_l4", fromNode: "te_ewm_ramp", fromSocket: "color", toNode: "te_ewm_mix", toSocket: "fac" },
      { id: "te_ewm_l5", fromNode: "te_ewm_fresnel", fromSocket: "fac", toNode: "te_ewm_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./edge_wear_mask.steps.js").then((m) => m.default),
};
