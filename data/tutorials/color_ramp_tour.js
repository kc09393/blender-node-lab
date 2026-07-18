import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_color_ramp_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識顏色漸變：材質上色的核心工具", en: "Get to Know Color Ramp: The Core Coloring Tool" },
  description: {
    zh: "顏色漸變（Color Ramp）幾乎是所有程序化材質上色的樞紐——把 Noise、Voronoi 這類紋理輸出的 0-1 數值，轉換成你想要的任何配色。這篇帶你從最基本的黑白漸層開始，學會新增停駐點、切換色彩空間、切換插值方式，建立完整的操作直覺。",
    en: "Color Ramp is the hub for coloring almost every procedural material — it turns a 0-1 value from textures like Noise or Voronoi into any color scheme you want. This tutorial starts from a basic black-to-white gradient and builds up to adding stops, switching color spaces, and changing interpolation, giving you a full feel for the tool.",
  },
  startGraph: {
    nodes: [
      { id: "t_crt_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_crt_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_crt_l1", fromNode: "t_crt_principled", fromSocket: "bsdf", toNode: "t_crt_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_crt_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_crt_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_crt_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          colorMode: "hsv",
          interpolation: "constant",
          stops: [
            { position: 0, color: [0.6, 0.1, 0.1, 1] },
            { position: 0.5, color: [0.15, 0.5, 0.2, 1] },
            { position: 1, color: [0.1, 0.2, 0.6, 1] },
          ],
        },
      },
      { id: "te_crt_noise", typeId: "texture_noise", x: 300, y: 100, params: {} },
    ],
    links: [
      { id: "te_crt_l1", fromNode: "te_crt_principled", fromSocket: "bsdf", toNode: "te_crt_out", toSocket: "surface" },
      { id: "te_crt_l2", fromNode: "te_crt_ramp", fromSocket: "color", toNode: "te_crt_principled", toSocket: "baseColor" },
      { id: "te_crt_l3", fromNode: "te_crt_noise", fromSocket: "fac", toNode: "te_crt_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接上雜訊紋理當作輸入", en: "Step 1: Feed It a Noise Texture" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）跟顏色漸變（Color Ramp，轉換器 Converter 分類），把雜訊紋理的係數（Fac）接到顏色漸變的係數（Fac），再把顏色漸變的顏色（Color）接到原理化 BSDF 的底色（Base Color）。預設是黑到白的漸層——這就是 Color Ramp 最基本的功能：把一個數值換算成顏色。",
        en: "Add a Noise Texture and a Color Ramp (Converter category). Connect Noise's Fac to Color Ramp's Fac, then Color Ramp's Color to Principled BSDF's Base Color. The default is a black-to-white gradient — Color Ramp's most basic job: turning a value into a color.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：新增一個停駐點", en: "Step 2: Add a Stop" },
      instruction: {
        zh: "點漸層條下方的「+」新增一個停駐點，把它拖到中間位置（約 0.5），改成第三種顏色。現在漸層從兩色變成三色——停駐點（Stop）就是漸層上的「顏色關鍵格」，越多停駐點能做出越複雜的配色。",
        en: "Click the '+' below the gradient bar to add a stop, drag it to the middle (around 0.5), and change it to a third color. The gradient now goes from two colors to three — stops are the gradient's color keyframes; more stops let you build more complex color schemes.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_color_ramp", "stops", (v) => Array.isArray(v) && v.length >= 3),
    },
    {
      title: { zh: "第三步：切換色彩空間到 HSV", en: "Step 3: Switch Color Space to HSV" },
      instruction: {
        zh: "把色彩空間（Color Mode）切換成 HSV。差別在於「插值是在哪個色彩空間裡算的」：RGB 模式跨色相過渡時，中間常會不小心經過灰色/濁色；HSV 模式繞著色相環走，過渡通常更鮮豔、更符合直覺（例如紅到藍會經過紫色，而不是變灰）。",
        en: "Switch Color Mode to HSV. The difference is which color space the interpolation happens in: RGB mode can accidentally pass through gray/muddy colors across a hue transition; HSV mode travels around the hue wheel, usually giving a more vivid, intuitive transition (e.g. red to blue passes through purple instead of gray).",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_color_ramp", "colorMode", (v) => v === "hsv"),
    },
    {
      title: { zh: "第四步：切換插值方式到常量", en: "Step 4: Switch Interpolation to Constant" },
      instruction: {
        zh: "把插值方式（Interpolation）切換成常量（Constant）。前面幾種模式都是「平滑過渡」，Constant 完全不過渡——每個停駐點的顏色會硬切換到下一個停駐點，做出邊界分明的色塊，很適合卡通風格或分區上色。",
        en: "Switch Interpolation to Constant. The earlier modes all blend smoothly; Constant doesn't blend at all — each stop's color holds until it hard-cuts to the next one, giving sharp-edged color blocks. Great for toon styling or zoned coloring.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_color_ramp", "interpolation", (v) => v === "constant"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "顏色漸變的「常量 Constant」插值模式，會產生什麼效果？",
        en: "What effect does Color Ramp's 'Constant' interpolation mode produce?",
      },
      options: [
        { zh: "平滑的漸層過渡", en: "A smooth gradient transition" },
        { zh: "色塊分明，停駐點之間沒有中間過渡色", en: "Sharp flat color blocks, with no in-between transition between stops" },
        { zh: "顏色會隨機閃爍", en: "The colors flicker randomly" },
        { zh: "只能使用兩個停駐點", en: "Only two stops are allowed" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Constant 插值不做任何中間漸變，每一段直接使用該段起點的顏色，所以畫面會呈現清楚分明的色塊——很適合做卡通風格的色階分層，或需要硬邊遮罩的場合（例如邊緣磨損遮罩）。",
        en: "Constant interpolation does no in-between blending at all — each segment simply uses its starting stop's color, producing clearly separated flat color blocks. It's well suited to cel-shaded color banding or hard-edged masks (like an edge-wear mask).",
      },
    },
  ],
};
