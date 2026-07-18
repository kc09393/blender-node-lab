export default {
  id: "frog_skin",
  name: { zh: "青蛙皮膚", en: "Frog Skin" },
  description: {
    zh: "兩組獨立的沃羅諾伊紋理分工：一組算細胞距離接顏色漸變染出斑駁綠色調並餵給次表面散射；另一組的 N-球半徑特徵天生是圓潤顆粒狀，拿來驅動凹凸接到光澤層的法線，做出疙瘩狀反光。",
    en: "Two independent Voronoi textures split the work: one computes cell distance feeding a Color Ramp for the mottled green tone, piped into Subsurface Scattering; the other's N-Sphere Radius feature is naturally round and bumpy, driving Bump into the Glossy layer's normal for a warty, uneven sheen.",
  },
  graph: {
    nodes: [
      { id: "frog_out", typeId: "output_material", x: 1300, y: 220, params: {} },
      { id: "frog_texcoord", typeId: "input_texture_coordinate", x: -260, y: 160, params: {} },
      { id: "frog_mapping", typeId: "vector_mapping", x: 0, y: 160, params: { scale: [14, 14, 14] } },
      { id: "frog_voronoi_col", typeId: "texture_voronoi", x: 260, y: 60, params: { randomness: 0.6 } },
      {
        id: "frog_ramp",
        typeId: "converter_color_ramp",
        x: 540,
        y: 60,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.25, 0.08, 1] },
            { position: 0.5, color: [0.25, 0.55, 0.15, 1] },
            { position: 1, color: [0.55, 0.7, 0.15, 1] },
          ],
        },
      },
      { id: "frog_voronoi_bump", typeId: "texture_voronoi", x: 260, y: 380, params: { feature: "n_sphere_radius", randomness: 0.6 } },
      { id: "frog_bump", typeId: "vector_bump", x: 540, y: 380, params: { strength: 0.5 } },
      { id: "frog_sss", typeId: "shader_subsurface_scattering", x: 820, y: 60, params: { scale: 0.5, radius: [0.3, 0.5, 0.25] } },
      { id: "frog_glossy", typeId: "shader_glossy_bsdf", x: 820, y: 380, params: { color: [1, 1, 1, 1], roughness: 0.3 } },
      { id: "frog_mix", typeId: "shader_mix_shader", x: 1060, y: 220, params: { fac: 0.18 } },
    ],
    links: [
      { id: "frog_l1", fromNode: "frog_texcoord", fromSocket: "generated", toNode: "frog_mapping", toSocket: "vector" },
      { id: "frog_l2", fromNode: "frog_mapping", fromSocket: "vector", toNode: "frog_voronoi_col", toSocket: "vector" },
      { id: "frog_l3", fromNode: "frog_mapping", fromSocket: "vector", toNode: "frog_voronoi_bump", toSocket: "vector" },
      { id: "frog_l4", fromNode: "frog_voronoi_col", fromSocket: "distance", toNode: "frog_ramp", toSocket: "fac" },
      { id: "frog_l5", fromNode: "frog_ramp", fromSocket: "color", toNode: "frog_sss", toSocket: "color" },
      { id: "frog_l6", fromNode: "frog_voronoi_bump", fromSocket: "distance", toNode: "frog_bump", toSocket: "height" },
      { id: "frog_l7", fromNode: "frog_bump", fromSocket: "normal", toNode: "frog_glossy", toSocket: "normal" },
      { id: "frog_l8", fromNode: "frog_sss", fromSocket: "bsdf", toNode: "frog_mix", toSocket: "shader1" },
      { id: "frog_l9", fromNode: "frog_glossy", fromSocket: "bsdf", toNode: "frog_mix", toSocket: "shader2" },
      { id: "frog_l10", fromNode: "frog_mix", fromSocket: "bsdf", toNode: "frog_out", toSocket: "surface" },
    ],
  },
};
