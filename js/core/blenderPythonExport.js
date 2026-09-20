import blenderExportMap, { BLENDER_BUILD_HASH, BLENDER_VERSION } from "../../data/blenderExportMap.js";

function pythonJson(value) {
  return JSON.stringify(JSON.stringify(value));
}

/**
 * Export the browser graph as a self-contained Blender Python script.
 * Blender owns the final node construction: unsupported assignments are kept as
 * warnings in the Text Editor/console instead of silently producing a different graph.
 */
export function graphToBlenderPython(graph, { materialName = "Node Lab Material" } = {}) {
  const graphData = typeof graph?.toJSON === "function" ? graph.toJSON() : graph;
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links)) {
    throw new TypeError("A valid material graph is required.");
  }
  const usedMap = Object.fromEntries(
    [...new Set(graphData.nodes.map((node) => node.typeId))]
      .filter((typeId) => blenderExportMap[typeId])
      .map((typeId) => [typeId, blenderExportMap[typeId]]),
  );
  const safeMaterialName = String(materialName || "Node Lab Material").slice(0, 120);
  return `# Blender Material Node Lab export
# Schema: Blender ${BLENDER_VERSION}, build ${BLENDER_BUILD_HASH}
# Paste into Blender's Scripting workspace and press Run Script.
# The script rebuilds nodes, socket values, supported settings, positions and links.
import bpy
import json

GRAPH = json.loads(${pythonJson(graphData)})
EXPORT_MAP = json.loads(${pythonJson(usedMap)})
MATERIAL_NAME = ${JSON.stringify(safeMaterialName)}
warnings = []

def warn(message):
    warnings.append(message)
    print("[Node Lab] " + message)

def find_socket(sockets, spec):
    if not spec:
        return None
    identifier = spec.get("identifier")
    if identifier:
        for socket in sockets:
            if getattr(socket, "identifier", None) == identifier:
                return socket
    name = spec.get("name")
    occurrence = int(spec.get("occurrence", 0))
    matches = [socket for socket in sockets if socket.name == name]
    if occurrence < len(matches):
        return matches[occurrence]
    return matches[0] if matches else None

def assign_default(socket, value, label):
    if socket is None or not hasattr(socket, "default_value"):
        warn(f"Cannot assign {label}: socket not found or has no default value")
        return
    try:
        current = socket.default_value
        if hasattr(current, "__len__") and not isinstance(current, str) and isinstance(value, list):
            size = len(current)
            socket.default_value = tuple(value[:size])
        else:
            socket.default_value = value
    except Exception as exc:
        warn(f"Cannot assign {label}: {exc}")

def reset_curve(curve, points):
    if not isinstance(points, list) or len(points) < 2:
        return
    while len(curve.points) > 2:
        curve.points.remove(curve.points[-1])
    curve.points[0].location = tuple(points[0][:2])
    curve.points[-1].location = tuple(points[-1][:2])
    for point in points[1:-1]:
        curve.points.new(float(point[0]), float(point[1]))

def apply_special(node, type_id, key, value):
    try:
        if type_id in {"input_rgb", "input_value"} and key in {"color", "value"}:
            assign_default(node.outputs[0], value, f"{type_id}.{key}")
            return True
        if type_id == "converter_color_ramp":
            ramp = node.color_ramp
            if key == "colorMode": ramp.color_mode = str(value).upper(); return True
            if key == "hueInterp":
                ramp.hue_interpolation = {"near":"NEAR", "far":"FAR", "ccw":"CCW", "cw":"CW"}.get(value, str(value).upper()); return True
            if key == "interpolation": ramp.interpolation = str(value).upper(); return True
            if key == "stops" and isinstance(value, list) and len(value) >= 2:
                while len(ramp.elements) > 2: ramp.elements.remove(ramp.elements[-1])
                ordered = sorted(value, key=lambda item: item.get("position", 0))
                ramp.elements[0].position = float(ordered[0]["position"])
                ramp.elements[0].color = tuple(ordered[0]["color"][:4])
                ramp.elements[-1].position = float(ordered[-1]["position"])
                ramp.elements[-1].color = tuple(ordered[-1]["color"][:4])
                for item in ordered[1:-1]:
                    element = ramp.elements.new(float(item["position"]))
                    element.color = tuple(item["color"][:4])
                return True
        if type_id == "color_rgb_curves" and key in {"points", "pointsR", "pointsG", "pointsB"}:
            reset_curve(node.mapping.curves[{"pointsR":0, "pointsG":1, "pointsB":2, "points":3}[key]], value)
            node.mapping.update(); return True
        if type_id == "vector_curves" and key in {"points", "pointsY", "pointsZ"}:
            reset_curve(node.mapping.curves[{"points":0, "pointsY":1, "pointsZ":2}[key]], value)
            node.mapping.update(); return True
        if type_id == "converter_float_curve" and key == "points":
            reset_curve(node.mapping.curves[0], value); node.mapping.update(); return True
        if type_id == "texture_image" and key in {"src", "colorSpace"}:
            warn(f"{type_id}.{key} needs the original image file and was not embedded")
            return True
        if type_id == "vector_normal_map" and key == "convention":
            if value == "directx": warn("DirectX Normal convention needs a green-channel inversion before the Blender Normal Map node")
            return True
        if type_id == "texture_noise" and key == "noiseType":
            if value != "fbm": warn(f"Noise type {value} has no one-node Blender 5.2 equivalent; exported as native Noise Texture")
            return True
    except Exception as exc:
        warn(f"Cannot apply special setting {type_id}.{key}: {exc}")
        return True
    return False

material = bpy.data.materials.get(MATERIAL_NAME) or bpy.data.materials.new(MATERIAL_NAME)
material.use_nodes = True
tree = material.node_tree
tree.nodes.clear()
created = {}

for item in GRAPH["nodes"]:
    type_id = item.get("typeId")
    spec = EXPORT_MAP.get(type_id)
    if not spec:
        warn(f"Node {type_id} is not available in the Blender ${BLENDER_VERSION} export map")
        continue
    try:
        node = tree.nodes.new(spec["blIdname"])
    except Exception as exc:
        warn(f"Cannot create {type_id} ({spec['blIdname']}): {exc}")
        continue
    node.name = "NodeLab_" + item["id"]
    node.label = type_id
    node.location = (float(item.get("x", 0)), -float(item.get("y", 0)))
    if type_id == "color_mix":
        node.data_type = "RGBA"
    created[item["id"]] = node
    params = item.get("params") or {}
    for key, value in params.items():
        input_spec = spec.get("inputs", {}).get(key)
        if input_spec:
            assign_default(find_socket(node.inputs, input_spec), value, f"{type_id}.{key}")
            continue
        setting_spec = spec.get("settings", {}).get(key)
        if not setting_spec:
            continue
        if setting_spec.get("special") or apply_special(node, type_id, key, value):
            continue
        prop = setting_spec.get("property")
        converted = setting_spec.get("values", {}).get(str(value), value)
        try:
            setattr(node, prop, converted)
        except Exception as exc:
            warn(f"Cannot set {type_id}.{prop}={converted}: {exc}")

for item in GRAPH["links"]:
    from_node = created.get(item.get("fromNode"))
    to_node = created.get(item.get("toNode"))
    if not from_node or not to_node:
        continue
    from_item = next((n for n in GRAPH["nodes"] if n["id"] == item["fromNode"]), None)
    to_item = next((n for n in GRAPH["nodes"] if n["id"] == item["toNode"]), None)
    from_spec = EXPORT_MAP.get(from_item["typeId"], {}).get("outputs", {}).get(item.get("fromSocket")) if from_item else None
    to_spec = EXPORT_MAP.get(to_item["typeId"], {}).get("inputs", {}).get(item.get("toSocket")) if to_item else None
    output_socket = find_socket(from_node.outputs, from_spec)
    input_socket = find_socket(to_node.inputs, to_spec)
    if not output_socket or not input_socket:
        warn(f"Skipped link {item.get('id')}: socket mapping not found")
        continue
    try:
        tree.links.new(output_socket, input_socket)
    except Exception as exc:
        warn(f"Cannot create link {item.get('id')}: {exc}")

if bpy.context.object and hasattr(bpy.context.object.data, "materials"):
    slots = bpy.context.object.data.materials
    if len(slots): slots[0] = material
    else: slots.append(material)

print(f"[Node Lab] Created material '{material.name}' with {len(created)} nodes and {len(tree.links)} links")
if warnings:
    print(f"[Node Lab] Completed with {len(warnings)} warning(s); review the messages above")
`;
}

export function downloadBlenderPython(graph, options = {}) {
  const script = graphToBlenderPython(graph, options);
  const blob = new Blob([script], { type: "text/x-python;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "blender-node-lab-material.py";
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
