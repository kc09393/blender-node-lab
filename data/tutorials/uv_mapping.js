export default {
  id: "tutorial_uv_mapping",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "座標與 Mapping 入門", en: "Coordinates & Mapping Basics" },
  description: {
    zh: "用棋盤格紋理認識 UV 座標，學會用紋理座標（Texture Coordinate）跟映射（Mapping）節點控制貼圖怎麼貼、貼幾次、貼在哪裡。",
    en: "Use a checker pattern to understand UV coordinates, and learn to control how a texture wraps, tiles, and positions using Texture Coordinate and Mapping.",
  },
  startGraph: {
    nodes: [
      { id: "t_uv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_uv_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_uv_l1", fromNode: "t_uv_principled", fromSocket: "bsdf", toNode: "t_uv_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_uv_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_uv_principled", typeId: "shader_principled_bsdf", x: 660, y: 100, params: {} },
      { id: "te_uv_checker", typeId: "texture_checker", x: 440, y: 100, params: {} },
      { id: "te_uv_mapping", typeId: "vector_mapping", x: 220, y: 100, params: { scale: [4, 4, 4], location: [0.3, 0, 0] } },
      { id: "te_uv_texcoord", typeId: "input_texture_coordinate", x: 0, y: 100, params: {} },
    ],
    links: [
      { id: "te_uv_l1", fromNode: "te_uv_principled", fromSocket: "bsdf", toNode: "te_uv_out", toSocket: "surface" },
      { id: "te_uv_l2", fromNode: "te_uv_checker", fromSocket: "color", toNode: "te_uv_principled", toSocket: "baseColor" },
      { id: "te_uv_l3", fromNode: "te_uv_mapping", fromSocket: "vector", toNode: "te_uv_checker", toSocket: "vector" },
      { id: "te_uv_l4", fromNode: "te_uv_texcoord", fromSocket: "generated", toNode: "te_uv_mapping", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./uv_mapping.steps.js").then((m) => m.default),
};
