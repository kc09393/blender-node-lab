export default {
  id: "tutorial_torn_holes",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "撕裂破洞：局部穿透效果", en: "Torn Holes: Partial Transparency" },
  description: {
    zh: "破葉子、蟲蛀的布料、生鏽穿孔的鐵皮，這些「大部分完整、局部有洞」的材質，做法都一樣：用透明 BSDF（Transparent BSDF）當作「洞」，用混合著色器（Mix Shader）把它跟原本的材質混合，再用色彩帶（Color Ramp）做出的黑白遮罩控制哪裡有洞、哪裡沒有——這篇教學專門示範 Transparent BSDF 這個之前沒用過的節點。",
    en: "Torn leaves, moth-eaten fabric, rusted-through sheet metal — these 'mostly solid, holes here and there' materials all use the same technique: Transparent BSDF as the 'hole', Mix Shader to blend it with the base material, and a Color Ramp mask to control where the holes appear. This tutorial focuses on Transparent BSDF, a node not used elsewhere in this site.",
  },
  startGraph: {
    nodes: [
      { id: "t_th2_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_th2_leaf", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.2, 0.45, 0.15, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_th2_l1", fromNode: "t_th2_leaf", fromSocket: "bsdf", toNode: "t_th2_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_th2_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_th2_mix", typeId: "shader_mix_shader", x: 1400, y: 140, params: {} },
      { id: "te_th2_leaf", typeId: "shader_principled_bsdf", x: 1100, y: 20, params: { baseColor: [0.2, 0.45, 0.15, 1], roughness: 0.6 } },
      { id: "te_th2_transparent", typeId: "shader_transparent_bsdf", x: 1100, y: 260, params: {} },
      {
        id: "te_th2_ramp",
        typeId: "converter_color_ramp",
        x: 840,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.12, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      { id: "te_th2_voronoi", typeId: "texture_voronoi", x: 580, y: 260, params: { scale: 10, randomness: 1 } },
    ],
    links: [
      { id: "te_th2_l1", fromNode: "te_th2_mix", fromSocket: "bsdf", toNode: "te_th2_out", toSocket: "surface" },
      { id: "te_th2_l2", fromNode: "te_th2_leaf", fromSocket: "bsdf", toNode: "te_th2_mix", toSocket: "shader1" },
      { id: "te_th2_l3", fromNode: "te_th2_transparent", fromSocket: "bsdf", toNode: "te_th2_mix", toSocket: "shader2" },
      { id: "te_th2_l4", fromNode: "te_th2_ramp", fromSocket: "color", toNode: "te_th2_mix", toSocket: "fac" },
      { id: "te_th2_l5", fromNode: "te_th2_voronoi", fromSocket: "distance", toNode: "te_th2_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./torn_holes.steps.js").then((m) => m.default),
};
