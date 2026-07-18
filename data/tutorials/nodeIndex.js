// 節點 typeId -> 最適合的一篇引導教學 id 的對照表，給節點百科的「在教學中學習」按鈕用。
// 只收錄「這篇教學真的把該節點放進圖裡教」的情況——特意不收 supported:false 的節點
// （沙盒本來就不能即時預覽，教學也不會真的放這個節點），也不會為了湊滿而硬掰不存在的關聯。
// 一個節點只指一篇「最推薦」的教學（該節點目前最完整/最直接的教學），不是全部提過這個
// 節點的教學都列出來——跟 data/presets/categories.js 一樣，刻意獨立成一個檔案維護，
// 之後新增/調整教學時只要改這裡，不用去改教學本身或節點定義。
export default {
  // 著色器 Shader
  shader_principled_bsdf: "tutorial_principled_bsdf_tour",
  shader_glossy_bsdf: "tutorial_layer_weight_clearcoat",
  shader_emission: "tutorial_neon_sign",
  shader_transparent_bsdf: "tutorial_torn_holes",
  shader_mix_shader: "tutorial_add_shader_tour",
  shader_add_shader: "tutorial_add_shader_tour",
  shader_glass_bsdf: "tutorial_glass",
  shader_translucent_bsdf: "tutorial_transmission_shaders_compared",
  shader_subsurface_scattering: "tutorial_skin_sss",
  shader_sheen_bsdf: "tutorial_velvet_sheen",
  shader_refraction_bsdf: "tutorial_transmission_shaders_compared",

  // 紋理 Texture
  texture_noise: "tutorial_noise_texture_tour",
  texture_white_noise: "tutorial_white_noise",
  texture_checker: "tutorial_checker_texture_tour",
  texture_wave: "tutorial_wave_texture_tour",
  texture_gradient: "tutorial_gradient_texture",
  texture_voronoi: "tutorial_voronoi_distance_metrics",
  texture_magic: "tutorial_magic_texture",
  texture_brick: "tutorial_brick_texture_tour",
  texture_image: "tutorial_image_texture_tour",

  // 輸入 Input
  input_texture_coordinate: "tutorial_uv_mapping",
  input_uv_map: "tutorial_uv_mapping",
  input_fresnel: "tutorial_fresnel_tour",
  input_layer_weight: "tutorial_layer_weight_facing_vs_fresnel",
  input_wireframe: "tutorial_wireframe_fx",

  // 顏色 Color
  color_hsv: "tutorial_hsv_shift",
  color_invert: "tutorial_invert_color",
  color_bright_contrast: "tutorial_bright_contrast",
  color_gamma: "tutorial_gamma_correction",
  color_mix: "tutorial_mix_color_blend_modes_tour",
  color_rgb_curves: "tutorial_rgb_curves",

  // 向量 Vector
  vector_mapping: "tutorial_mapping_types_tour",
  vector_bump: "tutorial_bump_tour",
  vector_math: "tutorial_vector_math_tour",
  vector_rotate: "tutorial_vector_rotate",
  vector_normal_map: "tutorial_detail_baking_workflow",
  vector_displacement: "tutorial_displacement_terrain",
  vector_displacement_vec: "tutorial_detail_baking_workflow",
  vector_curves: "tutorial_vector_curves",
  vector_transform: "tutorial_vector_transform_spaces",
  vector_normal: "tutorial_normal_compare",

  // 轉換器 Converter
  converter_math: "tutorial_math_operations_tour",
  converter_color_ramp: "tutorial_color_ramp_tour",
  converter_clamp: "tutorial_clamp_node",
  converter_map_range: "tutorial_map_range_tour",
  converter_combine_xyz: "tutorial_xyz_split",
  converter_separate_xyz: "tutorial_xyz_split",
  converter_combine_color: "tutorial_hsv_channel_pack",
  converter_separate_color: "tutorial_hsv_channel_pack",
  converter_wavelength: "tutorial_wavelength_spectrum",
  converter_blackbody: "tutorial_blackbody_glow",
  converter_float_curve: "tutorial_float_curve",
};
