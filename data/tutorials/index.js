import glass from "./glass.js";
import metal from "./metal.js";
import wood from "./wood.js";
import mixCarpaint from "./mix_carpaint.js";
import mixSheer from "./mix_sheer.js";
import uvMapping from "./uv_mapping.js";
import stone from "./stone.js";
import brickWall from "./brick_wall.js";
import neonSign from "./neon_sign.js";
import mathRemap from "./math_remap.js";
import skinSss from "./skin_sss.js";
import velvetSheen from "./velvet_sheen.js";
import rustWeathering from "./rust_weathering.js";
import wireframeFx from "./wireframe_fx.js";
import floatCurve from "./float_curve.js";
import blackbodyGlow from "./blackbody_glow.js";
import displacementTerrain from "./displacement_terrain.js";
import hsvShift from "./hsv_shift.js";
import brightContrast from "./bright_contrast.js";
import layerWeightClearcoat from "./layer_weight_clearcoat.js";
import voronoiMosaic from "./voronoi_mosaic.js";
import vectorRotate from "./vector_rotate.js";
import xyzSplit from "./xyz_split.js";
import magicTexture from "./magic_texture.js";
import wavelengthSpectrum from "./wavelength_spectrum.js";
import normalCompare from "./normal_compare.js";
import vectorTransformSpaces from "./vector_transform_spaces.js";
import gradientTexture from "./gradient_texture.js";
import whiteNoise from "./white_noise.js";
import rgbCurves from "./rgb_curves.js";
import vectorCurves from "./vector_curves.js";
import clampNode from "./clamp_node.js";
import mixColorGrime from "./mix_color_grime.js";
import gammaCorrection from "./gamma_correction.js";
import invertColor from "./invert_color.js";
import layerStackBlend from "./layer_stack_blend.js";
import opalGemGradient from "./opal_gem_gradient.js";
import carPaintFlakes from "./car_paint_flakes.js";
import terrainHeightMap from "./terrain_height_map.js";
import stainedGlass from "./stained_glass.js";
import channelPacking from "./channel_packing.js";
import tornHoles from "./torn_holes.js";
import handbuiltClearcoat from "./handbuilt_clearcoat.js";
import compassMaterial from "./compass_material.js";
import detailBakingWorkflow from "./detail_baking_workflow.js";
import ridgedTerrain from "./ridged_terrain.js";
import hsvChannelPack from "./hsv_channel_pack.js";
import voronoiDistanceMetrics from "./voronoi_distance_metrics.js";
import principledBsdfTour from "./principled_bsdf_tour.js";
import colorRampTour from "./color_ramp_tour.js";
import imageTextureTour from "./image_texture_tour.js";
import mathOperationsTour from "./math_operations_tour.js";
import noiseTextureTour from "./noise_texture_tour.js";
import mappingTypesTour from "./mapping_types_tour.js";
import vectorMathTour from "./vector_math_tour.js";
import addShaderTour from "./add_shader_tour.js";
import bumpTour from "./bump_tour.js";
import checkerTextureTour from "./checker_texture_tour.js";
import mapRangeTour from "./map_range_tour.js";
import waveTextureTour from "./wave_texture_tour.js";
import fresnelTour from "./fresnel_tour.js";
import mixColorBlendModesTour from "./mix_color_blend_modes_tour.js";
import edgeWearMask from "./edge_wear_mask.js";
import layerWeightFacingVsFresnel from "./layer_weight_facing_vs_fresnel.js";
import candleWaxGlow from "./candle_wax_glow.js";
import frostedGlass from "./frosted_glass.js";
import puddleWetness from "./puddle_wetness.js";
import toonStyleBanding from "./toon_style_banding.js";
import brickTextureTour from "./brick_texture_tour.js";
import dualToneFabricColorway from "./dual_tone_fabric_colorway.js";
import transmissionShadersCompared from "./transmission_shaders_compared.js";
import bumpVsDisplacementCompared from "./bump_vs_displacement_compared.js";
import sssTextureDrivenColor from "./sss_texture_driven_color.js";
import maskStrengthScaling from "./mask_strength_scaling.js";
import voronoiNsphereBumpClusters from "./voronoi_nsphere_bump_clusters.js";
import checkerColorVsFac from "./checker_color_vs_fac.js";
import waveRingsMultiLook from "./wave_rings_multi_look.js";
import pbrMetalVsDielectric from "./pbr_metal_vs_dielectric.js";
import pbrRoughnessMicrofacets from "./pbr_roughness_microfacets.js";
import fresnelInvertCoreGlow from "./fresnel_invert_core_glow.js";
import anyFacAsBumpHeight from "./any_fac_as_bump_height.js";
import voronoiColorSubtleBlend from "./voronoi_color_subtle_blend.js";

export default [
  uvMapping,
  xyzSplit,
  glass,
  brightContrast,
  magicTexture,
  gradientTexture,
  neonSign,
  wireframeFx,
  mathRemap,
  clampNode,
  metal,
  wood,
  hsvShift,
  invertColor,
  mixCarpaint,
  mixSheer,
  stone,
  voronoiMosaic,
  whiteNoise,
  vectorRotate,
  brickWall,
  layerWeightClearcoat,
  gammaCorrection,
  floatCurve,
  rgbCurves,
  blackbodyGlow,
  wavelengthSpectrum,
  mixColorGrime,
  opalGemGradient,
  skinSss,
  velvetSheen,
  rustWeathering,
  normalCompare,
  vectorCurves,
  vectorTransformSpaces,
  layerStackBlend,
  terrainHeightMap,
  carPaintFlakes,
  stainedGlass,
  channelPacking,
  tornHoles,
  handbuiltClearcoat,
  compassMaterial,
  detailBakingWorkflow,
  displacementTerrain,
  ridgedTerrain,
  hsvChannelPack,
  voronoiDistanceMetrics,
  principledBsdfTour,
  colorRampTour,
  imageTextureTour,
  mathOperationsTour,
  noiseTextureTour,
  mappingTypesTour,
  vectorMathTour,
  addShaderTour,
  bumpTour,
  checkerTextureTour,
  mapRangeTour,
  waveTextureTour,
  fresnelTour,
  mixColorBlendModesTour,
  edgeWearMask,
  layerWeightFacingVsFresnel,
  candleWaxGlow,
  frostedGlass,
  puddleWetness,
  toonStyleBanding,
  brickTextureTour,
  dualToneFabricColorway,
  transmissionShadersCompared,
  bumpVsDisplacementCompared,
  sssTextureDrivenColor,
  maskStrengthScaling,
  voronoiNsphereBumpClusters,
  checkerColorVsFac,
  waveRingsMultiLook,
  pbrMetalVsDielectric,
  pbrRoughnessMicrofacets,
  fresnelInvertCoreGlow,
  anyFacAsBumpHeight,
  voronoiColorSubtleBlend,
];
