export default {
  id: "tutorial_layer_stack_blend",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "疊圖技巧：多層混合模式堆疊", en: "Layer Stacking: Chaining Multiple Blend Modes" },
  description: {
    zh: "真實的材質貼圖很少只疊一層——通常是「底色 → 正片疊底疊污漬 → 濾色疊磨損高光」這樣一層一層疊上去，跟 Photoshop 的圖層堆疊完全同一個概念。這篇教學串接兩個混合顏色（Mix Color）節點，各自用不同的混合模式，做出「又髒又有磨損高光」的複雜表面。",
    en: "Real-world material textures are rarely a single layer — usually it's 'base color → Multiply in grime → Screen in worn highlights', stacked one after another, exactly like layers in Photoshop. This tutorial chains two Mix Color nodes with different blend modes to create a surface that's both dirty and has worn highlights.",
  },
  startGraph: {
    nodes: [
      { id: "t_ls_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "t_ls_principled", typeId: "shader_principled_bsdf", x: 1100, y: 100, params: { baseColor: [0.55, 0.45, 0.35, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_ls_l0", fromNode: "t_ls_principled", fromSocket: "bsdf", toNode: "t_ls_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ls_out", typeId: "output_material", x: 1700, y: 260, params: {} },
      { id: "te_ls_principled", typeId: "shader_principled_bsdf", x: 1400, y: 100, params: { roughness: 0.6 } },
      { id: "te_ls_mix2", typeId: "color_mix", x: 1140, y: 100, params: { mode: "screen", fac: 0.35 } },
      { id: "te_ls_noise_hi", typeId: "texture_noise", x: 900, y: 260, params: { scale: 12, detail: 3 } },
      { id: "te_ls_mix1", typeId: "color_mix", x: 880, y: 60, params: { mode: "multiply", fac: 0.5, a: [0.55, 0.45, 0.35, 1] } },
      { id: "te_ls_voronoi_dirt", typeId: "texture_voronoi", x: 620, y: 60, params: { scale: 5 } },
      { id: "te_ls_texcoord", typeId: "input_texture_coordinate", x: 380, y: 60, params: {} },
    ],
    links: [
      { id: "te_ls_l1", fromNode: "te_ls_principled", fromSocket: "bsdf", toNode: "te_ls_out", toSocket: "surface" },
      { id: "te_ls_l2", fromNode: "te_ls_mix2", fromSocket: "color", toNode: "te_ls_principled", toSocket: "baseColor" },
      { id: "te_ls_l3", fromNode: "te_ls_mix1", fromSocket: "color", toNode: "te_ls_mix2", toSocket: "a" },
      { id: "te_ls_l4", fromNode: "te_ls_noise_hi", fromSocket: "color", toNode: "te_ls_mix2", toSocket: "b" },
      { id: "te_ls_l5", fromNode: "te_ls_voronoi_dirt", fromSocket: "color", toNode: "te_ls_mix1", toSocket: "b" },
      { id: "te_ls_l6", fromNode: "te_ls_texcoord", fromSocket: "generated", toNode: "te_ls_voronoi_dirt", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./layer_stack_blend.steps.js").then((m) => m.default),
};
