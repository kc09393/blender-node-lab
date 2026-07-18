export default {
  id: "neon_emission",
  name: { zh: "霓虹發光", en: "Neon Emission" },
  description: {
    zh: "單一發光節點：高強度（6）＋高飽和色，自發光不受場景燈光影響。",
    en: "A single Emission node: high Strength (6) with a saturated color — self-illuminating, unaffected by scene lighting.",
  },
  graph: {
    nodes: [
      { id: "neon_out", typeId: "output_material", x: 420, y: 140, params: {} },
      { id: "neon_emit", typeId: "shader_emission", x: 120, y: 100, params: { color: [0.15, 0.9, 1, 1], strength: 6 } },
    ],
    links: [{ id: "neon_l1", fromNode: "neon_emit", fromSocket: "bsdf", toNode: "neon_out", toSocket: "surface" }],
  },
};
