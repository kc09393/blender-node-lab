export default {
  id: "tutorial_mix_color_blend_modes_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識混合顏色：正片疊底、濾色、疊加怎麼選", en: "Get to Know Mix Color: Multiply, Screen, Overlay" },
  description: {
    zh: "混合顏色（Mix Color）的混合模式（Blend Mode）下拉選單有 18 種，光看名字很難決定要選哪個。這篇用固定的兩個顏色，切換 3 種最常用的模式——正片疊底（Multiply，讓畫面變暗）、濾色（Screen，讓畫面變亮，效果跟「去掉黑色」很像）、疊加（Overlay，同時兼顧兩種效果），讓你直接看到差異、知道什麼情境該選哪個。",
    en: "Mix Color's Blend Mode dropdown has 18 options — hard to know which to pick from names alone. This tutorial uses two fixed colors and switches through 3 of the most-used modes: Multiply (darkens), Screen (brightens — similar to 'removing black'), and Overlay (does a bit of both), so you can see the difference directly and know which to reach for.",
  },
  startGraph: {
    nodes: [
      { id: "t_mcb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mcb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mcb_l1", fromNode: "t_mcb_principled", fromSocket: "bsdf", toNode: "t_mcb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mcb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mcb_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_mcb_mix",
        typeId: "color_mix",
        x: 560,
        y: 100,
        params: { mode: "overlay", fac: 1 },
      },
      { id: "te_mcb_rgb_a", typeId: "input_rgb", x: 300, y: 40, params: { color: [0.85, 0.2, 0.15, 1] } },
      { id: "te_mcb_rgb_b", typeId: "input_rgb", x: 300, y: 220, params: { color: [0.2, 0.5, 0.85, 1] } },
    ],
    links: [
      { id: "te_mcb_l1", fromNode: "te_mcb_principled", fromSocket: "bsdf", toNode: "te_mcb_out", toSocket: "surface" },
      { id: "te_mcb_l2", fromNode: "te_mcb_mix", fromSocket: "color", toNode: "te_mcb_principled", toSocket: "baseColor" },
      { id: "te_mcb_l3", fromNode: "te_mcb_rgb_a", fromSocket: "color", toNode: "te_mcb_mix", toSocket: "a" },
      { id: "te_mcb_l4", fromNode: "te_mcb_rgb_b", fromSocket: "color", toNode: "te_mcb_mix", toSocket: "b" },
    ],
  },
  loadSteps: () => import("./mix_color_blend_modes_tour.steps.js").then((m) => m.default),
};
