import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_rgb_curves",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "RGB 曲線：像 Photoshop 一樣調色調", en: "RGB Curves: Tone-Mapping Like Photoshop" },
  description: {
    zh: "RGB 曲線（RGB Curves）節點可以直接對一張顏色的明暗對應關係拖出一條自訂曲線——比亮度/對比度更自由，可以只拉暗部或只拉亮部，概念上跟 Photoshop 的曲線工具完全一樣。",
    en: "The RGB Curves node lets you drag out a custom tone-mapping curve for a color — more flexible than Brightness/Contrast, letting you pull just the shadows or just the highlights. The exact same concept as Photoshop's Curves tool.",
  },
  startGraph: {
    nodes: [
      { id: "t_rc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_rc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_rc_l1", fromNode: "t_rc_principled", fromSocket: "bsdf", toNode: "t_rc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_rc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_rc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_rc_curves",
        typeId: "color_rgb_curves",
        x: 300,
        y: 100,
        params: { fac: 1, color: [0.6, 0.6, 0.6, 1], points: [{ x: 0, y: 0 }, { x: 0.5, y: 0.75 }, { x: 1, y: 1 }] },
      },
    ],
    links: [
      { id: "te_rc_l1", fromNode: "te_rc_principled", fromSocket: "bsdf", toNode: "te_rc_out", toSocket: "surface" },
      { id: "te_rc_l2", fromNode: "te_rc_curves", fromSocket: "color", toNode: "te_rc_principled", toSocket: "baseColor" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 RGB 曲線", en: "Step 1: Add RGB Curves" },
      instruction: {
        zh: "從「顏色 Color」分類拖入 RGB 曲線（RGB Curves），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Drag in RGB Curves from the Color category and connect it to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "color_rgb_curves", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：把中間點往上拖", en: "Step 2: Drag the Midpoint Upward" },
      instruction: {
        zh: "在節點卡片上點一下曲線中段新增一個控制點，往上拖曳——這樣中間調會被整體拉亮，同時保留最暗跟最亮兩端不變，是修圖時常用的「提升中間調」手法。",
        en: "Click the middle of the curve on the node card to add a control point, then drag it upward — midtones brighten while the darkest and brightest ends stay put. A common photo-editing move: 'lift the midtones'.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "color_rgb_curves", "points", (pts) => {
          if (!Array.isArray(pts)) return false;
          return pts.some((p) => p.x > 0.2 && p.x < 0.8 && p.y > p.x + 0.15);
        }),
    },
    {
      title: { zh: "第三步：確認效果", en: "Step 3: Confirm the Effect" },
      instruction: {
        zh: "看看即時預覽，球體整體應該比原本的灰色更亮一些，但沒有整個變成死白——這就是曲線工具「局部調整」的威力，比單純調 Bright/Contrast 更精細。",
        en: "Check the live preview — the sphere should look brighter overall than the plain gray, without blowing out to solid white. That's the power of curve-based 'local adjustment', more refined than a flat Brightness/Contrast slider.",
      },
      check: (graph) => hasNodeOfType(graph, "color_rgb_curves"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "在 RGB 曲線中段新增一個控制點並往上拖曳，跟直接調高亮度/對比度（Bright/Contrast）相比，關鍵差異是什麼？",
        en: "Adding a midpoint control point to RGB Curves and dragging it up — how is that fundamentally different from raising Brightness/Contrast?",
      },
      options: [
        { zh: "只有中間調被拉亮，最暗跟最亮兩端維持不變——是局部調整，不是整體平移", en: "Only midtones get brighter; the darkest and brightest ends stay fixed — a local adjustment, not a global shift" },
        { zh: "效果完全一樣，只是操作方式不同", en: "The effect is identical, just a different way to operate it" },
        { zh: "只影響 Alpha 透明度，不影響 RGB 本身", en: "It only affects Alpha transparency, not RGB itself" },
        { zh: "只能整體拉亮或整體拉暗，無法只調中間", en: "It can only brighten or darken everything at once, never just the middle" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "曲線工具的威力在於可以只針對特定亮度區間（例如中間調）調整，同時保留兩端不動；Bright/Contrast 是套用同一個公式到整張圖的每個亮度，沒辦法只挑中間調處理。",
        en: "The power of a curve tool is targeting a specific brightness range (like midtones) while leaving the ends untouched. Bright/Contrast applies the same formula to every brightness level uniformly — it can't isolate just the midtones.",
      },
    },
  ],
};
