export default {
  id: "glass",
  name: { zh: "玻璃", en: "Glass" },
  description: {
    zh: "單一玻璃 BSDF 節點：粗糙度壓到接近 0 做出清澈感，IOR 設 1.45（真實玻璃的折射率）。",
    en: "A single Glass BSDF node: Roughness near 0 for clarity, IOR set to 1.45 (real glass's refractive index).",
  },
  graph: {
    nodes: [
      { id: "glass_out", typeId: "output_material", x: 480, y: 160, params: {} },
      { id: "glass_bsdf", typeId: "shader_glass_bsdf", x: 160, y: 120, params: { color: [1, 1, 1, 1], roughness: 0.02, ior: 1.45 } },
    ],
    links: [{ id: "glass_l1", fromNode: "glass_bsdf", fromSocket: "bsdf", toNode: "glass_out", toSocket: "surface" }],
  },
};
