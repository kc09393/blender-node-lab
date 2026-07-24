export default {
  id: "tutorial_rgb_curves",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "RGB 曲線：像 Photoshop 一樣調色調", en: "RGB Curves: Tone-Mapping Like Photoshop" },
  description: {
    zh: "RGB 曲線（RGB Curves）節點可以直接對一張顏色的明暗對應關係拖出一條自訂曲線——比亮度/對比度更自由，可以只拉暗部或只拉亮部，概念上跟 Photoshop 的曲線工具完全一樣。",
    en: "The RGB Curves node lets you drag out a custom tone-mapping curve for a color — more flexible than Brightness/Contrast, letting you pull just the shadows or just the highlights. The exact same concept as Photoshop's Curves tool.",
  },
  startGraph: {
    nodes: [
      { id: "t_rc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_rc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_rc_l1", fromNode: "t_rc_principled", fromSocket: "bsdf", toNode: "t_rc_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_rc_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_rc_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
      {
        id: "te_rc_curves",
        typeId: "color_rgb_curves",
        x: 300,
        y: 100,
        params: { fac: 1, color: [0.6, 0.6, 0.6, 1], points: [{ x: 0, y: 0 }, { x: 0.5, y: 0.75 }, { x: 1, y: 1 }] },
      },
    ],
    links: [
      { id: "te_rc_l1", fromNode: "te_rc_principled", fromSocket: "bsdf", toNode: "te_rc_out", toSocket: "surface" },
      { id: "te_rc_l2", fromNode: "te_rc_curves", fromSocket: "color", toNode: "te_rc_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./rgb_curves.steps.js").then((m) => m.default),
};
