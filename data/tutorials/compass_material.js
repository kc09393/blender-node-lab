export default {
  id: "tutorial_compass_material",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "羅盤材質：用向量數學指向固定方向", en: "Compass Material: Pointing a Fixed Direction with Vector Math" },
  description: {
    zh: "菲涅爾（Fresnel）驅動的效果永遠只跟「攝影機角度」有關，轉動攝影機時亮邊會一直跟著跑。但如果你想要一個「不管怎麼轉動攝影機，永遠固定指向某個方向」的效果（例如物體上一個固定的發光標記），就要換一種做法：用向量數學（Vector Math）的內積（Dot Product）算出「表面法線」跟「你指定的固定方向」有多接近，越接近就越亮。這篇教學示範這個技巧，順便介紹怎麼用數值（Value）節點把一個常用參數抽出來獨立調整。",
    en: "Fresnel-driven effects only ever depend on camera angle — the bright edge always follows the camera as you orbit. But if you want an effect that stays fixed to a chosen direction in object space (like a fixed glowing marker on an object) regardless of camera movement, you need a different technique: Vector Math's Dot Product measures how closely the surface normal aligns with a direction you pick — the closer, the brighter. This tutorial builds that effect, and shows how to extract a frequently-tuned parameter into its own Value node.",
  },
  startGraph: {
    nodes: [
      { id: "t_cm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.5 } },
    ],
    links: [{ id: "t_cm_l1", fromNode: "t_cm_principled", fromSocket: "bsdf", toNode: "t_cm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cm_out", typeId: "output_material", x: 1900, y: 260, params: {} },
      { id: "te_cm_add", typeId: "shader_add_shader", x: 1620, y: 160, params: {} },
      { id: "te_cm_principled", typeId: "shader_principled_bsdf", x: 1340, y: 20, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.5 } },
      { id: "te_cm_emission", typeId: "shader_emission", x: 1340, y: 280, params: { strength: 4 } },
      {
        id: "te_cm_ramp",
        typeId: "converter_color_ramp",
        x: 1080,
        y: 280,
        params: { stops: [{ position: 0, color: [0, 0, 0, 1] }, { position: 0.6, color: [0, 0, 0, 1] }, { position: 0.85, color: [0.3, 0.8, 1, 1] }, { position: 1, color: [1, 1, 1, 1] }] },
      },
      { id: "te_cm_power", typeId: "converter_math", x: 820, y: 280, params: { operation: "power" } },
      { id: "te_cm_sharpness", typeId: "input_value", x: 560, y: 380, params: { value: 6 } },
      { id: "te_cm_maprange", typeId: "converter_map_range", x: 560, y: 220, params: { fromMin: -1, fromMax: 1, toMin: 0, toMax: 1 } },
      { id: "te_cm_dot", typeId: "vector_math", x: 300, y: 220, params: { operation: "dot", vector2: [0.4, 0.7, 0.5] } },
      { id: "te_cm_texcoord", typeId: "input_texture_coordinate", x: 40, y: 220, params: {} },
    ],
    links: [
      { id: "te_cm_l1", fromNode: "te_cm_add", fromSocket: "bsdf", toNode: "te_cm_out", toSocket: "surface" },
      { id: "te_cm_l2", fromNode: "te_cm_principled", fromSocket: "bsdf", toNode: "te_cm_add", toSocket: "shader1" },
      { id: "te_cm_l3", fromNode: "te_cm_emission", fromSocket: "bsdf", toNode: "te_cm_add", toSocket: "shader2" },
      { id: "te_cm_l4", fromNode: "te_cm_ramp", fromSocket: "color", toNode: "te_cm_emission", toSocket: "color" },
      { id: "te_cm_l5", fromNode: "te_cm_power", fromSocket: "value", toNode: "te_cm_ramp", toSocket: "fac" },
      { id: "te_cm_l6", fromNode: "te_cm_maprange", fromSocket: "value", toNode: "te_cm_power", toSocket: "value1" },
      { id: "te_cm_l7", fromNode: "te_cm_sharpness", fromSocket: "value", toNode: "te_cm_power", toSocket: "value2" },
      { id: "te_cm_l8", fromNode: "te_cm_dot", fromSocket: "value", toNode: "te_cm_maprange", toSocket: "value" },
      { id: "te_cm_l9", fromNode: "te_cm_texcoord", fromSocket: "normal", toNode: "te_cm_dot", toSocket: "vector1" },
    ],
  },
  loadSteps: () => import("./compass_material.steps.js").then((m) => m.default),
};
