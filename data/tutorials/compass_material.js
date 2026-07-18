import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_compass_material",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "羅盤材質：用向量數學指向固定方向", en: "Compass Material: Pointing a Fixed Direction with Vector Math" },
  description: {
    zh: "菲涅爾（Fresnel）驅動的效果永遠只跟「攝影機角度」有關，轉動攝影機時亮邊會一直跟著跑。但如果你想要一個「不管怎麼轉動攝影機，永遠固定指向某個方向」的效果（例如物體上一個固定的發光標記），就要換一種做法：用向量數學（Vector Math）的內積（Dot Product）算出「表面法線」跟「你指定的固定方向」有多接近，越接近就越亮。這篇教學示範這個技巧，順便介紹怎麼用數值（Value）節點把一個常用參數抽出來獨立調整。",
    en: "Fresnel-driven effects only ever depend on camera angle — the bright edge always follows the camera as you orbit. But if you want an effect that stays fixed to a chosen direction in object space (like a fixed glowing marker on an object) regardless of camera movement, you need a different technique: Vector Math's Dot Product measures how closely the surface normal aligns with a direction you pick — the closer, the brighter. This tutorial builds that effect, and shows how to extract a frequently-tuned parameter into its own Value node.",
  },
  startGraph: {
    nodes: [
      { id: "t_cm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_cm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.5 } },
    ],
    links: [{ id: "t_cm_l1", fromNode: "t_cm_principled", fromSocket: "bsdf", toNode: "t_cm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_cm_out", typeId: "output_material", x: 1900, y: 260, params: {} },
      { id: "te_cm_add", typeId: "shader_add_shader", x: 1620, y: 160, params: {} },
      { id: "te_cm_principled", typeId: "shader_principled_bsdf", x: 1340, y: 20, params: { baseColor: [0.15, 0.15, 0.18, 1], roughness: 0.5 } },
      { id: "te_cm_emission", typeId: "shader_emission", x: 1340, y: 280, params: { strength: 4 } },
      {
        id: "te_cm_ramp",
        typeId: "converter_color_ramp",
        x: 1080,
        y: 280,
        params: { stops: [{ position: 0, color: [0, 0, 0, 1] }, { position: 0.6, color: [0, 0, 0, 1] }, { position: 0.85, color: [0.3, 0.8, 1, 1] }, { position: 1, color: [1, 1, 1, 1] }] },
      },
      { id: "te_cm_power", typeId: "converter_math", x: 820, y: 280, params: { operation: "power" } },
      { id: "te_cm_sharpness", typeId: "input_value", x: 560, y: 380, params: { value: 6 } },
      { id: "te_cm_maprange", typeId: "converter_map_range", x: 560, y: 220, params: { fromMin: -1, fromMax: 1, toMin: 0, toMax: 1 } },
      { id: "te_cm_dot", typeId: "vector_math", x: 300, y: 220, params: { operation: "dot", vector2: [0.4, 0.7, 0.5] } },
      { id: "te_cm_texcoord", typeId: "input_texture_coordinate", x: 40, y: 220, params: {} },
    ],
    links: [
      { id: "te_cm_l1", fromNode: "te_cm_add", fromSocket: "bsdf", toNode: "te_cm_out", toSocket: "surface" },
      { id: "te_cm_l2", fromNode: "te_cm_principled", fromSocket: "bsdf", toNode: "te_cm_add", toSocket: "shader1" },
      { id: "te_cm_l3", fromNode: "te_cm_emission", fromSocket: "bsdf", toNode: "te_cm_add", toSocket: "shader2" },
      { id: "te_cm_l4", fromNode: "te_cm_ramp", fromSocket: "color", toNode: "te_cm_emission", toSocket: "color" },
      { id: "te_cm_l5", fromNode: "te_cm_power", fromSocket: "value", toNode: "te_cm_ramp", toSocket: "fac" },
      { id: "te_cm_l6", fromNode: "te_cm_maprange", fromSocket: "value", toNode: "te_cm_power", toSocket: "value1" },
      { id: "te_cm_l7", fromNode: "te_cm_sharpness", fromSocket: "value", toNode: "te_cm_power", toSocket: "value2" },
      { id: "te_cm_l8", fromNode: "te_cm_dot", fromSocket: "value", toNode: "te_cm_maprange", toSocket: "value" },
      { id: "te_cm_l9", fromNode: "te_cm_texcoord", fromSocket: "normal", toNode: "te_cm_dot", toSocket: "vector1" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用向量數學算出法線跟固定方向的接近程度", en: "Step 1: Measure Normal-vs-Fixed-Direction Alignment with Vector Math" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate），把它的 Normal 輸出接到向量數學（Vector Math）的第一個向量輸入。\n\n運算選內積（Dot Product）。\n\n第二個向量輸入手動填一個方向，例如 (0.4, 0.7, 0.5)——這代表你想要效果固定指向的方向，不管攝影機怎麼轉都不會變。\n\n內積的結果：表面法線跟這個方向越接近（同方向），數值越接近 1；越垂直，數值越接近 0；完全相反方向，數值接近 -1。",
        en: "Add a Texture Coordinate and connect its Normal output to Vector Math's first vector input.\n\nSet the operation to Dot Product.\n\nManually fill the second vector input with a direction, e.g. (0.4, 0.7, 0.5) — this is the fixed direction you want the effect to point at, unaffected by camera movement.\n\nThe dot product result: closer to 1 when the surface normal aligns with this direction, closer to 0 when perpendicular, and closer to -1 when opposite.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "normal", "vector_math", "vector1") &&
        anyNodeParamMatches(graph, "vector_math", "operation", (v) => v === "dot"),
    },
    {
      title: { zh: "第二步：用映射範圍把內積結果換算成 0-1", en: "Step 2: Rescale the Dot Product to 0-1 with Map Range" },
      instruction: {
        zh: "加入映射範圍（Map Range），把向量數學的數值（Value）輸出接到它的數值輸入。\n\n來源最小（From Min）設成 -1，來源最大（From Max）設成 1，目標維持 0 到 1。\n\n因為內積的原始範圍是 -1 到 1，不轉換的話後面接色彩帶會很奇怪（負值會被當成 0 處理，浪費掉一半的漸層）。",
        en: "Add a Map Range node and connect Vector Math's Value output to its value input.\n\nSet From Min to -1 and From Max to 1, keeping the target at 0 to 1.\n\nSince the dot product's raw range is -1 to 1, skipping this rescale would waste half the downstream Color Ramp's range on negative values (which just get clamped to 0).",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "vector_math", "value", "converter_map_range", "value") &&
        anyNodeParamMatches(graph, "converter_map_range", "fromMin", (v) => v < 0),
    },
    {
      title: { zh: "第三步：用數值節點抽出「銳利度」參數", en: "Step 3: Extract a 'Sharpness' Parameter with a Value Node" },
      instruction: {
        zh: "加入數值（Value）節點，設成 6——這個數字之後會控制發光斑點有多集中、多銳利。\n\n加入數學（Math）節點，運算選次方（Power）。\n\n把映射範圍的結果接到數學節點的第一個數值，剛剛的數值節點接到第二個數值（次方的指數）。\n\n次方運算會讓「已經很接近 1」的數值保持接近 1、其餘的數值被壓得更低——指數（剛剛的數值節點）越大，發光斑點就越集中越小。獨立抽成一個數值節點的好處：之後想調整銳利度，不用去改數學節點本身，只要改這一個地方。",
        en: "Add a Value node set to 6 — this number will control how tight and sharp the glowing spot is.\n\nAdd a Math node with operation Power.\n\nConnect Map Range's result to the Math node's first value, and the Value node to its second value (the exponent).\n\nPower pushes values already close to 1 to stay close to 1, while pushing everything else lower — a bigger exponent (the Value node) makes the glowing spot tighter and smaller. Extracting it into its own Value node means you can retune sharpness without touching the Math node itself.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_map_range", "value", "converter_math", "value1") &&
        hasLinkBetweenTypes(graph, "input_value", "value", "converter_math", "value2") &&
        anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "power"),
    },
    {
      title: { zh: "第四步：接到色彩帶跟發光，疊加在原本材質上", en: "Step 4: Feed a Color Ramp and Emission, Add on Top of the Base Material" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp），把數學節點的結果接到它的係數（Fac），設定成「大部分是黑、接近 1 的地方才變亮」。\n\n加入發光（Emission）節點，把色彩帶的顏色接到它的顏色，強度調高（例如 4）。\n\n加入加法著色器（Add Shader），把原本的材質接到一個輸入、剛做的發光接到另一個輸入，輸出接到材質輸出。\n\n轉動攝影機環繞球體看看：發光的斑點應該固定出現在球體上同一個地方（跟著物體本身、不是跟著攝影機角度），這跟菲涅爾效果完全不同。",
        en: "Add a Color Ramp, connect the Math node's result to its Fac, and set it up so most of it stays black with only values near 1 lighting up.\n\nAdd an Emission node, connect the Color Ramp's color to it, and raise Strength (e.g. to 4).\n\nAdd an Add Shader, connect the original material to one input and the new Emission to the other, then wire its output to the material output.\n\nOrbit the camera around the sphere: the glowing spot should stay fixed at the same place on the sphere (tied to the object, not the camera angle) — completely unlike a Fresnel-driven effect.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_math", "value", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_emission", "color") &&
        hasNodeOfType(graph, "shader_add_shader"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "用向量數學的內積（表面法線 · 一個手動指定的固定方向）驅動的發光斑點，跟菲涅爾驅動的邊緣反光相比，最大的差異是什麼？",
        en: "How does a glow spot driven by Vector Math's Dot Product (surface normal · a manually fixed direction) fundamentally differ from a Fresnel-driven edge glow?",
      },
      options: [
        { zh: "位置固定在物體本身，旋轉攝影機時斑點不會跟著移動；菲涅爾的亮邊則永遠跟著攝影機角度跑", en: "It stays fixed to the object itself — orbiting the camera doesn't move the spot — while Fresnel's bright edge always follows the camera angle" },
        { zh: "兩者其實效果完全一樣，只是換了不同節點達成同一件事", en: "They're functionally identical, just two different nodes for the same effect" },
        { zh: "內積驅動的效果只能用在球體上，菲涅爾可以用在任何形狀", en: "Dot-product-driven effects only work on spheres, while Fresnel works on any shape" },
        { zh: "內積永遠輸出正值，菲涅爾永遠輸出負值", en: "Dot product always outputs positive values, Fresnel always outputs negative values" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "菲涅爾算的是「表面法線」跟「攝影機方向」的關係，攝影機一轉，亮邊就跟著換位置；內積算的是「表面法線」跟一個寫死在節點裡、不隨攝影機變化的固定方向的關係，所以亮點永遠出現在物體上同一個地方，是物體本身的屬性，不是視角的產物。",
        en: "Fresnel measures the relationship between the surface normal and the camera direction, so the bright edge relocates as the camera orbits. Dot product measures the surface normal against a fixed direction hard-coded in the node, unaffected by the camera — so the glow spot always stays at the same place on the object, a property of the object itself rather than of the viewing angle.",
      },
    },
  ],
};
