export default {
  id: "tutorial_toon_style_banding",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "風格化色階：用硬邊漸變仿卡通分色", en: "Stylized Banding: Faking Cel Shading with Hard-Edge Ramps" },
  description: {
    zh: "本沙盒的卡通 BSDF（Toon BSDF）跟 Shader to RGB 都因為需要『打光完成之後』才能介入而無法支援即時預覽（這兩個節點都需要先算出最終光影、才能把它硬分成幾個色階，但本沙盒的架構是先算好材質參數、再一次交給 Three.js 統一打光，順序反過來了）。這篇教一個不需要那兩個節點也能做到的替代做法：用菲涅爾（Fresnel）＋多停駐點的硬邊顏色漸變（Color Ramp，常量 Constant），做出「隨視角分色」的風格化色塊——不是真正依光照方向分色的卡通渲染，但一樣能做出手繪分色感的視覺效果，這篇會誠實說明兩者的差異在哪。",
    en: "This sandbox's Toon BSDF and Shader to RGB can't support live preview because they need to intervene *after* lighting is resolved (both require the final shading result before banding it into discrete steps — but this sandbox's architecture computes material parameters first, then hands everything to Three.js for lighting in one pass, the opposite order). This tutorial teaches a workaround that doesn't need either node: Fresnel plus a multi-stop hard-edge Color Ramp (Constant) to fake view-angle-based color banding. It's not true light-direction-based cel shading, but it gets a similar hand-painted, banded look — and this tutorial is upfront about exactly where the two differ.",
  },
  startGraph: {
    nodes: [
      { id: "t_tsb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_tsb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_tsb_l1", fromNode: "t_tsb_principled", fromSocket: "bsdf", toNode: "t_tsb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_tsb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      {
        id: "te_tsb_principled",
        typeId: "shader_principled_bsdf",
        x: 820,
        y: 100,
        params: { roughness: 0.9, metallic: 0 },
      },
      {
        id: "te_tsb_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          interpolation: "constant",
          stops: [
            { position: 0, color: [0.05, 0.1, 0.3, 1] },
            { position: 0.4, color: [0.25, 0.4, 0.75, 1] },
            { position: 0.8, color: [0.85, 0.9, 1, 1] },
          ],
        },
      },
      { id: "te_tsb_fresnel", typeId: "input_fresnel", x: 300, y: 100, params: { ior: 1.5 } },
    ],
    links: [
      { id: "te_tsb_l1", fromNode: "te_tsb_principled", fromSocket: "bsdf", toNode: "te_tsb_out", toSocket: "surface" },
      { id: "te_tsb_l2", fromNode: "te_tsb_ramp", fromSocket: "color", toNode: "te_tsb_principled", toSocket: "baseColor" },
      { id: "te_tsb_l3", fromNode: "te_tsb_fresnel", fromSocket: "fac", toNode: "te_tsb_ramp", toSocket: "fac" },
    ],
  },
  loadSteps: () => import("./toon_style_banding.steps.js").then((m) => m.default),
};
