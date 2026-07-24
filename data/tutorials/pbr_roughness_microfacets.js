export default {
  id: "tutorial_pbr_roughness_microfacets",
  level: { zh: "中階", en: "Intermediate" },
  name: {
    zh: "為什麼粗糙度會讓反光暈開，而不是把顏色調暗",
    en: "Why Roughness Spreads Out Highlights Instead of Just Dimming Them",
  },
  description: {
    zh: "這篇不是教「粗糙度（Roughness）滑桿越大表面越霧」——那個滑一下就看出來了。這篇要講的是背後的原因：表面其實是由無數個微小的鏡面（微表面，microfacet）組成，粗糙度調的是這些鏡面朝向有多分散，不是直接調亮度。搞懂這個，你才會知道「金屬看起來很塑膠感」十之八九是粗糙度沒調對，不是底色錯了。",
    en: "This isn't 'turn up Roughness and the surface looks foggier' — a single drag shows you that. This one explains why: a surface is made of countless tiny mirror-like facets (microfacets), and Roughness controls how scattered their tilt is — it doesn't directly dim anything. Understand this and you'll know that a metal 'looking plastic-y' is almost always a roughness problem, not a base color problem.",
  },
  startGraph: {
    nodes: [
      { id: "t_prm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_prm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_prm_l1", fromNode: "t_prm_principled", fromSocket: "bsdf", toNode: "t_prm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_prm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "te_prm_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.85, 0.15, 0.1, 1], roughness: 0.85, metallic: 1 },
      },
    ],
    links: [{ id: "te_prm_l1", fromNode: "te_prm_principled", fromSocket: "bsdf", toNode: "te_prm_out", toSocket: "surface" }],
  },
  loadSteps: () => import("./pbr_roughness_microfacets.steps.js").then((m) => m.default),
};
