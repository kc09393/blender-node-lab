export default {
  id: "tutorial_stained_glass",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "彩色玻璃窗：用顏色漸變做調色盤化", en: "Stained Glass: Using a Color Ramp to Posterize a Palette" },
  description: {
    zh: "沃羅諾伊紋理的顏色（Color）輸出，每個細胞都是一個完全隨機的顏色——顏色太雜、不像真正的彩色玻璃窗（通常只用幾種固定色調）。這篇教學示範顏色漸變（Color Ramp）的另一種用法：不是拿來做平滑漸層，而是設很多組「位置很接近、顏色卻不一樣」的停駐點，把連續的隨機值強制«量化»成少數幾種固定色調——這叫做調色盤化（Posterize），是很多风格化渲染的核心技巧。再疊一層黑色縫隙線，做出完整的彩色玻璃窗效果。",
    en: "Voronoi Texture's Color output gives every cell a fully random color — too chaotic to look like a real stained-glass window (which typically uses just a handful of fixed hues). This tutorial shows a different use of Color Ramp: instead of a smooth gradient, you set many stop-pairs positioned very close together with different colors, forcing a continuous random value to snap into a small, fixed palette — a technique called posterizing, central to a lot of stylized rendering. Then a layer of black grout lines completes the stained-glass look.",
  },
  startGraph: {
    nodes: [
      { id: "t_sg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_sg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.2 } },
    ],
    links: [{ id: "t_sg_l1", fromNode: "t_sg_principled", fromSocket: "bsdf", toNode: "t_sg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_sg_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_sg_principled", typeId: "shader_principled_bsdf", x: 1400, y: 100, params: { roughness: 0.2, emissionStrength: 0.4 } },
      { id: "te_sg_mix", typeId: "color_mix", x: 1140, y: 100, params: { mode: "multiply", fac: 1 } },
      {
        id: "te_sg_grout_ramp",
        typeId: "converter_color_ramp",
        x: 880,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.62, color: [1, 1, 1, 1] },
            { position: 0.68, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      {
        id: "te_sg_palette_ramp",
        typeId: "converter_color_ramp",
        x: 880,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.7, 0.08, 0.1, 1] },
            { position: 0.24, color: [0.7, 0.08, 0.1, 1] },
            { position: 0.26, color: [0.08, 0.25, 0.65, 1] },
            { position: 0.49, color: [0.08, 0.25, 0.65, 1] },
            { position: 0.51, color: [0.1, 0.5, 0.2, 1] },
            { position: 0.74, color: [0.1, 0.5, 0.2, 1] },
            { position: 0.76, color: [0.85, 0.65, 0.1, 1] },
            { position: 1, color: [0.85, 0.65, 0.1, 1] },
          ],
        },
      },
      { id: "te_sg_bw", typeId: "converter_rgb_to_bw", x: 620, y: 60, params: {} },
      { id: "te_sg_voronoi", typeId: "texture_voronoi", x: 380, y: 140, params: { scale: 6, randomness: 1 } },
    ],
    links: [
      { id: "te_sg_l1", fromNode: "te_sg_principled", fromSocket: "bsdf", toNode: "te_sg_out", toSocket: "surface" },
      { id: "te_sg_l2", fromNode: "te_sg_mix", fromSocket: "color", toNode: "te_sg_principled", toSocket: "baseColor" },
      { id: "te_sg_l3", fromNode: "te_sg_palette_ramp", fromSocket: "color", toNode: "te_sg_mix", toSocket: "a" },
      { id: "te_sg_l4", fromNode: "te_sg_grout_ramp", fromSocket: "color", toNode: "te_sg_mix", toSocket: "b" },
      { id: "te_sg_l5", fromNode: "te_sg_bw", fromSocket: "value", toNode: "te_sg_palette_ramp", toSocket: "fac" },
      { id: "te_sg_l6", fromNode: "te_sg_voronoi", fromSocket: "color", toNode: "te_sg_bw", toSocket: "color" },
      { id: "te_sg_l7", fromNode: "te_sg_voronoi", fromSocket: "distance", toNode: "te_sg_grout_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./stained_glass.steps.js").then((m) => m.default),
};
