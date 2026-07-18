export default {
  id: "checker_toy",
  name: { zh: "棋盤玩具色", en: "Checker Toy" },
  description: {
    zh: "棋盤格紋理直接接到底色，兩色交錯不需要任何遮罩或混合著色器。",
    en: "Checker Texture connects straight to Base Color — no masking or Mix Shader needed for the two alternating colors.",
  },
  graph: {
    nodes: [
      { id: "checker_out", typeId: "output_material", x: 640, y: 140, params: {} },
      { id: "checker_principled", typeId: "shader_principled_bsdf", x: 380, y: 100, params: { roughness: 0.35, metallic: 0, alpha: 1 } },
      { id: "checker_texcoord", typeId: "input_texture_coordinate", x: 0, y: 100, params: {} },
      { id: "checker_checker", typeId: "texture_checker", x: 200, y: 100, params: { color1: [0.95, 0.2, 0.25, 1], color2: [0.95, 0.85, 0.15, 1], scale: 6 } },
    ],
    links: [
      { id: "checker_l1", fromNode: "checker_principled", fromSocket: "bsdf", toNode: "checker_out", toSocket: "surface" },
      { id: "checker_l2", fromNode: "checker_texcoord", fromSocket: "generated", toNode: "checker_checker", toSocket: "vector" },
      { id: "checker_l3", fromNode: "checker_checker", fromSocket: "color", toNode: "checker_principled", toSocket: "baseColor" },
    ],
  },
};
