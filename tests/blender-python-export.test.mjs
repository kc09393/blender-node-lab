import assert from "node:assert/strict";
import { graphToBlenderPython } from "../js/core/blenderPythonExport.js";

const graph = {
  nodes: [
    { id: "rgb", typeId: "input_rgb", x: 0, y: 0, params: { color: [0.2, 0.4, 0.8, 1] } },
    { id: "bsdf", typeId: "shader_principled_bsdf", x: 220, y: 0, params: { metallic: 0.75, roughness: 0.2, distribution: "multi_ggx" } },
    { id: "out", typeId: "output_material", x: 520, y: 0, params: {} },
  ],
  links: [
    { id: "l1", fromNode: "rgb", fromSocket: "color", toNode: "bsdf", toSocket: "baseColor" },
    { id: "l2", fromNode: "bsdf", fromSocket: "bsdf", toNode: "out", toSocket: "surface" },
  ],
};

const script = graphToBlenderPython(graph, { materialName: "Export Test" });
assert.match(script, /Blender 5\.2\.2 LTS/);
assert.match(script, /ShaderNodeBsdfPrincipled/);
assert.match(script, /ShaderNodeOutputMaterial/);
assert.match(script, /tree\.links\.new/);
assert.match(script, /MATERIAL_NAME = "Export Test"/);
assert.doesNotMatch(script, /undefined/);
console.log("Blender Python export test passed.");
