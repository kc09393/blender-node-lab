import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_mix_color_blend_modes_tour",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "認識混合顏色：正片疊底、濾色、疊加怎麼選", en: "Get to Know Mix Color: Multiply, Screen, Overlay" },
  description: {
    zh: "混合顏色（Mix Color）的混合模式（Blend Mode）下拉選單有 18 種，光看名字很難決定要選哪個。這篇用固定的兩個顏色，切換 3 種最常用的模式——正片疊底（Multiply，讓畫面變暗）、濾色（Screen，讓畫面變亮，效果跟「去掉黑色」很像）、疊加（Overlay，同時兼顧兩種效果），讓你直接看到差異、知道什麼情境該選哪個。",
    en: "Mix Color's Blend Mode dropdown has 18 options — hard to know which to pick from names alone. This tutorial uses two fixed colors and switches through 3 of the most-used modes: Multiply (darkens), Screen (brightens — similar to 'removing black'), and Overlay (does a bit of both), so you can see the difference directly and know which to reach for.",
  },
  startGraph: {
    nodes: [
      { id: "t_mcb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mcb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mcb_l1", fromNode: "t_mcb_principled", fromSocket: "bsdf", toNode: "t_mcb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mcb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_mcb_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      {
        id: "te_mcb_mix",
        typeId: "color_mix",
        x: 560,
        y: 100,
        params: { mode: "overlay", fac: 1 },
      },
      { id: "te_mcb_rgb_a", typeId: "input_rgb", x: 300, y: 40, params: { color: [0.85, 0.2, 0.15, 1] } },
      { id: "te_mcb_rgb_b", typeId: "input_rgb", x: 300, y: 220, params: { color: [0.2, 0.5, 0.85, 1] } },
    ],
    links: [
      { id: "te_mcb_l1", fromNode: "te_mcb_principled", fromSocket: "bsdf", toNode: "te_mcb_out", toSocket: "surface" },
      { id: "te_mcb_l2", fromNode: "te_mcb_mix", fromSocket: "color", toNode: "te_mcb_principled", toSocket: "baseColor" },
      { id: "te_mcb_l3", fromNode: "te_mcb_rgb_a", fromSocket: "color", toNode: "te_mcb_mix", toSocket: "a" },
      { id: "te_mcb_l4", fromNode: "te_mcb_rgb_b", fromSocket: "color", toNode: "te_mcb_mix", toSocket: "b" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：接上兩個固定顏色，Fac 拉到 1", en: "Step 1: Wire Up Two Fixed Colors, Set Fac to 1" },
      instruction: {
        zh: "加入兩個 RGB 節點（輸入 Input 分類）：一個改成紅色、一個改成藍色。加入混合顏色（Mix Color，顏色 Color 分類），把紅色接到 A、藍色接到 B，接到原理化 BSDF 的底色（Base Color）。\n\n把 Fac 拉到 1（讓混合結果 100% 生效，不要跟原本的 A 混在一起，才看得出每種模式的完整效果）。",
        en: "Add two RGB nodes (Input category): set one to red, one to blue. Add a Mix Color (Color category), connect red to A, blue to B, then to Principled BSDF's Base Color.\n\nSet Fac to 1 (so the blend result shows at full strength, not partially blended back toward A — otherwise you won't see each mode's full effect).",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "color_mix", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "color_mix", "fac", (v) => v >= 0.95),
    },
    {
      title: { zh: "第二步：切到「正片疊底」看畫面變暗", en: "Step 2: Switch to Multiply — It Gets Darker" },
      instruction: {
        zh: "把混合模式（Blend Mode）切換成正片疊底（Multiply，「變暗 Darken」分組）。結果會比 A、B 兩個顏色都暗。\n\n公式是兩個顏色的數值直接相乘（0-1 之間的兩個數相乘，結果一定更小），常用來疊加陰影、髒污、暗角這類「只會讓底下變暗」的效果，白色（1）疊上去等於完全不影響，黑色（0）疊上去等於整片全黑。",
        en: "Switch Blend Mode to Multiply ('Darken' group). The result is darker than both A and B.\n\nThe formula multiplies the two color values directly (multiplying two numbers between 0-1 always gives something smaller), commonly used to layer shadows, grime, or vignettes that only ever darken. White (1) has no effect when multiplied; black (0) makes the result fully black.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "multiply"),
    },
    {
      title: { zh: "第三步：切到「濾色」看畫面變亮", en: "Step 3: Switch to Screen — It Gets Brighter" },
      instruction: {
        zh: "把混合模式切換成濾色（Screen，「變亮 Lighten」分組）。結果會比 A、B 兩個顏色都亮，效果剛好跟正片疊底相反。\n\n公式是先把兩個顏色都「反過來」相乘、再反回去，等於「兩邊的暗都被對方的亮蓋掉」，很像把黑色洗掉的感覺，常用來疊加光暈、發光、鏡頭光斑這類「只會讓底下變亮」的效果。\n\n黑色（0）疊上去等於完全不影響，白色（1）疊上去等於整片全白。",
        en: "Switch Blend Mode to Screen ('Lighten' group). The result is brighter than both A and B — the exact opposite of Multiply.\n\nThe formula inverts both colors, multiplies them, then inverts back — meaning each color's darkness gets washed out by the other's brightness, almost like 'removing black'. Commonly used to layer glows, light bloom, or lens flares that only ever brighten.\n\nBlack (0) has no effect; white (1) makes the result fully white.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "screen"),
    },
    {
      title: { zh: "第四步：切到「疊加」，兩種效果各取一半", en: "Step 4: Switch to Overlay — A Bit of Both" },
      instruction: {
        zh: "把混合模式切換成疊加（Overlay，「對比 Contrast」分組）。畫面看起來介於正片疊底跟濾色之間。\n\nOverlay 的規則是「以 A 的明暗為準」：A 比較暗的部分套用正片疊底（變得更暗），A 比較亮的部分套用濾色（變得更亮），效果是同時拉開明暗對比，很適合疊加細節/紋理又不想整體一面倒地變暗或變亮。",
        en: "Switch Blend Mode to Overlay ('Contrast' group). The result sits between Multiply and Screen.\n\nOverlay's rule is 'based on A's brightness': A's darker areas get the Multiply treatment (darker still), A's brighter areas get the Screen treatment (brighter still), stretching contrast in both directions at once. Great for layering detail/texture without uniformly darkening or brightening everything.",
      },
      check: (graph) => anyNodeParamMatches(graph, "color_mix", "mode", (v) => v === "overlay"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "同樣兩個顏色、Fac 都是 1，正片疊底（Multiply）跟濾色（Screen）比較起來，哪一個結果比較亮？",
        en: "With the same two colors and Fac=1, which blend mode produces a brighter result: Multiply or Screen?",
      },
      options: [
        { zh: "正片疊底（Multiply）比較亮", en: "Multiply is brighter" },
        { zh: "濾色（Screen）比較亮", en: "Screen is brighter" },
        { zh: "兩者一樣亮", en: "They're equally bright" },
        { zh: "無法比較，取決於顏色", en: "Can't say — depends on the colors" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Multiply 的公式是 a×b，結果一定比兩者都暗（除非其中一個是純白）；Screen 剛好是 Multiply 的反相版（1-(1-a)(1-b)），結果一定比兩者都亮。這個「一定」是數學上保證的，不受挑選的顏色影響。",
        en: "Multiply's formula is a×b, which is always darker than (or equal to) both inputs unless one is pure white. Screen is Multiply's inverted counterpart (1-(1-a)(1-b)), which is always brighter than both. This holds mathematically regardless of which colors you pick.",
      },
    },
  ],
};
