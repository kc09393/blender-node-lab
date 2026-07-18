export default {
  id: "procedural_wood",
  name: { zh: "程序化木紋", en: "Procedural Wood" },
  description: {
    zh: "波浪紋理的條紋接顏色漸變染色，同一份係數同步驅動粗糙度變化，完全不用貼圖就做出木紋。",
    en: "Wave Texture's stripes feed a Color Ramp for coloring, and the same value simultaneously drives Roughness variation — no image texture needed.",
  },
  graph: {
    nodes: [
      { id: "wood_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "wood_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: { metallic: 0, alpha: 1 } },
      { id: "wood_texcoord", typeId: "input_texture_coordinate", x: 0, y: 100, params: {} },
      { id: "wood_wave", typeId: "texture_wave", x: 200, y: 100, params: { scale: 6, distortion: 2.4 } },
      { id: "wood_ramp", typeId: "converter_color_ramp", x: 420, y: 100, params: { stops: [
        { position: 0, color: [0.25, 0.13, 0.05, 1] },
        { position: 1, color: [0.55, 0.32, 0.15, 1] },
      ] } },
      { id: "wood_maprange", typeId: "converter_map_range", x: 420, y: 340, params: { fromMin: 0, fromMax: 1, toMin: 0.3, toMax: 0.6 } },
    ],
    links: [
      { id: "wood_l1", fromNode: "wood_principled", fromSocket: "bsdf", toNode: "wood_out", toSocket: "surface" },
      { id: "wood_l2", fromNode: "wood_texcoord", fromSocket: "generated", toNode: "wood_wave", toSocket: "vector" },
      { id: "wood_l3", fromNode: "wood_wave", fromSocket: "fac", toNode: "wood_ramp", toSocket: "fac" },
      { id: "wood_l4", fromNode: "wood_ramp", fromSocket: "color", toNode: "wood_principled", toSocket: "baseColor" },
      { id: "wood_l5", fromNode: "wood_wave", fromSocket: "fac", toNode: "wood_maprange", toSocket: "value" },
      { id: "wood_l6", fromNode: "wood_maprange", fromSocket: "value", toNode: "wood_principled", toSocket: "roughness" },
    ],
  },
};
