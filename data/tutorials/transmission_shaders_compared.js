import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_transmission_shaders_compared",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "三種穿透著色器比一比：Glass、Refraction、Translucent", en: "Three Transmission Shaders Compared: Glass, Refraction, Translucent" },
  description: {
    zh: "玻璃 BSDF（Glass BSDF）、折射 BSDF（Refraction BSDF）、半透射 BSDF（Translucent BSDF）都跟「光線穿透」有關，很容易搞混。這篇用同一顆球依序切換三者，直接感受差異：Glass 有菲涅爾（Fresnel）驅動的反射，側邊角度會明顯變亮/更不透明；Refraction 只有純折射穿透、完全沒有反射，透明度只跟粗糙度有關、不會隨視角變化；Translucent 則完全不是「看穿過去」，而是像葉子一樣讓光在物體內部散開、邊緣透出微光。",
    en: "Glass BSDF, Refraction BSDF, and Translucent BSDF are all about light passing through, and easy to mix up. This tutorial switches through all three on the same sphere so you can feel the difference directly: Glass has Fresnel-driven reflection that visibly brightens/opaques at grazing angles; Refraction is pure transmission with zero reflection — its transparency depends only on roughness, not viewing angle; Translucent isn't about 'seeing through' at all — it's more like a leaf, letting light scatter inside the object and glow faintly at the edges.",
  },
  startGraph: {
    nodes: [
      { id: "t_tsc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_tsc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_tsc_l1", fromNode: "t_tsc_principled", fromSocket: "bsdf", toNode: "t_tsc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_tsc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "te_tsc_transl",
        typeId: "shader_translucent_bsdf",
        x: 600,
        y: 100,
        params: { color: [0.3, 0.6, 0.2, 1] },
      },
    ],
    links: [{ id: "te_tsc_l1", fromNode: "te_tsc_transl", fromSocket: "bsdf", toNode: "te_tsc_out", toSocket: "surface" }],
  },
  steps: [
    {
      title: { zh: "第一步：先看 Glass BSDF 的反光邊緣", en: "Step 1: Start with Glass BSDF's Reflective Edge" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入玻璃 BSDF（Glass BSDF），接到材質輸出（Material Output）。粗糙度（Roughness）調到接近 0。旋轉觀察一下：側邊角度應該會比正面看起來更亮、更不透明——這就是 Fresnel 驅動的反射在起作用。",
        en: "Drag in Glass BSDF from the Shader category and connect it to Material Output. Set Roughness near 0. Rotate the view: the edges should look brighter and more opaque than head-on — that's Fresnel-driven reflection at work.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_glass_bsdf", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第二步：換成 Refraction BSDF，注意側邊不再變亮", en: "Step 2: Switch to Refraction BSDF — the Edges No Longer Brighten" },
      instruction: {
        zh: "把材質輸出改接折射 BSDF（Refraction BSDF），粗糙度一樣調到接近 0。這次不管怎麼旋轉，透明度都不會隨角度變化——因為 Refraction BSDF 只有純折射穿透，完全沒有反射分量。試著把粗糙度調高（例如 0.8），會看到整顆球變得比較不透明，證明這裡是 Roughness 在控制透明度，不是視角。\n\n⚠️ IOR 插槽在這裡調了不會有任何畫面變化——因為真正的折射彎曲需要對背景做逐光線取樣，本沙盒做不到，保留這個插槽只是為了跟 Blender 介面一致。",
        en: "Reconnect Material Output to Refraction BSDF instead, keeping Roughness near 0. This time, no matter how you rotate the view, transparency doesn't change with angle — because Refraction BSDF is pure transmission with zero reflection. Try raising Roughness (e.g. 0.8) and the whole sphere gets less transparent, proving Roughness — not viewing angle — controls it here.\n\n⚠️ The IOR socket won't visibly do anything here — true refractive bending needs per-ray sampling of the background, which this sandbox can't do. It's kept only to match Blender's interface.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_refraction_bsdf", "bsdf", "output_material", "surface") &&
        anyNodeParamMatches(graph, "shader_refraction_bsdf", "roughness", (v) => v >= 0.5),
    },
    {
      title: { zh: "第三步：換成 Translucent BSDF，感受完全不同的效果", en: "Step 3: Switch to Translucent BSDF — a Completely Different Effect" },
      instruction: {
        zh: "把材質輸出改接半透射 BSDF（Translucent BSDF），顏色（Color）改成綠色（例如葉子的顏色）。畫面不會有任何「看穿過去」的感覺——整顆球呈現柔和的散射色調，邊緣（越靠近輪廓的地方）會透出比中央更亮一點的光暈，很像光線從葉子背後穿出來的感覺。",
        en: "Reconnect Material Output to Translucent BSDF, setting Color to green (like a leaf). There's no 'seeing through' sensation at all — the whole sphere shows a soft, scattered color tone, with the edges (near the silhouette) glowing slightly brighter than the center, similar to light passing through the back of a leaf.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_translucent_bsdf", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第四步：總結三者的關鍵差異", en: "Step 4: Sum Up the Key Differences" },
      instruction: {
        zh: "三種都跟「光」有關，但用途完全不同：\n\n・Glass BSDF：想做出玻璃、水、寶石這種「會反光也會透光」的完整效果，選這個。\n・Refraction BSDF：只想要純折射、不要額外反光（通常會自己另外接一個 Glossy BSDF 手動控制反光比例）的進階用法才用得到。\n・Translucent BSDF：物體本身不透明，但很薄、光線會從內部透出來（葉子、紙張、蠟燭），選這個，不要跟前兩者混淆。",
        en: "All three involve light, but they serve very different purposes:\n\n• Glass BSDF: for the full 'reflects and transmits' look of glass, water, gems.\n• Refraction BSDF: for pure transmission with no extra reflection — an advanced use case, usually paired with a separately-controlled Glossy BSDF.\n• Translucent BSDF: for objects that aren't see-through but are thin enough that light glows through from inside (leaves, paper, candles) — don't confuse this with the other two.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "shader_translucent_bsdf", "bsdf", "output_material", "surface"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "以下哪個穿透著色器的透明度『不會』隨著旋轉視角改變，只跟粗糙度有關？",
        en: "Which of these transmission shaders' transparency does NOT change as you rotate the view — depending only on roughness?",
      },
      options: [
        { zh: "玻璃 BSDF Glass BSDF", en: "Glass BSDF" },
        { zh: "折射 BSDF Refraction BSDF", en: "Refraction BSDF" },
        { zh: "以上兩個都會隨視角改變", en: "Both change with viewing angle" },
        { zh: "以上兩個都不會隨視角改變", en: "Neither changes with viewing angle" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Glass BSDF 用菲涅爾公式驅動透明度，側邊掠視角度會明顯變亮、更不透明；Refraction BSDF 是純折射穿透、完全不用菲涅爾，透明度只跟粗糙度有關，旋轉視角不會有任何變化。",
        en: "Glass BSDF drives its transparency with the Fresnel equation, visibly brightening and becoming more opaque at grazing angles. Refraction BSDF is pure transmission with no Fresnel involved at all — its transparency depends solely on roughness and stays constant as you rotate the view.",
      },
    },
  ],
};
