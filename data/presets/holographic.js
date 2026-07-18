export default {
  id: "holographic",
  name: { zh: "全息油漬", en: "Holographic Oil Slick" },
  description: {
    zh: "映射節點把座標的 Y 軸大幅拉伸，分離出 Y 分量後用數學的「小數部分 Fraction」讓它規律重複，做出油漬表面一圈圈的彩虹條紋，同時接上底色跟發光色。",
    en: "A Mapping node stretches the Y axis heavily; Separate XYZ extracts Y, and Math's Fraction operation makes it repeat regularly — creating the oil-slick's repeating rainbow bands, fed into both Base Color and Emission Color.",
  },
  graph: {
    nodes: [
      { id: "holo_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      {
        id: "holo_principled",
        typeId: "shader_principled_bsdf",
        x: 1140,
        y: 160,
        params: { roughness: 0.35, metallic: 0.5, emissionStrength: 0.35, alpha: 1 },
      },
      {
        id: "holo_mapping",
        typeId: "vector_mapping",
        x: 0,
        y: 100,
        params: { scale: [1, 20, 1] },
      },
      { id: "holo_sep", typeId: "converter_separate_xyz", x: 260, y: 100, params: {} },
      {
        id: "holo_frac",
        typeId: "converter_math",
        x: 500,
        y: 100,
        params: { operation: "fraction", value1: 0.5 },
      },
      {
        id: "holo_ramp",
        typeId: "converter_color_ramp",
        x: 740,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.42, 0.08, 0.72, 1] },
            { position: 0.16, color: [0.15, 0.25, 0.95, 1] },
            { position: 0.33, color: [0.1, 0.75, 0.9, 1] },
            { position: 0.5, color: [0.2, 0.9, 0.35, 1] },
            { position: 0.66, color: [0.95, 0.9, 0.15, 1] },
            { position: 0.83, color: [0.95, 0.45, 0.1, 1] },
            { position: 1, color: [0.9, 0.1, 0.35, 1] },
          ],
        },
      },
    ],
    links: [
      { id: "holo_l1", fromNode: "holo_mapping", fromSocket: "vector", toNode: "holo_sep", toSocket: "vector" },
      { id: "holo_l2", fromNode: "holo_sep", fromSocket: "y", toNode: "holo_frac", toSocket: "value1" },
      { id: "holo_l3", fromNode: "holo_frac", fromSocket: "value", toNode: "holo_ramp", toSocket: "fac" },
      { id: "holo_l4", fromNode: "holo_ramp", fromSocket: "color", toNode: "holo_principled", toSocket: "baseColor" },
      { id: "holo_l5", fromNode: "holo_ramp", fromSocket: "color", toNode: "holo_principled", toSocket: "emissionColor" },
      { id: "holo_l6", fromNode: "holo_principled", fromSocket: "bsdf", toNode: "holo_out", toSocket: "surface" },
    ],
  },
};
