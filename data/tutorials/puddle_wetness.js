import { hasLinkBetweenTypes, nodeHasIncomingFromType, findNodesOfType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

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
  steps: [
    {
      title: { zh: "第一步：準備乾燥跟濕潤兩種材質", en: "Step 1: Prepare a Dry Material and a Wet Material" },
      instruction: {
        zh: "現有的原理化 BSDF 就是乾燥地面：粗糙度（Roughness）0.85 左右，土黃色。\n\n再拖入一個新的原理化 BSDF 當作積水：底色（Base Color）調暗（濕潤的地面看起來比較深色）、粗糙度調到接近 0（例如 0.05），先不用接線。",
        en: "The existing Principled BSDF is the dry ground: Roughness around 0.85, earthy tan color.\n\nDrag in a new Principled BSDF for the puddle: darken its Base Color (wet ground looks darker) and drop Roughness near 0 (e.g. 0.05). Don't wire it up yet.",
      },
      check: (graph) => {
        const principled = findNodesOfType(graph, "shader_principled_bsdf");
        return principled.length >= 2 && principled.some((n) => n.params.roughness <= 0.1);
      },
    },
    {
      title: { zh: "第二步：混合著色器接好兩種材質", en: "Step 2: Wire Both Into Mix Shader" },
      instruction: {
        zh: "加入混合著色器（Mix Shader），把乾燥跟濕潤材質分別接到兩個著色器輸入，接到材質輸出（Material Output）取代原本的直接連線。",
        en: "Add a Mix Shader, connect the dry and wet Principled nodes to its two Shader inputs, then wire it to Material Output, replacing the direct connection.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf"),
    },
    {
      title: { zh: "第三步：用沃羅諾伊的平滑 F1 做出圓潤積水形狀", en: "Step 3: Shape the Puddles with Voronoi's Smooth F1" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture），特徵（Feature）切換成平滑 F1（Smooth F1）——它離細胞中心近的地方數值低、離邊界近的地方數值高，過渡平滑圓潤，很像水窪自然聚集的形狀。\n\n加入顏色漸變（Color Ramp），插值方式切換成常量（Constant），停駐點設成：位置 0 白色、位置 0.25 黑色——白色代表「積水」、黑色代表「乾燥」，用硬邊過渡，水窪邊界才會清楚而不是霧霧的。",
        en: "Add a Voronoi Texture and switch Feature to Smooth F1 — low values near cell centers, higher near boundaries, with a smooth rounded transition that resembles how puddles naturally pool.\n\nAdd a Color Ramp, switch Interpolation to Constant, and set stops: position 0 white, position 0.25 black — white means 'puddle', black means 'dry', with a hard edge so the puddle boundary reads clearly instead of hazy.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "converter_color_ramp", "interpolation", (v) => v === "constant"),
    },
    {
      title: { zh: "第四步：用遮罩驅動混合比例", en: "Step 4: Drive the Blend with the Mask" },
      instruction: {
        zh: "把顏色漸變的顏色（Color）輸出接到混合著色器的 Fac。畫面應該會出現幾塊邊界清楚的光滑積水，其餘部分維持粗糙乾燥——試著調高沃羅諾伊的縮放（Scale），積水的數量會變多、但每一灘也會跟著變小。",
        en: "Connect Color Ramp's Color output to Mix Shader's Fac. You should now see a few sharp-edged glossy puddles, with the rest staying rough and dry — try raising Voronoi's Scale to get more puddles, though each one shrinks as a result.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_mix_shader", "fac"),
    },
  ],
};
