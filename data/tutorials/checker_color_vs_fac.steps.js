import { hasLinkBetweenTypes, nodeHasIncomingFromType, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：準備塑膠跟金屬兩種材質", en: "Step 1: Prepare a Plastic and a Metal Material" },
      instruction: {
        zh: "現有的原理化 BSDF 就是塑膠：金屬度（Metallic）0、粗糙度（Roughness）0.3。\n\n再拖入一個新的原理化 BSDF 當金屬：底色（Base Color）改淺灰、金屬度調到 1、粗糙度調低（例如 0.2），先不用接線。",
        en: "The existing Principled BSDF is the plastic: Metallic 0, Roughness 0.3.\n\nDrag in a new Principled BSDF for the metal: light gray Base Color, Metallic set to 1, lower Roughness (e.g. 0.2). Don't wire it up yet.",
      },
      check: (graph) => {
        const principled = findNodesOfType(graph, "shader_principled_bsdf");
        return principled.length >= 2 && principled.some((n) => n.params.metallic >= 0.9);
      },
    },
    {
      title: { zh: "第二步：混合著色器接好兩種材質", en: "Step 2: Wire Both Into Mix Shader" },
      instruction: {
        zh: "加入混合著色器（Mix Shader），把塑膠跟金屬分別接到兩個著色器輸入，接到材質輸出（Material Output）取代原本的直接連線。",
        en: "Add a Mix Shader, connect the plastic and metal Principled nodes to its two Shader inputs, then wire it to Material Output, replacing the direct connection.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf"),
    },
    {
      title: { zh: "第三步：加入棋盤格，這次接 Fac 而不是 Color", en: "Step 3: Add Checker — This Time Wire Fac, Not Color" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate）跟棋盤格紋理（Checker Texture），把紋理座標的 Generated 接到棋盤格的向量（Vector）。\n\n⚠️ 關鍵的一步：把棋盤格的係數（Fac，不是 Color！）接到混合著色器的 Fac。Fac 是乾淨的 0 或 1，剛好可以直接當混合開關用。",
        en: "Add a Texture Coordinate and a Checker Texture, connect Texture Coordinate's Generated to Checker's Vector.\n\n⚠️ The key step: connect Checker's Fac output (not Color!) to Mix Shader's Fac. Fac is a clean 0 or 1 — exactly what a mix switch needs.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "fac", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第四步：觀察結果，理解兩個輸出的差異", en: "Step 4: Observe the Result and Understand the Difference" },
      instruction: {
        zh: "畫面應該會出現真的一半塑膠、一半金屬的棋盤格——不是同一種材質換顏色，是材質本身（連粗糙度、金屬度都不同）在切換。\n\n如果剛剛接的是 Color 而不是 Fac，系統雖然還是能運作（Color 會自動依亮度換算成 0-1），但語意上會很奇怪：你等於是拿「兩個顏色」硬套進「應該是開關」的插槽。\n\nFac 才是設計給這種用途的正確輸出。",
        en: "The result should be a checkerboard that's genuinely half plastic, half metal — not one material recoloring, but the material itself (roughness, metallic, everything) switching.\n\nIf you'd wired Color instead of Fac, it would technically still work (Color auto-converts to 0-1 via luminance), but semantically that's odd — you'd be forcing 'two colors' into a socket meant to be a switch.\n\nFac is the output actually designed for this purpose.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "fac", "shader_mix_shader", "fac"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想用棋盤格紋理做出「一半塑膠、一半金屬」（連粗糙度、金屬度都不同，不只是顏色不同）的效果，該接哪個輸出到混合著色器的 Fac？",
        en: "To make a checkerboard that's genuinely half plastic, half metal (different roughness and metallic, not just different colors), which output should drive Mix Shader's Fac?",
      },
      options: [
        { zh: "Color", en: "Color" },
        { zh: "Fac", en: "Fac" },
        { zh: "兩個都可以，效果一樣", en: "Either works — same result" },
        { zh: "都不行，Checker 不能驅動 Mix Shader", en: "Neither — Checker can't drive Mix Shader" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Color 輸出的是顏色（type: color），Mix Shader 的 Fac 插槽要的是 0-1 的數值——只有 Fac 輸出（灰階 0/1 的浮點數）型別相符，也才能真正切換兩種完全不同的材質，而不只是同一種材質換個顏色。",
        en: "Color outputs a color value, but Mix Shader's Fac socket expects a 0-1 float — only the Fac output (a grayscale 0/1 float) matches that type, and only it can genuinely switch between two entirely different materials rather than just recoloring one.",
      },
    },
  ],
};
