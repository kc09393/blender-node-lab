export default {
  id: "dragon_scale_armor",
  name: { zh: "龍鱗盔甲", en: "Dragon Scale Armor" },
  description: {
    zh: "磚塊紋理的錯位方塊拿來當鱗片形狀，係數（Fac）一份資料三種用途：驅動顏色漸變染色、驅動凹凸做出鱗片浮雕，也經黑白轉換後控制縫隙處的發光強度。",
    en: "Brick Texture's offset blocks double as scale shapes; its Fac output drives three things: the Color Ramp tint, Bump for the raised scale relief, and (via RGB to BW) the Emission strength glowing in the seams.",
  },
  graph: {
    nodes: [
      { id: "dragon_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "dragon_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      {
        id: "dragon_brick",
        typeId: "texture_brick",
        x: 0,
        y: 100,
        params: { scale: 8, mortarSize: 0.05, brickWidth: 0.6, rowHeight: 0.35, offsetAmount: 0.5 },
      },
      {
        id: "dragon_ramp",
        typeId: "converter_color_ramp",
        x: 300,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.02, 0.02, 0.03, 1] },
            { position: 0.6, color: [0.1, 0.35, 0.28, 1] },
            { position: 1, color: [0.85, 0.65, 0.1, 1] },
          ],
        },
      },
      { id: "dragon_bw", typeId: "converter_rgb_to_bw", x: 560, y: 300, params: {} },
      { id: "dragon_metal", typeId: "shader_principled_bsdf", x: 560, y: 60, params: { roughness: 0.35, metallic: 0.8 } },
      { id: "dragon_emit", typeId: "shader_emission", x: 560, y: 460, params: { color: [1, 0.7, 0.1, 1], strength: 2 } },
      { id: "dragon_add", typeId: "shader_add_shader", x: 900, y: 260, params: {} },
      { id: "dragon_bump", typeId: "vector_bump", x: 300, y: 400, params: { strength: 0.7 } },
    ],
    links: [
      { id: "dragon_l1", fromNode: "dragon_texcoord", fromSocket: "generated", toNode: "dragon_brick", toSocket: "vector" },
      { id: "dragon_l2", fromNode: "dragon_brick", fromSocket: "fac", toNode: "dragon_ramp", toSocket: "fac" },
      { id: "dragon_l3", fromNode: "dragon_ramp", fromSocket: "color", toNode: "dragon_metal", toSocket: "baseColor" },
      { id: "dragon_l4", fromNode: "dragon_ramp", fromSocket: "color", toNode: "dragon_bw", toSocket: "color" },
      { id: "dragon_l5", fromNode: "dragon_bw", fromSocket: "value", toNode: "dragon_emit", toSocket: "strength" },
      { id: "dragon_l6", fromNode: "dragon_brick", fromSocket: "fac", toNode: "dragon_bump", toSocket: "height" },
      { id: "dragon_l7", fromNode: "dragon_bump", fromSocket: "normal", toNode: "dragon_metal", toSocket: "normal" },
      { id: "dragon_l8", fromNode: "dragon_metal", fromSocket: "bsdf", toNode: "dragon_add", toSocket: "shader1" },
      { id: "dragon_l9", fromNode: "dragon_emit", fromSocket: "bsdf", toNode: "dragon_add", toSocket: "shader2" },
      { id: "dragon_l10", fromNode: "dragon_add", fromSocket: "bsdf", toNode: "dragon_out", toSocket: "surface" },
    ],
  },
};
