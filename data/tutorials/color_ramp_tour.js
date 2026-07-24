export default {
  id: "tutorial_color_ramp_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識顏色漸變：材質上色的核心工具", en: "Get to Know Color Ramp: The Core Coloring Tool" },
  description: {
    zh: "顏色漸變（Color Ramp）幾乎是所有程序化材質上色的樞紐——把 Noise、Voronoi 這類紋理輸出的 0-1 數值，轉換成你想要的任何配色。這篇帶你從最基本的黑白漸層開始，學會新增停駐點、切換色彩空間、切換插值方式，建立完整的操作直覺。",
    en: "Color Ramp is the hub for coloring almost every procedural material — it turns a 0-1 value from textures like Noise or Voronoi into any color scheme you want. This tutorial starts from a basic black-to-white gradient and builds up to adding stops, switching color spaces, and changing interpolation, giving you a full feel for the tool.",
  },
  startGraph: {
    nodes: [
      { id: "t_crt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_crt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_crt_l1", fromNode: "t_crt_principled", fromSocket: "bsdf", toNode: "t_crt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_crt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_crt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_crt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          colorMode: "hsv",
          interpolation: "constant",
          stops: [
            { position: 0, color: [0.6, 0.1, 0.1, 1] },
            { position: 0.5, color: [0.15, 0.5, 0.2, 1] },
            { position: 1, color: [0.1, 0.2, 0.6, 1] },
          ],
        },
      },
      { id: "te_crt_noise", typeId: "texture_noise", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_crt_l1", fromNode: "te_crt_principled", fromSocket: "bsdf", toNode: "te_crt_out", toSocket: "surface" },
      { id: "te_crt_l2", fromNode: "te_crt_ramp", fromSocket: "color", toNode: "te_crt_principled", toSocket: "baseColor" },
      { id: "te_crt_l3", fromNode: "te_crt_noise", fromSocket: "fac", toNode: "te_crt_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./color_ramp_tour.steps.js").then((m) => m.default),
};
