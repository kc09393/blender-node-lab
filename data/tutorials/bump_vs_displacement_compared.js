import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_bump_vs_displacement_compared",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "Bump vs Displacement：同一份高度資料，直接比一比", en: "Bump vs Displacement: Same Height Data, Direct Comparison" },
  description: {
    zh: "凹凸（Bump）教學跟位移（Displacement）教學分別存在，但沒有人直接把兩者放在同一張圖上比較過。這篇用同一份雜訊高度資料，先接 Bump、再多接一份 Displacement，讓你親眼看到「輪廓完全沒變，只是光影騙術」跟「輪廓真的凹凸」的差異，不用只靠文字想像。",
    en: "Bump and Displacement each have their own tutorial, but nobody's put them side by side on the same graph. This one feeds the same noise height data into both — first Bump, then Displacement too — so you can see with your own eyes that one is pure lighting trickery (silhouette unchanged) while the other genuinely deforms the surface, instead of just reading about the difference.",
  },
  startGraph: {
    nodes: [
      { id: "t_bvd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_bvd_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
    ],
    links: [{ id: "t_bvd_l1", fromNode: "t_bvd_principled", fromSocket: "bsdf", toNode: "t_bvd_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_bvd_out", typeId: "output_material", x: 1200, y: 220, params: {} },
      { id: "te_bvd_principled", typeId: "shader_principled_bsdf", x: 900, y: 60, params: { baseColor: [0.55, 0.5, 0.45, 1], roughness: 0.8 } },
      { id: "te_bvd_noise", typeId: "texture_noise", x: 300, y: 160, params: { scale: 4 } },
      { id: "te_bvd_bump", typeId: "vector_bump", x: 600, y: 60, params: { strength: 1 } },
      { id: "te_bvd_disp", typeId: "vector_displacement", x: 600, y: 320, params: { midlevel: 0.5, scale: 0.18 } },
    ],
    links: [
      { id: "te_bvd_l1", fromNode: "te_bvd_principled", fromSocket: "bsdf", toNode: "te_bvd_out", toSocket: "surface" },
      { id: "te_bvd_l2", fromNode: "te_bvd_noise", fromSocket: "fac", toNode: "te_bvd_bump", toSocket: "height" },
      { id: "te_bvd_l3", fromNode: "te_bvd_bump", fromSocket: "normal", toNode: "te_bvd_principled", toSocket: "normal" },
      { id: "te_bvd_l4", fromNode: "te_bvd_noise", fromSocket: "fac", toNode: "te_bvd_disp", toSocket: "height" },
      { id: "te_bvd_l5", fromNode: "te_bvd_disp", fromSocket: "displacement", toNode: "te_bvd_out", toSocket: "displacement" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先用 Bump 做出光影凹凸", en: "Step 1: Fake It First with Bump" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture）跟凹凸（Bump），把雜訊的係數（Fac）接到 Bump 的高度（Height），Bump 的輸出接到原理化 BSDF 的法線（Normal）。畫面應該會出現坑坑洞洞的光影效果。",
        en: "Add a Noise Texture and a Bump node, connect Noise's Fac to Bump's Height, and Bump's output to Principled BSDF's Normal. The surface should now show pitted, uneven-looking shading.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第二步：旋轉觀察，輪廓其實是直的", en: "Step 2: Rotate and Notice the Silhouette Is Still Flat" },
      instruction: {
        zh: "拖曳旋轉球體，把某個凹凸明顯的地方轉到邊緣輪廓上。你會發現輪廓還是一條平滑的圓弧線——完全沒有真的凹凸進去或凸出來。Bump 只是騙過光影計算，球體的實際形狀（頂點位置）從頭到尾沒有變過。",
        en: "Drag to rotate the sphere, bringing an obviously bumpy spot to the silhouette edge. You'll find the outline is still a smooth arc — nothing actually pokes in or out. Bump only fools the lighting math; the sphere's real shape (vertex positions) never changed.",
      },
      check: (graph) => hasNodeOfType(graph, "vector_bump"),
    },
    {
      title: { zh: "第三步：加入 Displacement，接上同一份高度資料", en: "Step 3: Add Displacement, Fed by the Same Height Data" },
      instruction: {
        zh: "加入位移（Displacement，向量 Vector 分類），把同一個雜訊紋理的係數（Fac）也接到它的高度（Height）——注意這是「同一份資料，接去兩個地方」，不是換掉 Bump。再把 Displacement 的輸出接到材質輸出（Material Output）的位移（Displacement）插槽（不是 Surface）。",
        en: "Add a Displacement node (Vector category), and connect the same Noise Texture's Fac to its Height too — note this is 'the same data, wired to two places', not replacing Bump. Then connect Displacement's output to Material Output's Displacement socket (not Surface).",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "vector_displacement", "height") &&
        hasLinkBetweenTypes(graph, "vector_displacement", "displacement", "output_material", "displacement"),
    },
    {
      title: { zh: "第四步：調大 Scale，這次輪廓真的變了", en: "Step 4: Raise Scale — This Time the Silhouette Really Changes" },
      instruction: {
        zh: "把 Displacement 的縮放（Scale）調到 0.15 以上，再一次旋轉球體看邊緣輪廓。這次輪廓會真的凹凸不平——這就是兩者的根本差異：不管把 Bump 的強度（Strength）調多高，輪廓永遠是平滑的；Displacement 哪怕縮放不大，輪廓也一定會跟著改變，因為它動的是真正的頂點位置。",
        en: "Raise Displacement's Scale above 0.15, and rotate the sphere again to check the edge. This time the silhouette genuinely bumps in and out — the fundamental difference: no matter how high you push Bump's Strength, the silhouette stays perfectly smooth; Displacement, even at a modest scale, always changes the silhouette, because it moves real vertex positions.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_displacement", "scale", (v) => typeof v === "number" && v >= 0.15),
    },
  ],
  quiz: [
    {
      question: {
        zh: "如果你需要凹凸紋理真的改變物體的邊緣輪廓（不只是光影明暗變化），該用哪個節點？",
        en: "If you need a bump texture to genuinely change the object's silhouette (not just its shading), which node should you use?",
      },
      options: [
        { zh: "凹凸 Bump", en: "Bump" },
        { zh: "位移 Displacement", en: "Displacement" },
        { zh: "兩個效果完全一樣，選哪個都行", en: "They're identical — either works" },
        { zh: "法線貼圖 Normal Map", en: "Normal Map" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Bump 只是「騙過光照」讓表面看起來凹凸，不會改變真正的幾何形狀，物體輪廓依然平滑；只有 Displacement（在頂點著色器裡真的移動頂點）才會讓輪廓真的凸出或凹陷。",
        en: "Bump only fakes the lighting to make a surface look uneven — it never touches the actual geometry, so the silhouette stays smooth. Only Displacement (which genuinely moves vertices in the vertex shader) makes the silhouette actually bulge or recede.",
      },
    },
  ],
};
