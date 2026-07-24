export default {
  id: "tutorial_xyz_split",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "分離/合併 XYZ：只拉伸單一軸", en: "Separate/Combine XYZ: Stretch Just One Axis" },
  description: {
    zh: "用分離 XYZ（Separate XYZ）把座標拆成三個獨立數值、只對其中一軸做運算，再用合併 XYZ（Combine XYZ）接回去——這是「只想調整某一個方向」時的標準做法。",
    en: "Use Separate XYZ to split a coordinate into three independent values, operate on just one axis, then rejoin with Combine XYZ — the standard pattern when you only want to adjust one direction.",
  },
  startGraph: {
    nodes: [
      { id: "t_xyz_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_xyz_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_xyz_l1", fromNode: "t_xyz_principled", fromSocket: "bsdf", toNode: "t_xyz_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_xyz_out", typeId: "output_material", x: 1500, y: 200, params: {} },
      { id: "te_xyz_principled", typeId: "shader_principled_bsdf", x: 1220, y: 100, params: {} },
      { id: "te_xyz_checker", typeId: "texture_checker", x: 980, y: 100, params: { scale: 8 } },
      { id: "te_xyz_combine", typeId: "converter_combine_xyz", x: 740, y: 100, params: {} },
      { id: "te_xyz_math", typeId: "converter_math", x: 500, y: 60, params: { operation: "multiply", value2: 3 } },
      { id: "te_xyz_separate", typeId: "converter_separate_xyz", x: 260, y: 100, params: {} },
      { id: "te_xyz_texcoord", typeId: "input_texture_coordinate", x: 20, y: 100, params: {} },
    ],
    links: [
      { id: "te_xyz_l1", fromNode: "te_xyz_principled", fromSocket: "bsdf", toNode: "te_xyz_out", toSocket: "surface" },
      { id: "te_xyz_l2", fromNode: "te_xyz_checker", fromSocket: "color", toNode: "te_xyz_principled", toSocket: "baseColor" },
      { id: "te_xyz_l3", fromNode: "te_xyz_combine", fromSocket: "vector", toNode: "te_xyz_checker", toSocket: "vector" },
      { id: "te_xyz_l4", fromNode: "te_xyz_math", fromSocket: "value", toNode: "te_xyz_combine", toSocket: "y" },
      { id: "te_xyz_l5", fromNode: "te_xyz_separate", fromSocket: "y", toNode: "te_xyz_math", toSocket: "value1" },
      { id: "te_xyz_l6", fromNode: "te_xyz_separate", fromSocket: "x", toNode: "te_xyz_combine", toSocket: "x" },
      { id: "te_xyz_l7", fromNode: "te_xyz_texcoord", fromSocket: "generated", toNode: "te_xyz_separate", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./xyz_split.steps.js").then((m) => m.default),
};
