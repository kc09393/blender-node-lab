export default {
  id: "tutorial_car_paint_flakes",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "金屬車漆：疊上細小亮片", en: "Metallic Car Paint: Adding Tiny Flakes" },
  description: {
    zh: "真正的金屬烤漆不是均勻的一片顏色——漆裡混了無數微小的金屬亮片，只有極少數角度/位置會反出銳利的小亮點。這篇教學用沃羅諾伊紋理（Voronoi Texture）的距離（Distance）輸出配上顏色漸變（Color Ramp）做出「大部分是黑、只有細胞中心是白」的稀疏亮點遮罩，再用加法著色器（Add Shader）把亮點當發光疊在原本的車漆底色上——這是兩個獨立材質相加、而不是取代彼此的疊圖概念。",
    en: "Real metallic car paint isn't a flat color — it's full of microscopic metal flakes, and only a few spots catch a sharp bright glint. This tutorial uses Voronoi Texture's Distance output with a Color Ramp to build a sparse 'mostly black, bright only at cell centers' mask, then uses an Add Shader to layer that as glow on top of the base paint color — two independent materials summed together, not replacing one another.",
  },
  startGraph: {
    nodes: [
      { id: "t_cp_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cp_base", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.02, 0.05, 1], metallic: 0.85, roughness: 0.3 } },
    ],
    links: [{ id: "t_cp_l1", fromNode: "t_cp_base", fromSocket: "bsdf", toNode: "t_cp_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cp_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_cp_add", typeId: "shader_add_shader", x: 1400, y: 140, params: {} },
      { id: "te_cp_base", typeId: "shader_principled_bsdf", x: 1100, y: 60, params: { baseColor: [0.5, 0.02, 0.05, 1], metallic: 0.85, roughness: 0.3 } },
      { id: "te_cp_flake", typeId: "shader_principled_bsdf", x: 1100, y: 260, params: { baseColor: [0, 0, 0, 1], metallic: 1, roughness: 0.05, emissionStrength: 6 } },
      {
        id: "te_cp_ramp",
        typeId: "converter_color_ramp",
        x: 820,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.05, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      { id: "te_cp_voronoi", typeId: "texture_voronoi", x: 560, y: 260, params: { scale: 30, randomness: 1 } },
    ],
    links: [
      { id: "te_cp_l1", fromNode: "te_cp_add", fromSocket: "bsdf", toNode: "te_cp_out", toSocket: "surface" },
      { id: "te_cp_l2", fromNode: "te_cp_base", fromSocket: "bsdf", toNode: "te_cp_add", toSocket: "shader1" },
      { id: "te_cp_l3", fromNode: "te_cp_flake", fromSocket: "bsdf", toNode: "te_cp_add", toSocket: "shader2" },
      { id: "te_cp_l4", fromNode: "te_cp_ramp", fromSocket: "color", toNode: "te_cp_flake", toSocket: "emissionColor" },
      { id: "te_cp_l5", fromNode: "te_cp_voronoi", fromSocket: "distance", toNode: "te_cp_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./car_paint_flakes.steps.js").then((m) => m.default),
};
