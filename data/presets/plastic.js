export default {
  id: "glossy_plastic",
  name: { zh: "光滑塑膠", en: "Glossy Plastic" },
  description: {
    zh: "只靠原理化 BSDF 本身：金屬度 0、粗糙度 0.25，「有反光但不是金屬」的塑膠感全靠這兩個參數的組合，沒有接任何其他節點。",
    en: "Just Principled BSDF alone: Metallic 0, Roughness 0.25 — the 'shiny but not metal' plastic look comes purely from that combination, no other nodes involved.",
  },
  graph: {
    nodes: [
      { id: "plastic_out", typeId: "output_material", x: 420, y: 140, params: {} },
      { id: "plastic_principled", typeId: "shader_principled_bsdf", x: 120, y: 100, params: { baseColor: [0.85, 0.12, 0.15, 1], roughness: 0.25, metallic: 0, alpha: 1 } },
    ],
    links: [{ id: "plastic_l1", fromNode: "plastic_principled", fromSocket: "bsdf", toNode: "plastic_out", toSocket: "surface" }],
  },
};
