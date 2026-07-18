export default {
  id: "coral_reef",
  name: { zh: "珊瑚礁", en: "Coral Reef" },
  description: {
    zh: "沃羅諾伊的 N-球半徑特徵做出圓潤的珊瑚顆粒感，接顏色漸變染色後餵給次表面散射，讓珊瑚呈現微微透光的活體質感。",
    en: "Voronoi's N-Sphere Radius feature gives a rounded, coral-like grain; the resulting Color Ramp feeds Subsurface Scattering for coral's subtly translucent, living-tissue look.",
  },
  graph: {
    nodes: [
      { id: "coral_out", typeId: "output_material", x: 1200, y: 200, params: {} },
      { id: "coral_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "coral_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [6, 6, 6] } },
      { id: "coral_voronoi", typeId: "texture_voronoi", x: 260, y: 100, params: { feature: "n_sphere_radius", randomness: 1 } },
      {
        id: "coral_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.95, 0.55, 0.35, 1] },
            { position: 0.5, color: [0.98, 0.75, 0.55, 1] },
            { position: 1, color: [1, 0.9, 0.75, 1] },
          ],
        },
      },
      { id: "coral_sss", typeId: "shader_subsurface_scattering", x: 860, y: 60, params: { scale: 0.6, radius: [1, 0.4, 0.2] } },
      { id: "coral_glossy", typeId: "shader_glossy_bsdf", x: 860, y: 300, params: { color: [1, 1, 1, 1], roughness: 0.2 } },
      { id: "coral_mix", typeId: "shader_mix_shader", x: 1000, y: 180, params: { fac: 0.15 } },
    ],
    links: [
      { id: "coral_l1", fromNode: "coral_texcoord", fromSocket: "generated", toNode: "coral_mapping", toSocket: "vector" },
      { id: "coral_l2", fromNode: "coral_mapping", fromSocket: "vector", toNode: "coral_voronoi", toSocket: "vector" },
      { id: "coral_l3", fromNode: "coral_voronoi", fromSocket: "distance", toNode: "coral_ramp", toSocket: "fac" },
      { id: "coral_l4", fromNode: "coral_ramp", fromSocket: "color", toNode: "coral_sss", toSocket: "color" },
      { id: "coral_l5", fromNode: "coral_sss", fromSocket: "bsdf", toNode: "coral_mix", toSocket: "shader1" },
      { id: "coral_l6", fromNode: "coral_glossy", fromSocket: "bsdf", toNode: "coral_mix", toSocket: "shader2" },
      { id: "coral_l7", fromNode: "coral_mix", fromSocket: "bsdf", toNode: "coral_out", toSocket: "surface" },
    ],
  },
};
