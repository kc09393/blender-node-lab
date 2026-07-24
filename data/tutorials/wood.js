export default {
  id: "tutorial_wood",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "做出程序化木紋", en: "Make Procedural Wood Grain" },
  description: {
    zh: "串接波浪紋理（Wave Texture）、顏色漸變（Color Ramp）跟原理化 BSDF（Principled BSDF），完全不用貼圖就做出木紋材質。",
    en: "Chain Wave Texture, Color Ramp, and Principled BSDF together to create wood grain without any image textures.",
  },
  startGraph: {
    nodes: [
      { id: "t_wood_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_wood_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_wood_l1", fromNode: "t_wood_principled", fromSocket: "bsdf", toNode: "t_wood_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wood_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_wood_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_wood_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.25, 0.13, 0.05, 1] }, { position: 1, color: [0.55, 0.35, 0.18, 1] }] },
      },
      { id: "te_wood_wave", typeId: "texture_wave", x: 320, y: 100, params: {} },
      { id: "te_wood_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_wood_l1", fromNode: "te_wood_principled", fromSocket: "bsdf", toNode: "te_wood_out", toSocket: "surface" },
      { id: "te_wood_l2", fromNode: "te_wood_ramp", fromSocket: "color", toNode: "te_wood_principled", toSocket: "baseColor" },
      { id: "te_wood_l3", fromNode: "te_wood_wave", fromSocket: "fac", toNode: "te_wood_ramp", toSocket: "fac" },
      { id: "te_wood_l4", fromNode: "te_wood_texcoord", fromSocket: "generated", toNode: "te_wood_wave", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./wood.steps.js").then((m) => m.default),
};
