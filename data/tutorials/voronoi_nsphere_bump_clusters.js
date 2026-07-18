import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_voronoi_nsphere_bump_clusters",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "沃羅諾伊做圓潤凸起：N-球半徑接凹凸", en: "Rounded Bumps with Voronoi: N-Sphere Radius into Bump" },
  description: {
    zh: "沃羅諾伊（Voronoi）接凹凸（Bump）最常見的做法是用「到邊緣的距離」做出裂縫/溝紋，但如果想要的是一顆顆分開、圓潤的凸起（藤壺、鵝卵石、疙瘩），該換成 N-球半徑（N-Sphere Radius）——這篇直接對比兩種特徵接凹凸的差異，讓你知道什麼情境該選哪一個。",
    en: "The usual Voronoi-into-Bump recipe uses Distance to Edge for cracks/grooves, but if you want separate, rounded individual bumps (barnacles, pebbles, warts), switch to N-Sphere Radius instead — this tutorial directly compares both features driving Bump so you know which to reach for.",
  },
  startGraph: {
    nodes: [
      { id: "t_vnb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vnb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { baseColor: [0.5, 0.48, 0.45, 1], roughness: 0.7 } },
    ],
    links: [{ id: "t_vnb_l1", fromNode: "t_vnb_principled", fromSocket: "bsdf", toNode: "t_vnb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vnb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vnb_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: { baseColor: [0.5, 0.48, 0.45, 1], roughness: 0.7 } },
      { id: "te_vnb_bump", typeId: "vector_bump", x: 560, y: 100, params: { strength: 0.8 } },
      { id: "te_vnb_voronoi", typeId: "texture_voronoi", x: 300, y: 100, params: { feature: "n_sphere_radius", scale: 18, randomness: 1 } },
    ],
    links: [
      { id: "te_vnb_l1", fromNode: "te_vnb_principled", fromSocket: "bsdf", toNode: "te_vnb_out", toSocket: "surface" },
      { id: "te_vnb_l2", fromNode: "te_vnb_bump", fromSocket: "normal", toNode: "te_vnb_principled", toSocket: "normal" },
      { id: "te_vnb_l3", fromNode: "te_vnb_voronoi", fromSocket: "distance", toNode: "te_vnb_bump", toSocket: "height" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先用預設的 F1 特徵接凹凸", en: "Step 1: Start with the Default F1 Feature into Bump" },
      instruction: {
        zh: "加入沃羅諾伊紋理（Voronoi Texture，維持預設的 F1 特徵）跟凹凸（Bump），把沃羅諾伊的距離（Distance）接到凹凸的高度（Height），凹凸的輸出接到原理化 BSDF 的法線（Normal）。F1 做出來的凹凸是連續的、每個細胞中心到邊界平滑漸變的稜角感。",
        en: "Add a Voronoi Texture (keep the default F1 feature) and a Bump node, connect Voronoi's Distance to Bump's Height, and Bump's output to Principled BSDF's Normal. F1 produces a continuous, faceted bump that smoothly grades from each cell's center to its boundary.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "texture_voronoi", "distance", "vector_bump", "height") &&
        hasLinkBetweenTypes(graph, "vector_bump", "normal", "shader_principled_bsdf", "normal"),
    },
    {
      title: { zh: "第二步：切換成 N-球半徑，看凸起變圓潤", en: "Step 2: Switch to N-Sphere Radius — Bumps Turn Rounded" },
      instruction: {
        zh: "把沃羅諾伊的特徵（Feature）切換成 N-球半徑（N-Sphere Radius）。畫面應該會明顯改變：不再是連續的稜角漸變，而是一顆顆分開、圓潤的凸起，很像藤壺或鵝卵石——因為這個特徵算的是「這個細胞點本身能塞進去、不跟鄰居重疊的最大球半徑」，天生就是「每一格一顆獨立圓球」的概念。",
        en: "Switch Voronoi's Feature to N-Sphere Radius. The result should change noticeably: no longer a continuous faceted gradient, but separate, rounded bumps — like barnacles or pebbles — because this feature computes 'the largest sphere this cell's point fits without overlapping its neighbors', which is inherently 'one independent round bump per cell.'",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "feature", (v) => v === "n_sphere_radius"),
    },
    {
      title: { zh: "第三步：調整縮放，控制凸起的密度", en: "Step 3: Adjust Scale to Control Bump Density" },
      instruction: {
        zh: "把沃羅諾伊的縮放（Scale）調高（例如 18 以上）。凸起會變得更小、更密集——很適合用來做藤壺群聚、青春痘、鉚釘陣列這類「大量重複的小圓凸起」效果。",
        en: "Raise Voronoi's Scale (e.g. above 18). The bumps get smaller and denser — great for barnacle clusters, acne, rivet arrays, or any 'lots of repeating small round bumps' effect.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "scale", (v) => v >= 15),
    },
    {
      title: { zh: "第四步：記住兩種特徵的分工", en: "Step 4: Remember the Division of Labor" },
      instruction: {
        zh: "到邊緣的距離（Distance to Edge）：細胞交界處變亮/凹陷，適合做裂縫、溝紋、鱗片間隙。\nN-球半徑（N-Sphere Radius）：每個細胞獨立一顆圓球，適合做藤壺、鵝卵石、疙瘩、鉚釘。兩者都接凹凸，但選錯特徵做出來的效果會完全不像預期，先想清楚「要連續的溝紋」還是「要分開的圓凸起」，再決定選哪個。",
        en: "Distance to Edge: brightens/recesses at cell boundaries — good for cracks, grooves, gaps between scales.\nN-Sphere Radius: one independent round bump per cell — good for barnacles, pebbles, warts, rivets. Both feed into Bump, but picking the wrong feature gives a result nothing like what you wanted — decide 'continuous grooves' vs. 'separate round bumps' first, then pick accordingly.",
      },
      check: (graph) => anyNodeParamMatches(graph, "texture_voronoi", "feature", (v) => v === "n_sphere_radius"),
    },
  ],
  quiz: [
    {
      question: {
        zh: "想用沃羅諾伊做出一顆顆分開、圓潤獨立的凸起（像藤壺、鵝卵石），接凹凸時該選哪個 Feature？",
        en: "To make Voronoi produce separate, rounded individual bumps (like barnacles or pebbles) driving Bump, which Feature should you pick?",
      },
      options: [
        { zh: "到邊緣的距離 Distance to Edge", en: "Distance to Edge" },
        { zh: "N-球半徑 N-Sphere Radius", en: "N-Sphere Radius" },
        { zh: "F1", en: "F1" },
        { zh: "F2", en: "F2" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "到邊緣的距離在細胞交界處數值最低，適合做裂縫/溝紋；N-球半徑是「這個細胞點本身能塞進去、不跟鄰居重疊的最大球半徑」，天生就是一顆顆獨立圓潤的凸起，兩者的幾何意義完全不同，選錯會做出完全相反的視覺效果。",
        en: "Distance to Edge is lowest right at cell boundaries, suiting cracks and grooves. N-Sphere Radius is 'the largest sphere that fits inside this cell without overlapping neighbors' — inherently a separate, rounded bump per cell. The two have entirely different geometric meanings, and picking the wrong one gives the opposite visual result.",
      },
    },
  ],
};
