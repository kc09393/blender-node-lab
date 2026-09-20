import { readFile, writeFile } from "node:fs/promises";
import { listNodeTypes } from "../js/core/nodeRegistry.js";

const fixture = JSON.parse(await readFile(new URL("../tests/fixtures/blender-5.2.2-node-schema.json", import.meta.url), "utf8"));
const byId = new Map(fixture.nodes.map((node) => [node.blIdname, node]));
const overrides = {
  input_scene_time: "GeometryNodeInputSceneTime",
  input_geometry: "ShaderNodeNewGeometry",
  input_curves_info: "ShaderNodeHairInfo",
  shader_glossy_bsdf: "ShaderNodeBsdfAnisotropic",
  shader_sheen_bsdf: "ShaderNodeBsdfSheen",
};

const propertyOverrides = {
  shader_principled_bsdf: { distribution: "distribution", subsurfaceMethod: "subsurface_method" },
  shader_glossy_bsdf: { distribution: "distribution" },
  shader_glass_bsdf: { distribution: "distribution" },
  shader_subsurface_scattering: { method: "falloff" },
  shader_sheen_bsdf: { distribution: "distribution" },
  shader_refraction_bsdf: { distribution: "distribution" },
  texture_wave: { waveType: "wave_type", direction: "bands_direction", profile: "wave_profile" },
  texture_gradient: { type: "gradient_type" },
  texture_voronoi: { dimensions: "voronoi_dimensions", feature: "feature", distanceMetric: "distance" },
  texture_magic: { depth: "turbulence_depth" },
  color_mix: { mode: "blend_type", clampFactor: "clamp_factor", clampResult: "clamp_result" },
  vector_mapping: { mappingType: "vector_type" },
  vector_bump: { invert: "invert" },
  vector_math: { operation: "operation" },
  vector_rotate: { rotationType: "rotation_type" },
  vector_displacement_vec: { space: "space" },
  vector_transform: { from: "convert_from", to: "convert_to" },
  converter_math: { operation: "operation", clamp: "use_clamp" },
  converter_clamp: { clampType: "clamp_type" },
  converter_map_range: { interpolationType: "interpolation_type", clamp: "clamp" },
  converter_combine_color: { mode: "mode" },
  converter_separate_color: { mode: "mode" },
  texture_image: { extension: "extension", interpolation: "interpolation" },
};

function resolveOfficial(site) {
  if (overrides[site.id]) return byId.get(overrides[site.id]);
  const candidates = fixture.nodes.filter((node) => node.name === site.name.en && node.nameZhHant === site.name.zh);
  return candidates.length === 1 ? candidates[0] : null;
}

const socketOverrides = {
  "shader_principled_bsdf:inputs:emissionColor": "Emission Color",
  "shader_principled_bsdf:inputs:emissionStrength": "Emission Strength",
  "color_mix:inputs:fac": "Factor_Float",
  "color_mix:inputs:a": "A_Color",
  "color_mix:inputs:b": "B_Color",
  "color_mix:outputs:color": "Result_Color",
  "converter_map_range:outputs:value": "Result",
  "converter_clamp:outputs:value": "Result",
};

function compatibleType(siteType, officialType) {
  const expected = { Value: ["VALUE", "INT"], Color: ["RGBA"], Vector: ["VECTOR"], Shader: ["SHADER"], Boolean: ["BOOLEAN"] }[siteType];
  return !expected || expected.includes(officialType);
}

function socketMap(siteId, direction, siteSockets, officialSockets) {
  const seen = new Map();
  return Object.fromEntries(siteSockets.map((socket) => {
    const name = socket.label.en;
    const occurrence = seen.get(name) || 0;
    seen.set(name, occurrence + 1);
    const override = socketOverrides[`${siteId}:${direction}:${socket.key}`];
    let matches = override ? officialSockets.filter((candidate) => candidate.identifier === override) : [];
    if (!matches.length) matches = officialSockets.filter((candidate) => candidate.name === name || candidate.identifier?.toLowerCase() === socket.key.toLowerCase());
    if (!matches.length && (name === "Fac" || name === "Factor")) matches = officialSockets.filter((candidate) => candidate.identifier === "Fac" || candidate.name === "Factor");
    matches.sort((left, right) => Number(compatibleType(socket.type, right.type)) - Number(compatibleType(socket.type, left.type)) || Number(right.enabled) - Number(left.enabled));
    const official = matches[occurrence] || matches[0] || null;
    return [socket.key, official ? { name: official.name, identifier: official.identifier, index: official.index, occurrence } : null];
  }));
}

function settingMap(site, official) {
  const result = {};
  for (const setting of site.settings || []) {
    const propertyName = propertyOverrides[site.id]?.[setting.key];
    const property = propertyName ? official.properties?.[propertyName] : null;
    if (!property) {
      result[setting.key] = { special: true };
      continue;
    }
    const valueMap = {};
    for (const option of setting.options || []) {
      const officialOption = property.items?.find((item) => item.name === option.label.en || item.identifier?.toLowerCase() === String(option.value).toLowerCase());
      valueMap[option.value] = officialOption?.identifier ?? String(option.value).toUpperCase();
    }
    result[setting.key] = { property: propertyName, values: valueMap };
  }
  return result;
}

const exportMap = {};
for (const site of listNodeTypes()) {
  const official = resolveOfficial(site);
  if (!official) continue;
  exportMap[site.id] = {
    blIdname: official.blIdname,
    inputs: socketMap(site.id, "inputs", site.inputs, official.inputs),
    outputs: socketMap(site.id, "outputs", site.outputs, official.outputs),
    settings: settingMap(site, official),
  };
}

const output = `// Generated from Blender ${fixture.blenderVersion} (${fixture.blenderBuildHash}).\n// Run npm run generate:blender-map after updating the official schema fixture.\nexport const BLENDER_VERSION = ${JSON.stringify(fixture.blenderVersion)};\nexport const BLENDER_BUILD_HASH = ${JSON.stringify(fixture.blenderBuildHash)};\nexport default ${JSON.stringify(exportMap, null, 2)};\n`;
await writeFile(new URL("../data/blenderExportMap.js", import.meta.url), output, "utf8");
console.log(`Generated Blender export map for ${Object.keys(exportMap).length} node types.`);
