export default {
  id: "tutorial_pbr_metal_vs_dielectric",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "為什麼金屬的反光有顏色，塑膠的沒有", en: "Why Metal Reflections Are Colored, But Plastic's Aren't" },
  description: {
    zh: "這篇不是教你「金屬度（Metallic）這個滑桿是幹嘛的」——那個很多教學都提過。這篇要講的是背後的物理原因：為什麼把同一個底色（Base Color）分別套在塑膠跟金屬上，塑膠的反光永遠是白的，金屬的反光卻是有色的。理解這個，你才會知道 Metallic 幾乎不該填 0.5 這種中間值，它其實是在切換兩種完全不同的反光模型，不是「調多金屬」的連續刻度。",
    en: "This isn't 'here's what the Metallic slider does' — plenty of tutorials cover that already. This one explains the physics behind it: why the same Base Color produces a plastic with a white highlight, but a metal with a colored one. Understanding this tells you Metallic almost never belongs at 0.5 — it's switching between two fundamentally different reflection models, not a continuous 'how metal-like' dial.",
  },
  startGraph: {
    nodes: [
      { id: "t_pmd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_pmd_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_pmd_l1", fromNode: "t_pmd_principled", fromSocket: "bsdf", toNode: "t_pmd_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_pmd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "te_pmd_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.1, 0.3, 0.9, 1], roughness: 0.15, metallic: 1 },
      },
    ],
    links: [{ id: "te_pmd_l1", fromNode: "te_pmd_principled", fromSocket: "bsdf", toNode: "te_pmd_out", toSocket: "surface" }],
  },
  loadSteps: () => import("./pbr_metal_vs_dielectric.steps.js").then((m) => m.default),
};
