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
  loadSteps: () => import("./transmission_shaders_compared.steps.js").then((m) => m.default),
};
