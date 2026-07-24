export default {
  id: "tutorial_terrain_height_map",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "地形上色：多停駐點顏色漸變＋細節疊圖", en: "Terrain Coloring: A Multi-Stop Ramp Plus Detail Overlay" },
  description: {
    zh: "遊戲美術很常用一條「高度→顏色」的顏色漸變幫地形自動上色：低處是水、中間是草地、高處是雪。這篇教學用雜訊紋理（Noise Texture）模擬高度，接上一條 6 個停駐點的顏色漸變做出水／沙／草／岩／雪的分層配色，再疊一層濾色模式的細節紋理增加表面變化，示範「大範圍色彩分區」跟「小範圍表面細節」怎麼同時存在。",
    en: "Game art often auto-colors terrain with a single 'height → color' ramp: low = water, mid = grass, high = snow. This tutorial uses a Noise Texture to stand in for height, feeds it through a 6-stop Color Ramp for a water/sand/grass/rock/snow palette, then screens in a detail texture on top — showing how large-scale color zoning and small-scale surface detail can coexist.",
  },
  startGraph: {
    nodes: [
      { id: "t_th_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_th_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.85 } },
    ],
    links: [{ id: "t_th_l1", fromNode: "t_th_principled", fromSocket: "bsdf", toNode: "t_th_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_th_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_th_principled", typeId: "shader_principled_bsdf", x: 1400, y: 100, params: { roughness: 0.85 } },
      { id: "te_th_mix", typeId: "color_mix", x: 1140, y: 100, params: { mode: "screen", fac: 0.25 } },
      { id: "te_th_detail", typeId: "texture_noise", x: 900, y: 260, params: { scale: 18, detail: 4 } },
      {
        id: "te_th_ramp",
        typeId: "converter_color_ramp",
        x: 900,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.15, 0.45, 1] },
            { position: 0.32, color: [0.1, 0.35, 0.65, 1] },
            { position: 0.38, color: [0.85, 0.75, 0.5, 1] },
            { position: 0.5, color: [0.25, 0.5, 0.15, 1] },
            { position: 0.75, color: [0.4, 0.35, 0.32, 1] },
            { position: 0.92, color: [0.95, 0.95, 0.97, 1] },
          ],
        },
      },
      { id: "te_th_height", typeId: "texture_noise", x: 620, y: 60, params: { scale: 2.5, detail: 3 } },
    ],
    links: [
      { id: "te_th_l1", fromNode: "te_th_principled", fromSocket: "bsdf", toNode: "te_th_out", toSocket: "surface" },
      { id: "te_th_l2", fromNode: "te_th_mix", fromSocket: "color", toNode: "te_th_principled", toSocket: "baseColor" },
      { id: "te_th_l3", fromNode: "te_th_ramp", fromSocket: "color", toNode: "te_th_mix", toSocket: "a" },
      { id: "te_th_l4", fromNode: "te_th_detail", fromSocket: "color", toNode: "te_th_mix", toSocket: "b" },
      { id: "te_th_l5", fromNode: "te_th_height", fromSocket: "fac", toNode: "te_th_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./terrain_height_map.steps.js").then((m) => m.default),
};
