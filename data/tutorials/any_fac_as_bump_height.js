export default {
  id: "tutorial_any_fac_as_bump_height",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "任何 0-1 輸出都能當凹凸高度：棋盤格也可以", en: "Any 0-1 Output Can Drive Bump — Even Checker" },
  description: {
    zh: "凹凸（Bump）的高度插槽（Height）常常被接上 Noise 或 Wave，但它其實只是一個普通的 0-1 數值插槽——任何節點只要輸出 0-1 的浮點數，都能直接接上去。這篇示範把棋盤格紋理（Checker Texture）平常只拿來切換顏色或驅動混合著色器的係數（Fac）輸出，改接進 Bump，方格本身就變成一格格真的有高低落差的突起，是鎖子甲金屬網（Chainmail Mesh）這個材質的核心技巧。",
    en: "Bump's Height socket is usually fed Noise or Wave, but it's really just an ordinary 0-1 float socket — any node that outputs a 0-1 float can be wired in directly. This tutorial feeds Checker Texture's Fac output — normally used only to switch colors or drive a Mix Shader — straight into Bump, turning the checker squares into a real grid of raised and recessed tiles. This is the core trick behind the Chainmail Mesh preset.",
  },
  startGraph: {
    nodes: [
      { id: "t_afab_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_afab_principled", typeId: "shader_principled_bsdf", x: 320, y: 200, params: { baseColor: [0.55, 0.56, 0.58, 1], roughness: 0.35, metallic: 1 } },
    ],
    links: [{ id: "t_afab_l1", fromNode: "t_afab_principled", fromSocket: "bsdf", toNode: "t_afab_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_afab_out", typeId: "output_material", x: 1100, y: 220 },
      { id: "te_afab_texcoord", typeId: "input_texture_coordinate", x: -80, y: 160 },
      { id: "te_afab_mapping", typeId: "vector_mapping", x: 180, y: 160, params: { scale: [18, 18, 18] } },
      { id: "te_afab_checker", typeId: "texture_checker", x: 440, y: 160, params: { scale: 1 } },
      { id: "te_afab_bump", typeId: "vector_bump", x: 700, y: 160, params: { strength: 0.6 } },
      { id: "te_afab_principled", typeId: "shader_principled_bsdf", x: 860, y: 220, params: { baseColor: [0.55, 0.56, 0.58, 1], roughness: 0.35, metallic: 1 } },
    ],
    links: [
      { id: "te_afab_l1", fromNode: "te_afab_texcoord", fromSocket: "generated", toNode: "te_afab_mapping", toSocket: "vector" },
      { id: "te_afab_l2", fromNode: "te_afab_mapping", fromSocket: "vector", toNode: "te_afab_checker", toSocket: "vector" },
      { id: "te_afab_l3", fromNode: "te_afab_checker", fromSocket: "color", toNode: "te_afab_principled", toSocket: "baseColor" },
      { id: "te_afab_l4", fromNode: "te_afab_checker", fromSocket: "fac", toNode: "te_afab_bump", toSocket: "height" },
      { id: "te_afab_l5", fromNode: "te_afab_bump", fromSocket: "normal", toNode: "te_afab_principled", toSocket: "normal" },
      { id: "te_afab_l6", fromNode: "te_afab_principled", fromSocket: "bsdf", toNode: "te_afab_out", toSocket: "surface" },
    ],
  },
  loadSteps: () => import("./any_fac_as_bump_height.steps.js").then((m) => m.default),
};
