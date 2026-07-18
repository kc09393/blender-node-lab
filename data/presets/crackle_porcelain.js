export default {
  id: "crackle_porcelain",
  name: { zh: "開片瓷釉", en: "Crackle Glaze Porcelain" },
  description: {
    zh: "全站第一個用上沃羅諾伊「平滑 F1 Smooth F1」特徵的材質：一顆低頻的 Smooth F1 染出瓷釉本身柔和的冷暖底色差異，另一顆高頻的「到邊緣的距離」透過正片疊底混合疊出開片瓷特有的細密裂紋線——裂紋只影響顏色，不接凹凸，因為真實開片瓷的裂紋是釉面顏色滲透造成的，摸起來仍然平滑光亮。",
    en: "The site's first material to use Voronoi's Smooth F1 feature: a low-frequency Smooth F1 tints the glaze's subtle warm/cool undertone, while a separate high-frequency Distance to Edge multiplies in the fine crackle lines characteristic of crackle-glaze porcelain. The cracks only affect color — no bump — because real crackle glaze is a color stain in the glaze, still glass-smooth to the touch.",
  },
  graph: {
    nodes: [
      { id: "por_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "por_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "por_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [9, 9, 9] } },
      { id: "por_voronoi_tint", typeId: "texture_voronoi", x: 260, y: 60, params: { feature: "smooth_f1", smoothness: 0.5, randomness: 1, scale: 5 } },
      {
        id: "por_tint_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.86, 0.89, 0.92, 1] },
            { position: 1, color: [0.97, 0.95, 0.9, 1] },
          ],
        },
      },
      { id: "por_voronoi_crack", typeId: "texture_voronoi", x: 260, y: 340, params: { feature: "distance_to_edge", randomness: 1, scale: 38 } },
      {
        id: "por_crack_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 340,
        params: {
          stops: [
            { position: 0, color: [0.25, 0.22, 0.2, 1] },
            { position: 0.04, color: [1, 1, 1, 1] },
            { position: 1, color: [1, 1, 1, 1] },
          ],
        },
      },
      { id: "por_mix", typeId: "color_mix", x: 800, y: 200, params: { fac: 1, mode: "multiply" } },
      { id: "por_principled", typeId: "shader_principled_bsdf", x: 1060, y: 200, params: { roughness: 0.08, metallic: 0 } },
    ],
    links: [
      { id: "por_l1", fromNode: "por_texcoord", fromSocket: "generated", toNode: "por_mapping", toSocket: "vector" },
      { id: "por_l2", fromNode: "por_mapping", fromSocket: "vector", toNode: "por_voronoi_tint", toSocket: "vector" },
      { id: "por_l3", fromNode: "por_voronoi_tint", fromSocket: "distance", toNode: "por_tint_ramp", toSocket: "fac" },
      { id: "por_l4", fromNode: "por_mapping", fromSocket: "vector", toNode: "por_voronoi_crack", toSocket: "vector" },
      { id: "por_l5", fromNode: "por_voronoi_crack", fromSocket: "distance", toNode: "por_crack_ramp", toSocket: "fac" },
      { id: "por_l6", fromNode: "por_tint_ramp", fromSocket: "color", toNode: "por_mix", toSocket: "a" },
      { id: "por_l7", fromNode: "por_crack_ramp", fromSocket: "color", toNode: "por_mix", toSocket: "b" },
      { id: "por_l8", fromNode: "por_mix", fromSocket: "color", toNode: "por_principled", toSocket: "baseColor" },
      { id: "por_l9", fromNode: "por_principled", fromSocket: "bsdf", toNode: "por_out", toSocket: "surface" },
    ],
  },
};
