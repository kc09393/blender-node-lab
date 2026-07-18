export default {
  id: "denim_fabric",
  name: { zh: "牛仔布料", en: "Denim Fabric" },
  description: {
    zh: "棋盤格紋理的高頻方格直接當底色，做出牛仔布經緯交織的雙色調；另用高頻雜訊驅動凹凸，模擬布料纖維的細微顆粒感。",
    en: "Checker Texture's high-frequency squares feed Base Color directly for denim's two-tone woven look; a separate high-frequency Noise Texture drives Bump for the fabric's fine fiber grain.",
  },
  graph: {
    nodes: [
      { id: "denim_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "denim_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "denim_checker", typeId: "texture_checker", x: 0, y: 60, params: { color1: [0.15, 0.25, 0.45, 1], color2: [0.2, 0.32, 0.55, 1], scale: 40 } },
      { id: "denim_noise", typeId: "texture_noise", x: 0, y: 320, params: { scale: 60, detail: 2 } },
      { id: "denim_bump", typeId: "vector_bump", x: 280, y: 320, params: { strength: 0.25 } },
      { id: "denim_principled", typeId: "shader_principled_bsdf", x: 560, y: 200, params: { roughness: 0.75, metallic: 0 } },
    ],
    links: [
      { id: "denim_l1", fromNode: "denim_texcoord", fromSocket: "generated", toNode: "denim_checker", toSocket: "vector" },
      { id: "denim_l2", fromNode: "denim_checker", fromSocket: "color", toNode: "denim_principled", toSocket: "baseColor" },
      { id: "denim_l3", fromNode: "denim_texcoord", fromSocket: "generated", toNode: "denim_noise", toSocket: "vector" },
      { id: "denim_l4", fromNode: "denim_noise", fromSocket: "fac", toNode: "denim_bump", toSocket: "height" },
      { id: "denim_l5", fromNode: "denim_bump", fromSocket: "normal", toNode: "denim_principled", toSocket: "normal" },
      { id: "denim_l6", fromNode: "denim_principled", fromSocket: "bsdf", toNode: "denim_out", toSocket: "surface" },
    ],
  },
};
