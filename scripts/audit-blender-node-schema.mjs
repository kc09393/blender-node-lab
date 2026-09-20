import fs from "node:fs";
import { listNodeTypes } from "../js/core/nodeRegistry.js";

const fixtureUrl = new URL("../tests/fixtures/blender-5.2.2-node-schema.json", import.meta.url);
const baseline = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const officialById = new Map(baseline.nodes.map((node) => [node.blIdname, node]));
const siteNodes = listNodeTypes();
const errors = [];

function fail(message) {
  errors.push(message);
}

function equal(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

if (baseline.blenderVersion !== "5.2.2 LTS") fail(`Fixture version must be Blender 5.2.2 LTS, got ${baseline.blenderVersion}`);
if (baseline.blenderBuildHash !== "d13f752e3b9c") fail(`Unexpected Blender build hash: ${baseline.blenderBuildHash}`);
if (baseline.nodeCount !== baseline.nodes.length || baseline.nodeCount < 100) fail("Official Blender fixture is incomplete.");

const idOverrides = {
  input_scene_time: "GeometryNodeInputSceneTime",
  input_geometry: "ShaderNodeNewGeometry",
  input_curves_info: "ShaderNodeHairInfo",
  shader_glossy_bsdf: "ShaderNodeBsdfAnisotropic",
  shader_sheen_bsdf: "ShaderNodeBsdfSheen",
};
const retiredIn52 = new Set(["texture_point_density"]);
const resolved = new Map();

for (const site of siteNodes) {
  if (retiredIn52.has(site.id)) continue;
  let official = idOverrides[site.id] ? officialById.get(idOverrides[site.id]) : null;
  if (!official) {
    const candidates = baseline.nodes.filter((node) => node.name === site.name.en && node.nameZhHant === site.name.zh);
    if (candidates.length === 1) official = candidates[0];
  }
  if (!official) {
    fail(`${site.id}: no unique Blender 5.2.2 node mapping for ${site.name.zh} / ${site.name.en}`);
    continue;
  }
  resolved.set(site.id, official);
  equal(site.name.en, official.name, `${site.id} English name`);
  equal(site.name.zh, official.nameZhHant, `${site.id} Traditional Chinese name`);
}

function socketNames(sockets) {
  return sockets.map((socket) => socket.label.en);
}

function officialSocketNames(siteId, direction, { enabledOnly = false, omit = [] } = {}) {
  const official = resolved.get(siteId);
  if (!official) return [];
  return official[direction]
    .filter((socket) => (!enabledOnly || socket.enabled) && !omit.includes(socket.name))
    .map((socket) => socket.name);
}

const exactContracts = [
  ["input_scene_time", "outputs", {}],
  ["input_fresnel", "inputs", {}],
  ["input_fresnel", "outputs", {}],
  ["input_layer_weight", "inputs", {}],
  ["input_layer_weight", "outputs", {}],
  ["input_wireframe", "inputs", {}],
  ["input_wireframe", "outputs", {}],
  ["output_material", "inputs", {}],
  ["shader_principled_bsdf", "outputs", {}],
  ["shader_glossy_bsdf", "inputs", { enabledOnly: true }],
  ["shader_glossy_bsdf", "outputs", {}],
  ["shader_emission", "inputs", { enabledOnly: true }],
  ["shader_emission", "outputs", {}],
  ["shader_mix_shader", "inputs", {}],
  ["shader_mix_shader", "outputs", {}],
  ["shader_glass_bsdf", "inputs", { enabledOnly: true }],
  ["shader_glass_bsdf", "outputs", {}],
  ["shader_subsurface_scattering", "inputs", { enabledOnly: true }],
  ["shader_subsurface_scattering", "outputs", {}],
  ["shader_sheen_bsdf", "inputs", { enabledOnly: true }],
  ["shader_sheen_bsdf", "outputs", {}],
  ["shader_refraction_bsdf", "inputs", { enabledOnly: true }],
  ["shader_refraction_bsdf", "outputs", {}],
  ["texture_voronoi", "inputs", {}],
  ["texture_voronoi", "outputs", {}],
  ["texture_magic", "inputs", {}],
  ["texture_magic", "outputs", {}],
  ["vector_bump", "inputs", {}],
  ["vector_bump", "outputs", {}],
  ["vector_displacement_vec", "inputs", {}],
  ["vector_displacement_vec", "outputs", {}],
];

for (const [siteId, direction, options] of exactContracts) {
  const site = siteNodes.find((node) => node.id === siteId);
  equal(socketNames(site[direction]), officialSocketNames(siteId, direction, options), `${siteId} ${direction}`);
}

const principled = siteNodes.find((node) => node.id === "shader_principled_bsdf");
const principledOfficialKeys = resolved.get("shader_principled_bsdf").inputs
  .filter((socket) => socket.enabled)
  .map((socket) => socket.name
    .replace(/\bIOR\b/g, "Ior")
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toLowerCase()))
  .map((key) => key === "anisotropic" ? "anisotropy" : key === "anisotropicRotation" ? "anisotropyRotation" : key);
equal(principled.inputs.map((input) => input.key), principledOfficialKeys, "shader_principled_bsdf grouped input keys");

const mix = siteNodes.find((node) => node.id === "color_mix");
equal(socketNames(mix.inputs), ["Factor", "A", "B"], "color_mix color-mode inputs");
equal(socketNames(mix.outputs), ["Color"], "color_mix color-mode output");

function inputDefault(siteId, key) {
  return siteNodes.find((node) => node.id === siteId).inputs.find((input) => input.key === key)?.default;
}

const criticalDefaults = [
  ["input_fresnel", "ior", 1.5],
  ["shader_principled_bsdf", "subsurfaceScale", 0.005],
  ["shader_principled_bsdf", "emissionColor", [1, 1, 1, 1]],
  ["shader_principled_bsdf", "tangent", [0, 0, 0]],
  ["shader_glossy_bsdf", "roughness", 0.5],
  ["shader_glass_bsdf", "ior", 1.5],
  ["shader_subsurface_scattering", "scale", 0.005],
  ["shader_subsurface_scattering", "radius", [1, 0.2, 0.1]],
  ["texture_magic", "distortion", 1],
  ["texture_voronoi", "detail", 0],
  ["texture_voronoi", "smoothness", 1],
  ["vector_bump", "distance", 0.001],
  ["vector_bump", "filterWidth", 0.1],
  ["vector_bump", "height", 1],
  ["vector_displacement_vec", "midlevel", 0],
  ["vector_displacement_vec", "scale", 0.01],
  ["color_mix", "fac", 1],
];
for (const [siteId, key, expected] of criticalDefaults) {
  equal(inputDefault(siteId, key), expected, `${siteId}.${key} default`);
}

function settingOptions(siteId, key) {
  const setting = siteNodes.find((node) => node.id === siteId).settings?.find((entry) => entry.key === key);
  return setting?.options?.map((option) => option.label.en) || [];
}

function officialPropertyOptions(siteId, property) {
  return resolved.get(siteId)?.properties?.[property]?.items?.map((item) => item.name) || [];
}

const optionContracts = [
  ["shader_principled_bsdf", "distribution", "distribution"],
  ["shader_principled_bsdf", "subsurfaceMethod", "subsurface_method"],
  ["shader_glossy_bsdf", "distribution", "distribution"],
  ["shader_glass_bsdf", "distribution", "distribution"],
  ["shader_subsurface_scattering", "method", "falloff"],
  ["shader_sheen_bsdf", "distribution", "distribution"],
  ["shader_refraction_bsdf", "distribution", "distribution"],
  ["texture_voronoi", "dimensions", "voronoi_dimensions"],
  ["texture_voronoi", "distanceMetric", "distance"],
  ["texture_voronoi", "feature", "feature"],
  ["vector_displacement_vec", "space", "space"],
];
for (const [siteId, siteKey, officialKey] of optionContracts) {
  equal(settingOptions(siteId, siteKey), officialPropertyOptions(siteId, officialKey), `${siteId}.${siteKey} options`);
}

const officialMixModes = officialPropertyOptions("color_mix", "blend_type");
equal(settingOptions("color_mix", "mode"), officialMixModes, "color_mix.mode options");

if (errors.length) {
  console.error(`Blender schema audit failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Blender schema audit passed: ${resolved.size}/${siteNodes.length} nodes mapped to official Blender ${baseline.blenderVersion}; ${retiredIn52.size} legacy node documented.`);
console.log(`Verified ${exactContracts.length} critical socket contracts, ${criticalDefaults.length} defaults, and ${optionContracts.length + 1} option lists.`);
