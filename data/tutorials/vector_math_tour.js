export default {
  id: "tutorial_vector_math_tour",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "認識向量數學：長度、正規化、外積", en: "Get to Know Vector Math: Length, Normalize, Cross Product" },
  description: {
    zh: "向量數學（Vector Math）的內積（Dot Product）已經在「羅盤材質」教學教過；這篇換個角度，帶你認識幾何（Geometry）分類的長度（Length）、正規化（Normalize），還有外積（Cross Product）——用長度做出一個以物體中心為圓心的放射狀漸層，直接看到效果。",
    en: "Vector Math's Dot Product is already covered in the 'Compass Material' tutorial. This one takes a different angle, covering the Geometry category's Length and Normalize, plus Cross Product — using Length to build a radial gradient centered on the object, so you see the effect directly.",
  },
  startGraph: {
    nodes: [
      { id: "t_vmt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "t_vmt_principled", typeId: "shader_principled_bsdf", x: 800, y: 100, params: {} },
    ],
    links: [{ id: "t_vmt_l1", fromNode: "t_vmt_principled", fromSocket: "bsdf", toNode: "t_vmt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vmt_out", typeId: "output_material", x: 1300, y: 200, params: {} },
      { id: "te_vmt_principled", typeId: "shader_principled_bsdf", x: 1000, y: 100, params: {} },
      { id: "te_vmt_ramp", typeId: "converter_color_ramp", x: 740, y: 100, params: {} },
      { id: "te_vmt_vecmath", typeId: "vector_math", x: 480, y: 100, params: { operation: "cross", vector2: [0, 1, 0] } },
      { id: "te_vmt_texcoord", typeId: "input_texture_coordinate", x: 220, y: 100, params: {} },
    ],
    links: [
      { id: "te_vmt_l1", fromNode: "te_vmt_principled", fromSocket: "bsdf", toNode: "te_vmt_out", toSocket: "surface" },
      { id: "te_vmt_l2", fromNode: "te_vmt_ramp", fromSocket: "color", toNode: "te_vmt_principled", toSocket: "baseColor" },
      { id: "te_vmt_l3", fromNode: "te_vmt_vecmath", fromSocket: "value", toNode: "te_vmt_ramp", toSocket: "fac" },
      { id: "te_vmt_l4", fromNode: "te_vmt_texcoord", fromSocket: "object", toNode: "te_vmt_vecmath", toSocket: "vector1" },
    ],
  },
  loadSteps: () => import("./vector_math_tour.steps.js").then((m) => m.default),
};
