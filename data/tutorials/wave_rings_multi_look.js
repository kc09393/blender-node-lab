export default {
  id: "tutorial_wave_rings_multi_look",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "同一張圖，三種長相：波浪環狀模式的百變用途", en: "One Graph, Three Looks: Wave Rings' Many Disguises" },
  description: {
    zh: "波浪紋理的環狀模式（Rings）長得都一樣（同心圓），但只要換顏色漸變的配色跟扭曲程度，就能從「木頭年輪」變成「水波漣漪」再變成「陶土拉坯痕」——這篇不換任何節點結構，只調參數，讓你體會到「很多材質的差異其實只在數值，不在接線方式」。",
    en: "Wave Texture's Rings mode always looks the same structurally (concentric circles), but just changing the Color Ramp's palette and the distortion amount takes it from 'wood end-grain' to 'water ripples' to 'hand-thrown pottery grooves' — this tutorial never changes the node structure, only the numbers, so you feel firsthand that many materials differ only in values, not in wiring.",
  },
  startGraph: {
    nodes: [
      { id: "t_wrml_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_wrml_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_wrml_l1", fromNode: "t_wrml_principled", fromSocket: "bsdf", toNode: "t_wrml_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_wrml_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_wrml_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { roughness: 0.35 } },
      {
        id: "te_wrml_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.55, 0.35, 0.1, 1] },
            { position: 1, color: [0.35, 0.55, 0.75, 1] },
          ],
        },
      },
      { id: "te_wrml_wave", typeId: "texture_wave", x: 300, y: 100, params: { waveType: "rings", scale: 4, distortion: 8, profile: "sine" } },
    ],
    links: [
      { id: "te_wrml_l1", fromNode: "te_wrml_principled", fromSocket: "bsdf", toNode: "te_wrml_out", toSocket: "surface" },
      { id: "te_wrml_l2", fromNode: "te_wrml_ramp", fromSocket: "color", toNode: "te_wrml_principled", toSocket: "baseColor" },
      { id: "te_wrml_l3", fromNode: "te_wrml_wave", fromSocket: "fac", toNode: "te_wrml_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./wave_rings_multi_look.steps.js").then((m) => m.default),
};
