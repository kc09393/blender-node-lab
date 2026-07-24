export default {
  id: "tutorial_fresnel_invert_core_glow",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "菲涅爾反轉：核心發光、邊緣透明", en: "Inverting Fresnel: Glowing Core, Glassy Edge" },
  description: {
    zh: "菲涅爾（Fresnel）天生是「側邊掠視角度數值高、正對鏡頭數值低」——這剛好跟「正面看得到核心發光、側邊才露出玻璃反光」的需求完全相反。這篇教一個簡單但好用的技巧：用數學（Math）節點的「相減」算出「1 減菲涅爾」，直接把整條曲線上下反過來，霓虹燈管這種材質就是這樣做出來的。",
    en: "Fresnel is naturally high at grazing angles and low head-on — exactly backwards from what you want when the glowing core should show head-on and the glassy reflection should appear at the edges. This tutorial teaches a simple, reusable trick: use a Math node's Subtract operation to compute '1 minus Fresnel,' flipping the curve upside down. This is exactly how the Neon Glass Tube preset works.",
  },
  startGraph: {
    nodes: [
      { id: "t_ficg_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_ficg_glass", typeId: "shader_glass_bsdf", x: 320, y: 200, params: { color: [0.85, 0.95, 1, 1], roughness: 0.02, ior: 1.45 } },
    ],
    links: [{ id: "t_ficg_l1", fromNode: "t_ficg_glass", fromSocket: "bsdf", toNode: "t_ficg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ficg_out", typeId: "output_material", x: 1100, y: 260 },
      { id: "te_ficg_fresnel", typeId: "input_fresnel", x: 320, y: 60, params: { ior: 1.45 } },
      { id: "te_ficg_invert", typeId: "converter_math", x: 580, y: 60, params: { value1: 1, operation: "subtract" } },
      { id: "te_ficg_glass", typeId: "shader_glass_bsdf", x: 320, y: 260, params: { color: [0.85, 0.95, 1, 1], roughness: 0.02, ior: 1.45 } },
      { id: "te_ficg_emission", typeId: "shader_emission", x: 320, y: 420, params: { color: [1, 0.2, 0.75, 1], strength: 3 } },
      { id: "te_ficg_mix", typeId: "shader_mix_shader", x: 780, y: 260 },
    ],
    links: [
      { id: "te_ficg_l1", fromNode: "te_ficg_fresnel", fromSocket: "fac", toNode: "te_ficg_invert", toSocket: "value2" },
      { id: "te_ficg_l2", fromNode: "te_ficg_invert", fromSocket: "value", toNode: "te_ficg_mix", toSocket: "fac" },
      { id: "te_ficg_l3", fromNode: "te_ficg_glass", fromSocket: "bsdf", toNode: "te_ficg_mix", toSocket: "shader1" },
      { id: "te_ficg_l4", fromNode: "te_ficg_emission", fromSocket: "bsdf", toNode: "te_ficg_mix", toSocket: "shader2" },
      { id: "te_ficg_l5", fromNode: "te_ficg_mix", fromSocket: "bsdf", toNode: "te_ficg_out", toSocket: "surface" },
    ],
  },
  loadSteps: () => import("./fresnel_invert_core_glow.steps.js").then((m) => m.default),
};
