import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入漸變紋理", en: "Step 1: Add a Gradient Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入漸變紋理（Gradient Texture），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。預設是線性（Linear）漸層，應該會看到球體從一側到另一側由黑到白。",
        en: "Drag in a Gradient Texture from the Texture category and connect it to Principled BSDF's Base Color. The default is Linear, so the sphere should fade from black to white across one axis.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_gradient", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：切換成球狀", en: "Step 2: Switch to Spherical" },
      instruction: {
        zh: "把類型（Type）改成球狀（Spherical）。漸層應該會從中心點向外呈環狀擴散，而不是單一方向的線性漸變。\n\n小提醒：放射狀（Radial）是另一種類型，效果是繞著中心點「角度掃描」（像時鐘指針轉一圈），不是這裡要的環狀擴散，兩個類型不要搞混。",
        en: "Change Type to Spherical. The gradient should now radiate outward from a center point in rings, instead of fading in a single direction.\n\nNote: Radial is a different type — it sweeps by angle around the center (like a clock hand), not the ring-expansion effect used here. Don't mix the two up.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_gradient", "type", (v) => v === "spherical"),
    },
    {
      title: { zh: "第三步：接到顏色漸變上色", en: "Step 3: Color It with a Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp），把漸變紋理的係數（Fac）接到它的係數（Fac），再把顏色漸變的顏色（Color）接到底色，取代直接接的黑白漸層——這樣就能把單純的黑白漸層轉成任意配色。",
        en: "Add a Color Ramp, connect Gradient Texture's Fac to its Fac, then connect the Color Ramp's Color to Base Color instead — turning the plain black/white gradient into any color scheme you like.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_gradient", "fac", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "漸變紋理的「放射狀 Radial」類型，實際計算的是什麼？",
        en: "What does Gradient Texture's 'Radial' type actually compute?",
      },
      options: [
        { zh: "繞著中心點的角度掃描（像時鐘指針轉一圈）", en: "An angular sweep around the center (like a clock hand)" },
        { zh: "距離中心點的遠近，向外呈環狀擴散", en: "Distance from the center, radiating outward in rings" },
        { zh: "沿 Z 軸的高度", en: "Height along the Z axis" },
        { zh: "隨機雜訊", en: "Random noise" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "放射狀（Radial）是角度掃描；距離中心點呈環狀擴散的其實是球狀（Spherical）——這兩個名字很容易讓人以為反過來（本站過去真的把這兩個公式弄反過，修正過一次），使用時要特別留意分清楚。",
        en: "Radial sweeps by angle. The ring-expansion-from-center effect is actually Spherical — the two names are easy to mix up (this site once genuinely had the two formulas swapped and had to fix it), so it's worth double-checking which one you actually want.",
      },
    },
  ],
};
