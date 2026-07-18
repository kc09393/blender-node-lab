export default {
  id: "chainmail_mesh",
  name: { zh: "鎖子甲金屬網", en: "Chainmail Mesh" },
  description: {
    zh: "全站第一次把棋盤格紋理的 Fac 輸出（原本只拿來切換顏色或驅動 Mix Shader）直接接進凹凸節點當高度值——黑白交錯的方格本身就變成一格格突起的金屬環，遠看很有編織金屬網的顆粒感。",
    en: "The site's first material to feed Checker Texture's Fac output (usually used to switch colors or drive a Mix Shader) straight into Bump as a height value — the alternating black/white squares themselves become a grid of raised metal links, reading as a woven mesh from a distance.",
  },
  graph: {
    nodes: [
      { id: "cm_out", typeId: "output_material", x: 820, y: 200, params: {} },
      { id: "cm_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "cm_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [18, 18, 18] } },
      { id: "cm_checker", typeId: "texture_checker", x: 260, y: 160, params: { scale: 1 } },
      { id: "cm_bump", typeId: "vector_bump", x: 540, y: 160, params: { strength: 0.6 } },
      { id: "cm_principled", typeId: "shader_principled_bsdf", x: 800, y: 200, params: { baseColor: [0.55, 0.56, 0.58, 1], roughness: 0.35, metallic: 1 } },
    ],
    links: [
      { id: "cm_l1", fromNode: "cm_texcoord", fromSocket: "generated", toNode: "cm_mapping", toSocket: "vector" },
      { id: "cm_l2", fromNode: "cm_mapping", fromSocket: "vector", toNode: "cm_checker", toSocket: "vector" },
      { id: "cm_l3", fromNode: "cm_checker", fromSocket: "fac", toNode: "cm_bump", toSocket: "height" },
      { id: "cm_l4", fromNode: "cm_bump", fromSocket: "normal", toNode: "cm_principled", toSocket: "normal" },
      { id: "cm_l5", fromNode: "cm_principled", fromSocket: "bsdf", toNode: "cm_out", toSocket: "surface" },
    ],
  },
};
