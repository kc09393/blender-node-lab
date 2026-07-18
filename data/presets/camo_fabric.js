export default {
  id: "camo_fabric",
  name: { zh: "迷彩布料", en: "Camouflage Fabric" },
  description: {
    zh: "沃羅諾伊的距離值接常量（Constant）插值的顏色漸變，做出迷彩特有的硬邊色塊而非漸層；另用獨立雜訊紋理驅動凹凸做出布料紋理。",
    en: "Voronoi's distance feeds a Constant-interpolation Color Ramp for camouflage's characteristic hard-edged color blocks (not a gradient); a separate Noise Texture drives Bump for the fabric's texture.",
  },
  graph: {
    nodes: [
      { id: "camo_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "camo_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "camo_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [5, 5, 5] } },
      { id: "camo_voronoi", typeId: "texture_voronoi", x: 260, y: 100, params: { randomness: 1, scale: 1 } },
      {
        id: "camo_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          interpolation: "constant",
          stops: [
            { position: 0, color: [0.16, 0.18, 0.08, 1] },
            { position: 0.25, color: [0.3, 0.28, 0.16, 1] },
            { position: 0.5, color: [0.1, 0.14, 0.06, 1] },
            { position: 0.75, color: [0.35, 0.32, 0.22, 1] },
          ],
        },
      },
      { id: "camo_noise", typeId: "texture_noise", x: 260, y: 380, params: { detail: 5, roughness: 0.6, scale: 15 } },
      { id: "camo_bump", typeId: "vector_bump", x: 540, y: 380, params: { strength: 0.4 } },
      {
        id: "camo_principled",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 200,
        params: { roughness: 0.85, metallic: 0 },
      },
    ],
    links: [
      { id: "camo_l1", fromNode: "camo_texcoord", fromSocket: "generated", toNode: "camo_mapping", toSocket: "vector" },
      { id: "camo_l2", fromNode: "camo_mapping", fromSocket: "vector", toNode: "camo_voronoi", toSocket: "vector" },
      { id: "camo_l3", fromNode: "camo_mapping", fromSocket: "vector", toNode: "camo_noise", toSocket: "vector" },
      { id: "camo_l4", fromNode: "camo_voronoi", fromSocket: "distance", toNode: "camo_ramp", toSocket: "fac" },
      { id: "camo_l5", fromNode: "camo_ramp", fromSocket: "color", toNode: "camo_principled", toSocket: "baseColor" },
      { id: "camo_l6", fromNode: "camo_noise", fromSocket: "fac", toNode: "camo_bump", toSocket: "height" },
      { id: "camo_l7", fromNode: "camo_bump", fromSocket: "normal", toNode: "camo_principled", toSocket: "normal" },
      { id: "camo_l8", fromNode: "camo_principled", fromSocket: "bsdf", toNode: "camo_out", toSocket: "surface" },
    ],
  },
};
