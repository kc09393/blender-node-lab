export default {
  id: "tutorial_brick_wall",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出磚牆材質", en: "Make a Brick Wall Material" },
  description: {
    zh: "用磚塊紋理（Brick Texture）做出磚牆的顏色圖案，再用凹凸（Bump）節點讓灰泥縫看起來真的凹下去，學會怎麼把一個節點的輸出同時當顏色與凹凸兩種用途。",
    en: "Use Brick Texture for the wall's color pattern, then use Bump to make the mortar lines actually look recessed — learn how one node's output can drive both color and bump at once.",
  },
  startGraph: {
    nodes: [
      { id: "t_bw_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bw_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_bw_l1", fromNode: "t_bw_principled", fromSocket: "bsdf", toNode: "t_bw_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bw_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_bw_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_bw_bump", typeId: "vector_bump", x: 560, y: 280, params: {} },
      { id: "te_bw_brick", typeId: "texture_brick", x: 320, y: 100, params: {} },
      { id: "te_bw_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_bw_l1", fromNode: "te_bw_principled", fromSocket: "bsdf", toNode: "te_bw_out", toSocket: "surface" },
      { id: "te_bw_l2", fromNode: "te_bw_brick", fromSocket: "color", toNode: "te_bw_principled", toSocket: "baseColor" },
      { id: "te_bw_l3", fromNode: "te_bw_brick", fromSocket: "fac", toNode: "te_bw_bump", toSocket: "height" },
      { id: "te_bw_l4", fromNode: "te_bw_bump", fromSocket: "normal", toNode: "te_bw_principled", toSocket: "normal" },
      { id: "te_bw_l5", fromNode: "te_bw_texcoord", fromSocket: "generated", toNode: "te_bw_brick", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./brick_wall.steps.js").then((m) => m.default),
};
