export default {
  id: "lava",
  name: { zh: "熔岩裂紋", en: "Cracked Lava" },
  description: {
    zh: "沃羅諾伊的距離值接一條對稱的溫度色階（黑→深紅→橘→近白→橘→深紅→黑）當作裂縫遮罩，同時驅動發光強度跟位移，做出真的凹凸凸起的熔岩地形。",
    en: "Voronoi's distance feeds a symmetric temperature-gradient Color Ramp (black→deep red→orange→near-white→orange→deep red→black) used as the crack mask, driving both Emission strength and Displacement for genuinely raised, cracked lava terrain.",
  },
  graph: {
    nodes: [
      { id: "lava_out", typeId: "output_material", x: 1400, y: 260, params: {} },
      {
        id: "lava_voronoi_surf",
        typeId: "texture_voronoi",
        x: 0,
        y: 100,
        params: { scale: 6, randomness: 1 },
      },
      {
        id: "lava_ramp",
        typeId: "converter_color_ramp",
        x: 260,
        y: 100,
        params: {
          // 真正的熔岩裂縫不是一條均勻單色的線——裂縫中心最熱（近白），往外依序冷卻成
          // 黃、橘、深紅，最後才是完全冷卻的黑岩。原本只有黑→橘→黑三段，裂縫看起來
          // 像一條扁平的霓虹線而不是熔岩，這裡改成對稱的溫度漸層（黑→深紅→橘→近白→橘→深紅→黑）。
          stops: [
            { position: 0, color: [0, 0, 0, 1] },
            { position: 0.52, color: [0, 0, 0, 1] },
            { position: 0.56, color: [0.45, 0.03, 0, 1] },
            { position: 0.6, color: [1, 0.35, 0.02, 1] },
            { position: 0.635, color: [1, 0.9, 0.45, 1] },
            { position: 0.67, color: [1, 0.35, 0.02, 1] },
            { position: 0.71, color: [0.45, 0.03, 0, 1] },
            { position: 0.75, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      { id: "lava_bw", typeId: "converter_rgb_to_bw", x: 520, y: 220, params: {} },
      {
        id: "lava_rock",
        typeId: "shader_principled_bsdf",
        x: 520,
        y: 0,
        params: { baseColor: [0.04, 0.03, 0.03, 1], roughness: 0.9, metallic: 0 },
      },
      {
        id: "lava_glow",
        typeId: "shader_emission",
        x: 780,
        y: 100,
        params: { strength: 5 },
      },
      { id: "lava_mix", typeId: "shader_mix_shader", x: 1040, y: 140, params: {} },
      {
        id: "lava_voronoi_disp",
        typeId: "texture_voronoi",
        x: 0,
        y: 400,
        params: { scale: 6, randomness: 1 },
      },
      {
        id: "lava_disp",
        typeId: "vector_displacement",
        x: 260,
        y: 400,
        params: { midlevel: 0.5, scale: 0.08 },
      },
    ],
    links: [
      { id: "lava_l1", fromNode: "lava_voronoi_surf", fromSocket: "distance", toNode: "lava_ramp", toSocket: "fac" },
      { id: "lava_l2", fromNode: "lava_ramp", fromSocket: "color", toNode: "lava_bw", toSocket: "color" },
      { id: "lava_l3", fromNode: "lava_ramp", fromSocket: "color", toNode: "lava_glow", toSocket: "color" },
      { id: "lava_l4", fromNode: "lava_bw", fromSocket: "value", toNode: "lava_mix", toSocket: "fac" },
      { id: "lava_l5", fromNode: "lava_rock", fromSocket: "bsdf", toNode: "lava_mix", toSocket: "shader1" },
      { id: "lava_l6", fromNode: "lava_glow", fromSocket: "bsdf", toNode: "lava_mix", toSocket: "shader2" },
      { id: "lava_l7", fromNode: "lava_mix", fromSocket: "bsdf", toNode: "lava_out", toSocket: "surface" },
      { id: "lava_l8", fromNode: "lava_voronoi_disp", fromSocket: "distance", toNode: "lava_disp", toSocket: "height" },
      { id: "lava_l9", fromNode: "lava_disp", fromSocket: "displacement", toNode: "lava_out", toSocket: "displacement" },
    ],
  },
};
