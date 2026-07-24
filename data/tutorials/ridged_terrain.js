export default {
  id: "tutorial_ridged_terrain",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "山脊多重分形：裂紋岩石質感", en: "Ridged Multifractal: Cracked Rock Look" },
  description: {
    zh: "雜訊紋理（Noise Texture）除了預設的 fBM（柔和雲霧感）之外，還有 Ridged Multifractal 這種會刻出銳利山脊狀裂紋的類型，很適合做岩石、峽谷、乾裂地面的質感。",
    en: "Beyond the default fBM (soft, cloud-like noise), Noise Texture also has Ridged Multifractal — a type that carves sharp, ridge-like creases. Great for rock, canyons, and cracked ground.",
  },
  startGraph: {
    nodes: [
      { id: "t_rt_out", typeId: "output_material", x: 900, y: 160, params: {} },
      { id: "t_rt_principled", typeId: "shader_principled_bsdf", x: 620, y: 100, params: {} },
    ],
    links: [{ id: "t_rt_l1", fromNode: "t_rt_principled", fromSocket: "bsdf", toNode: "t_rt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_rt_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_rt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.7 } },
      {
        id: "te_rt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0.1, color: [0.04, 0.04, 0.05, 1] },
            { position: 0.6, color: [0.35, 0.28, 0.22, 1] },
            { position: 1.3, color: [0.9, 0.85, 0.75, 1] },
          ],
        },
      },
      {
        id: "te_rt_noise",
        typeId: "texture_noise",
        x: 300,
        y: 100,
        params: { noiseType: "ridged_multifractal", scale: 3, detail: 6, roughness: 0.55, lacunarity: 2.0, offset: 1.0, gain: 2.0 },
      },
    ],
    links: [
      { id: "te_rt_l1", fromNode: "te_rt_principled", fromSocket: "bsdf", toNode: "te_rt_out", toSocket: "surface" },
      { id: "te_rt_l2", fromNode: "te_rt_ramp", fromSocket: "color", toNode: "te_rt_principled", toSocket: "baseColor" },
      { id: "te_rt_l3", fromNode: "te_rt_noise", fromSocket: "fac", toNode: "te_rt_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./ridged_terrain.steps.js").then((m) => m.default),
};
