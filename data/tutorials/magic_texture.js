export default {
  id: "tutorial_magic_texture",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "迷幻紋理：抽象花紋產生器", en: "Magic Texture: Abstract Pattern Generator" },
  description: {
    zh: "迷幻紋理（Magic Texture）沒有對應的真實世界材質，純粹是好玩的抽象花紋產生器，很適合拿來做特效或風格化的材質。",
    en: "Magic Texture has no real-world material equivalent — it's a fun generator for abstract, kaleidoscope-like patterns, great for effects or stylized materials.",
  },
  startGraph: {
    nodes: [
      { id: "t_mg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_mg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_mg_l1", fromNode: "t_mg_principled", fromSocket: "bsdf", toNode: "t_mg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_mg_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "te_mg_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: { roughness: 0.3 } },
      { id: "te_mg_magic", typeId: "texture_magic", x: 300, y: 100, params: { distortion: 4 } },
    ],
    links: [
      { id: "te_mg_l1", fromNode: "te_mg_principled", fromSocket: "bsdf", toNode: "te_mg_out", toSocket: "surface" },
      { id: "te_mg_l2", fromNode: "te_mg_magic", fromSocket: "color", toNode: "te_mg_principled", toSocket: "baseColor" },
    ],
  },
  loadSteps: () => import("./magic_texture.steps.js").then((m) => m.default),
};
