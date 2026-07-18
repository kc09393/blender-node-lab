import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_torn_holes",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "撕裂破洞：局部穿透效果", en: "Torn Holes: Partial Transparency" },
  description: {
    zh: "破葉子、蟲蛀的布料、生鏽穿孔的鐵皮，這些「大部分完整、局部有洞」的材質，做法都一樣：用透明 BSDF（Transparent BSDF）當作「洞」，用混合著色器（Mix Shader）把它跟原本的材質混合，再用色彩帶（Color Ramp）做出的黑白遮罩控制哪裡有洞、哪裡沒有——這篇教學專門示範 Transparent BSDF 這個之前沒用過的節點。",
    en: "Torn leaves, moth-eaten fabric, rusted-through sheet metal — these 'mostly solid, holes here and there' materials all use the same technique: Transparent BSDF as the 'hole', Mix Shader to blend it with the base material, and a Color Ramp mask to control where the holes appear. This tutorial focuses on Transparent BSDF, a node not used elsewhere in this site.",
  },
  startGraph: {
    nodes: [
      { id: "t_th2_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_th2_leaf", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.2, 0.45, 0.15, 1], roughness: 0.6 } },
    ],
    links: [{ id: "t_th2_l1", fromNode: "t_th2_leaf", fromSocket: "bsdf", toNode: "t_th2_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_th2_out", typeId: "output_material", x: 1700, y: 240, params: {} },
      { id: "te_th2_mix", typeId: "shader_mix_shader", x: 1400, y: 140, params: {} },
      { id: "te_th2_leaf", typeId: "shader_principled_bsdf", x: 1100, y: 20, params: { baseColor: [0.2, 0.45, 0.15, 1], roughness: 0.6 } },
      { id: "te_th2_transparent", typeId: "shader_transparent_bsdf", x: 1100, y: 260, params: {} },
      {
        id: "te_th2_ramp",
        typeId: "converter_color_ramp",
        x: 840,
        y: 260,
        params: {
          stops: [
            { position: 0, color: [1, 1, 1, 1] },
            { position: 0.12, color: [0, 0, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] },
          ],
        },
      },
      { id: "te_th2_voronoi", typeId: "texture_voronoi", x: 580, y: 260, params: { scale: 10, randomness: 1 } },
    ],
    links: [
      { id: "te_th2_l1", fromNode: "te_th2_mix", fromSocket: "bsdf", toNode: "te_th2_out", toSocket: "surface" },
      { id: "te_th2_l2", fromNode: "te_th2_leaf", fromSocket: "bsdf", toNode: "te_th2_mix", toSocket: "shader1" },
      { id: "te_th2_l3", fromNode: "te_th2_transparent", fromSocket: "bsdf", toNode: "te_th2_mix", toSocket: "shader2" },
      { id: "te_th2_l4", fromNode: "te_th2_ramp", fromSocket: "color", toNode: "te_th2_mix", toSocket: "fac" },
      { id: "te_th2_l5", fromNode: "te_th2_voronoi", fromSocket: "distance", toNode: "te_th2_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用沃羅諾伊的距離做破洞遮罩", en: "Step 1: Build a Hole Mask from Voronoi Distance" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture）。\n\n加入色彩帶（Color Ramp）。\n\n把沃羅諾伊的距離（Distance）輸出，接到色彩帶的係數（Fac）輸入。\n\n設定成「位置 0 是白色、位置 0.12 是黑色、位置 1 也是黑色」。因為 Distance 在細胞正中心是 0，離開中心後很快變大，這樣只有每個細胞正中心附近會是白色，其餘全黑——白色的地方之後就是「洞」。",
        en: "Add a Voronoi Texture.\n\nAdd a Color Ramp.\n\nConnect Voronoi's Distance output to the Color Ramp's Fac input.\n\nSet it up so position 0 is white, position 0.12 is black, and position 1 is also black. Since Distance is 0 at each cell center and rises quickly away from it, only a small area near each cell center stays white — those white spots become the holes.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(
          graph,
          "converter_color_ramp",
          "stops",
          (stops) => Array.isArray(stops) && stops.some((s) => s.position <= 0.2 && s.color[0] > 0.7) && stops.some((s) => s.position > 0.2 && s.color[0] < 0.3)
        ),
    },
    {
      title: { zh: "第二步：加入透明 BSDF 當作洞", en: "Step 2: Add Transparent BSDF as the Hole" },
      instruction: {
        zh: "加入透明 BSDF（Transparent BSDF）。這個節點沒有任何參數，接上去的地方會整個穿透、完全看不到表面。\n\n先不用接到任何地方，下一步才會用到。",
        en: "Add a Transparent BSDF. This node has no parameters — anywhere it's used, the surface becomes fully see-through.\n\nDon't connect it anywhere yet — the next step needs it.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_transparent_bsdf"),
    },
    {
      title: { zh: "第三步：用混合著色器把兩者接在一起", en: "Step 3: Combine Both with Mix Shader" },
      instruction: {
        zh: "加入混合著色器（Mix Shader）。\n\n把原本的葉子材質，接到第一個著色器（Shader）輸入。\n\n把透明 BSDF，接到第二個著色器輸入。\n\n把色彩帶的顏色（Color）輸出，接到混合著色器的係數（Fac）。\n\n因為色彩帶大部分是黑色（0，完全用第一個材質）、只有洞的地方是白色（1，完全用透明 BSDF），這樣就會變成「大部分正常、局部是洞」的效果。\n\n把混合著色器的輸出，接到材質輸出。",
        en: "Add a Mix Shader.\n\nConnect the original leaf material to the first Shader input.\n\nConnect Transparent BSDF to the second Shader input.\n\nConnect the Color Ramp's Color output to Mix Shader's Fac.\n\nSince the Color Ramp is mostly black (0, fully the first material) with only the holes white (1, fully Transparent BSDF), this creates a 'mostly solid, holes in a few spots' look.\n\nConnect Mix Shader's output to the material output.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_mix_shader", "fac") &&
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "混合著色器（Mix Shader）的第一個著色器輸入接葉子材質、第二個接透明 BSDF，色彩帶接到 Fac。Fac 為 0 跟為 1 時分別代表什麼？",
        en: "Mix Shader's first Shader input is the leaf material, the second is Transparent BSDF, and Color Ramp drives Fac. What do Fac = 0 and Fac = 1 each mean?",
      },
      options: [
        { zh: "Fac=0 時完全使用葉子材質（不透明），Fac=1 時完全使用透明 BSDF（變成洞）", en: "Fac=0 is fully the leaf material (opaque); Fac=1 is fully Transparent BSDF (a hole)" },
        { zh: "Fac=0 跟 Fac=1 效果完全相同，都是半透明", en: "Fac=0 and Fac=1 look identical — both are semi-transparent" },
        { zh: "Fac=0 時是洞，Fac=1 時是不透明的葉子", en: "Fac=0 is a hole; Fac=1 is the opaque leaf" },
        { zh: "Fac 只影響顏色深淺，跟透明與否無關", en: "Fac only affects color depth, unrelated to transparency" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "混合著色器的 Fac 決定「兩個著色器輸入各佔多少比例」：0＝完全用第一個輸入（Shader 1，這裡是葉子）、1＝完全用第二個輸入（Shader 2，這裡是透明 BSDF）。這篇教學把色彩帶設計成「大部分黑、只有洞口附近才白」，正是利用這個 0/1 對應，讓大部分表面維持原本材質、只有少數地方變成洞。",
        en: "Mix Shader's Fac determines the blend ratio between its two Shader inputs: 0 = fully Shader 1 (the leaf here), 1 = fully Shader 2 (Transparent BSDF here). This tutorial's Color Ramp is mostly black with white only near hole centers, using exactly this 0/1 mapping so most of the surface keeps the original material and only a few spots become holes.",
      },
    },
  ],
};
