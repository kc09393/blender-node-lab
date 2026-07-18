import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_voronoi_distance_metrics",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "沃羅諾伊：用距離度量改變細胞形狀", en: "Voronoi: Reshape Cells with Distance Metric" },
  description: {
    zh: "沃羅諾伊紋理（Voronoi Texture）的距離度量（Distance Metric）決定細胞邊界的形狀：歐式是圓潤的、切比雪夫是方形的、閔可夫斯基（Minkowski）則用 Exponent 插槽在兩者之間連續變化——Exponent 越小越像鑽石/菱形，越大越像正方形。",
    en: "Voronoi Texture's Distance Metric determines each cell's boundary shape: Euclidean gives rounded cells, Chebychev gives square ones, and Minkowski lets you slide continuously between them via its Exponent input — lower values look diamond-shaped, higher values approach square.",
  },
  startGraph: {
    nodes: [
      { id: "t_vdm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vdm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vdm_l1", fromNode: "t_vdm_principled", fromSocket: "bsdf", toNode: "t_vdm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vdm_out", typeId: "output_material", x: 1100, y: 160, params: {} },
      { id: "te_vdm_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_vdm_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: { stops: [{ position: 0, color: [0.05, 0.05, 0.05, 1] }, { position: 0.25, color: [1, 1, 1, 1] }] },
      },
      {
        id: "te_vdm_voronoi",
        typeId: "texture_voronoi",
        x: 300,
        y: 100,
        params: { scale: 6, distanceMetric: "minkowski", exponent: 6 },
      },
    ],
    links: [
      { id: "te_vdm_l1", fromNode: "te_vdm_principled", fromSocket: "bsdf", toNode: "te_vdm_out", toSocket: "surface" },
      { id: "te_vdm_l2", fromNode: "te_vdm_ramp", fromSocket: "color", toNode: "te_vdm_principled", toSocket: "baseColor" },
      { id: "te_vdm_l3", fromNode: "te_vdm_voronoi", fromSocket: "distance", toNode: "te_vdm_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 Distance 畫出細胞邊界", en: "Step 1: Draw Cell Edges with Distance" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture）跟顏色漸變（Color Ramp），把沃羅諾伊紋理的距離（Distance）接到顏色漸變的係數（Fac），再把顏色漸變的顏色（Color）接到原理化 BSDF 的底色（Base Color）。\n\n把顏色漸變的終點位置改小一點（例如 0.25），讓細胞邊界的黑色縫隙更明顯——這樣才看得出細胞形狀。",
        en: "Add a Voronoi Texture and a Color Ramp. Connect Voronoi Texture's Distance to Color Ramp's Fac, then Color Ramp's Color to Principled BSDF's Base Color.\n\nMove the Color Ramp's end stop to a smaller position (e.g. 0.25) so the dark cell edges show up clearly — that's what reveals each cell's shape.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：切換成切比雪夫看方形細胞", en: "Step 2: Switch to Chebychev for Square Cells" },
      instruction: {
        zh: "把沃羅諾伊紋理的距離度量（Distance Metric）切換成「切比雪夫 Chebychev」。細胞應該會從預設的圓潤形狀變成明顯的方形——切比雪夫只看兩軸之中差距最大的那個分量，天生就會切出方形邊界。",
        en: "Switch Voronoi Texture's Distance Metric to 'Chebychev'. Cells should go from the default rounded look to distinctly square — Chebychev only looks at the largest single-axis difference, which naturally carves square boundaries.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "distanceMetric", (v) => v === "chebychev"),
    },
    {
      title: { zh: "第三步：切換成閔可夫斯基", en: "Step 3: Switch to Minkowski" },
      instruction: {
        zh: "再把距離度量切換成「閔可夫斯基 Minkowski」，這時會多出一個 Exponent 插槽。Minkowski 是歐式／曼哈頓／切比雪夫的廣義化：Exponent=1 等於曼哈頓（菱形）、Exponent=2 等於歐式（圓形），Exponent 越大越接近切比雪夫（方形）。",
        en: "Switch Distance Metric to 'Minkowski' — an Exponent input will appear. Minkowski generalizes Euclidean/Manhattan/Chebychev: Exponent=1 equals Manhattan (diamond), Exponent=2 equals Euclidean (round), and larger values approach Chebychev (square).",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "distanceMetric", (v) => v === "minkowski"),
    },
    {
      title: { zh: "第四步：調高 Exponent 逼近方形", en: "Step 4: Raise Exponent Toward Square" },
      instruction: {
        zh: "把 Exponent 調到 6 以上。細胞形狀應該會從剛剛的圓潤/菱形逐漸變得跟切比雪夫的方形非常接近——這就是 Minkowski 「用一個數字連續調整形狀」的用途，不用在 4 種度量之間切換就能微調細胞的方正程度。",
        en: "Raise Exponent to 6 or higher. Cell shapes should gradually approach the same square look as Chebychev — this is Minkowski's whole point: a single number that continuously dials in how 'square' the cells look, without having to jump between the 4 discrete metrics.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "exponent", (v) => v >= 6),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想要方形的沃羅諾伊細胞邊界，該選哪種距離度量（Distance Metric）？",
        en: "To get square Voronoi cell boundaries, which Distance Metric should you pick?",
      },
      options: [
        { zh: "歐式 Euclidean（圓潤）", en: "Euclidean (rounded)" },
        { zh: "切比雪夫 Chebychev（方形）", en: "Chebychev (square)" },
        { zh: "閔可夫斯基 Minkowski，Exponent 設 1（菱形）", en: "Minkowski with Exponent set to 1 (diamond)" },
        { zh: "以上三者形狀都一樣", en: "All three produce the same shape" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "切比雪夫只看兩軸中差距最大的那個分量，天生就會切出方形邊界；歐式是一般直線距離，形狀圓潤；Minkowski 的 Exponent=1 剛好等於曼哈頓距離，形狀是菱形，不是方形。",
        en: "Chebychev only considers the largest of the two axis differences, which inherently produces square boundaries. Euclidean uses ordinary straight-line distance, giving rounded cells. Minkowski with Exponent=1 is equivalent to Manhattan distance, which is diamond-shaped, not square.",
      },
    },
  ],
};
