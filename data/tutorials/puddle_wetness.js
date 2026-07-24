export default {
  id: "tutorial_puddle_wetness",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "積水地面：程序化的濕潤斑塊", en: "Puddle Ground: Procedural Wet Patches" },
  description: {
    zh: "淋濕的地面會在低窪處積出一灘灘光滑的水漬，其餘地方仍然是乾燥粗糙的。這篇用沃羅諾伊紋理（Voronoi Texture）的平滑 F1（Smooth F1）特徵天生的圓潤斑塊形狀，接一個硬邊的顏色漸變（Color Ramp，常量 Constant）做出積水遮罩，驅動混合著色器（Mix Shader）在「乾燥粗糙」跟「濕潤光滑」兩種材質間切換——這次遮罩是由紋理（而非視角）決定，跟邊緣磨損那篇正好互補。",
    en: "Wet ground pools into smooth patches in low spots while staying dry and rough elsewhere. This tutorial uses Voronoi Texture's Smooth F1 feature — whose blob-like shape is a natural fit — piped through a hard-edged Color Ramp (Constant) to build a puddle mask, driving a Mix Shader between 'dry and rough' and 'wet and glossy'. This time the mask comes from a texture, not the viewing angle — a nice complement to the edge-wear tutorial.",
  },
  startGraph: {
    nodes: [
      { id: "t_pw_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "t_pw_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.35, 0.28, 0.22, 1], roughness: 0.85 },
      },
    ],
    links: [{ id: "t_pw_l1", fromNode: "t_pw_principled", fromSocket: "bsdf", toNode: "t_pw_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_pw_out", typeId: "output_material", x: 1400, y: 260, params: {} },
      { id: "te_pw_mix", typeId: "shader_mix_shader", x: 1140, y: 200, params: {} },
      {
        id: "te_pw_dry",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 60,
        params: { baseColor: [0.35, 0.28, 0.22, 1], roughness: 0.85 },
      },
      {
        id: "te_pw_wet",
        typeId: "shader_principled_bsdf",
        x: 860,
        y: 320,
        params: { baseColor: [0.12, 0.1, 0.09, 1], roughness: 0.05 },
      },
      {
        id: "te_pw_ramp",
        typeId: "converter_color_ramp",
        x: 580,
        y: 460,
        params: { interpolation: "constant", stops: [{ position: 0, color: [1, 1, 1, 1] }, { position: 0.25, color: [0, 0, 0, 1] }] },
      },
      { id: "te_pw_voronoi", typeId: "texture_voronoi", x: 320, y: 460, params: { scale: 4, feature: "smooth_f1" } },
    ],
    links: [
      { id: "te_pw_l1", fromNode: "te_pw_mix", fromSocket: "bsdf", toNode: "te_pw_out", toSocket: "surface" },
      { id: "te_pw_l2", fromNode: "te_pw_dry", fromSocket: "bsdf", toNode: "te_pw_mix", toSocket: "shader1" },
      { id: "te_pw_l3", fromNode: "te_pw_wet", fromSocket: "bsdf", toNode: "te_pw_mix", toSocket: "shader2" },
      { id: "te_pw_l4", fromNode: "te_pw_ramp", fromSocket: "color", toNode: "te_pw_mix", toSocket: "fac" },
      { id: "te_pw_l5", fromNode: "te_pw_voronoi", fromSocket: "distance", toNode: "te_pw_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./puddle_wetness.steps.js").then((m) => m.default),
};
