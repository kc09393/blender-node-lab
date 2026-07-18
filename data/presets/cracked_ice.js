export default {
  id: "cracked_ice",
  name: { zh: "裂冰層", en: "Cracked Ice Sheet" },
  description: {
    zh: "沃羅諾伊到邊緣距離接顏色漸變做出冰層裂紋的顏色，直接餵給玻璃 BSDF 的顏色插槽；另用常量插值的顏色漸變做出硬邊遮罩，決定裂縫處是清澈玻璃還是霧面反光。",
    en: "Voronoi's Distance to Edge feeds a Color Ramp coloring the ice cracks, piped directly into Glass BSDF's Color; a separate Constant-interpolation Color Ramp makes a hard-edged mask deciding whether a crack shows clear glass or a frosty glossy reflection.",
  },
  graph: {
    nodes: [
      { id: "ice_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "ice_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "ice_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [5, 5, 5] } },
      { id: "ice_voronoi", typeId: "texture_voronoi", x: 260, y: 100, params: { feature: "distance_to_edge", randomness: 1 } },
      {
        id: "ice_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.15, color: [0.75, 0.9, 1, 1] },
            { position: 1, color: [0.6, 0.85, 0.95, 1] },
          ],
        },
      },
      { id: "ice_glass", typeId: "shader_glass_bsdf", x: 1040, y: 40, params: { roughness: 0.06, ior: 1.31 } },
      { id: "ice_edge_ramp", typeId: "converter_color_ramp", x: 540, y: 380, params: { interpolation: "constant", stops: [{ position: 0, color: [1, 1, 1, 1] }, { position: 0.06, color: [0, 0, 0, 1] }] } },
      { id: "ice_edge_bw", typeId: "converter_rgb_to_bw", x: 780, y: 380, params: {} },
      { id: "ice_frost_glossy", typeId: "shader_glossy_bsdf", x: 1040, y: 380, params: { color: [0.95, 0.98, 1, 1], roughness: 0.5 } },
      { id: "ice_mix", typeId: "shader_mix_shader", x: 1300, y: 200, params: {} },
    ],
    links: [
      { id: "ice_l1", fromNode: "ice_texcoord", fromSocket: "generated", toNode: "ice_mapping", toSocket: "vector" },
      { id: "ice_l2", fromNode: "ice_mapping", fromSocket: "vector", toNode: "ice_voronoi", toSocket: "vector" },
      { id: "ice_l3", fromNode: "ice_voronoi", fromSocket: "distance", toNode: "ice_ramp", toSocket: "fac" },
      { id: "ice_l4", fromNode: "ice_ramp", fromSocket: "color", toNode: "ice_glass", toSocket: "color" },
      { id: "ice_l5", fromNode: "ice_voronoi", fromSocket: "distance", toNode: "ice_edge_ramp", toSocket: "fac" },
      { id: "ice_l6", fromNode: "ice_edge_ramp", fromSocket: "color", toNode: "ice_edge_bw", toSocket: "color" },
      { id: "ice_l7", fromNode: "ice_edge_bw", fromSocket: "value", toNode: "ice_mix", toSocket: "fac" },
      { id: "ice_l8", fromNode: "ice_glass", fromSocket: "bsdf", toNode: "ice_mix", toSocket: "shader1" },
      { id: "ice_l9", fromNode: "ice_frost_glossy", fromSocket: "bsdf", toNode: "ice_mix", toSocket: "shader2" },
      { id: "ice_l10", fromNode: "ice_mix", fromSocket: "bsdf", toNode: "ice_out", toSocket: "surface" },
    ],
  },
};
