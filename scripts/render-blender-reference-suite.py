"""Render deterministic Blender 5.2.2 material references for regression review.

Run with:
  blender --background --python scripts/render-blender-reference-suite.py
"""
import bpy
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "tests" / "fixtures" / "blender-5.2.2-render-reference"
OUTPUT.mkdir(parents=True, exist_ok=True)


def socket(node, name):
    value = node.inputs.get(name)
    if value is None:
        raise RuntimeError(f"{node.bl_idname} is missing Blender 5.2.2 socket {name}")
    return value


def set_input(node, name, value):
    socket(node, name).default_value = value


def build_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 256
    scene.render.resolution_y = 256
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.world = bpy.data.worlds.new("Node Lab Reference World")
    scene.world.color = (0.025, 0.025, 0.025)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, location=(0, 0, 0))
    subject = bpy.context.object
    subject.name = "NodeLabReferenceSphere"
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_plane_add(size=18, location=(0, 0, -1.55))
    floor = bpy.context.object
    floor_mat = bpy.data.materials.new("Reference Floor")
    floor_mat.diffuse_color = (0.075, 0.085, 0.11, 1)
    floor.data.materials.append(floor_mat)

    bpy.ops.object.light_add(type="AREA", location=(3.5, -4.5, 5.5))
    key = bpy.context.object
    key.data.energy = 950
    key.data.shape = "DISK"
    key.data.size = 4.0
    key.rotation_euler = (math.radians(24), 0, math.radians(38))

    bpy.ops.object.light_add(type="AREA", location=(-4.0, 1.5, 2.0))
    fill = bpy.context.object
    fill.data.energy = 520
    fill.data.color = (0.35, 0.52, 1.0)
    fill.data.size = 3.0
    fill.rotation_euler = (math.radians(70), 0, math.radians(-120))

    bpy.ops.object.camera_add(location=(0, -6.5, 1.0))
    camera = bpy.context.object
    camera.data.lens = 52
    camera.rotation_euler = (math.radians(82), 0, 0)
    scene.camera = camera

    material = bpy.data.materials.new("Node Lab Reference")
    material.use_nodes = True
    subject.data.materials.append(material)
    return scene, material


def configure(material, case):
    tree = material.node_tree
    tree.nodes.clear()
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    principled = tree.nodes.new("ShaderNodeBsdfPrincipled")
    principled.location = (-260, 0)
    output.location = (120, 0)
    tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    set_input(principled, "Base Color", case.get("base_color", (0.42, 0.16, 0.055, 1)))
    set_input(principled, "Metallic", case.get("metallic", 0.0))
    set_input(principled, "Roughness", case.get("roughness", 0.35))
    set_input(principled, "IOR", case.get("ior", 1.5))
    set_input(principled, "Transmission Weight", case.get("transmission", 0.0))
    set_input(principled, "Subsurface Weight", case.get("subsurface", 0.0))
    set_input(principled, "Emission Color", case.get("emission_color", (1, 1, 1, 1)))
    set_input(principled, "Emission Strength", case.get("emission_strength", 0.0))
    set_input(principled, "Thin Wall", case.get("thin_wall", False))
    return principled


CASES = [
    {"id": "dielectric-roughness-015", "roughness": 0.15},
    {"id": "dielectric-roughness-080", "roughness": 0.80},
    {"id": "metal-roughness-015", "metallic": 1.0, "roughness": 0.15, "base_color": (0.32, 0.46, 0.72, 1)},
    {"id": "metal-roughness-080", "metallic": 1.0, "roughness": 0.80, "base_color": (0.32, 0.46, 0.72, 1)},
    {"id": "transmission-000", "transmission": 0.0, "roughness": 0.08},
    {"id": "transmission-100", "transmission": 1.0, "roughness": 0.08},
    {"id": "emission-strength-1", "base_color": (0.01, 0.01, 0.01, 1), "emission_color": (1.0, 0.08, 0.015, 1), "emission_strength": 1.0},
    {"id": "emission-strength-8", "base_color": (0.01, 0.01, 0.01, 1), "emission_color": (1.0, 0.08, 0.015, 1), "emission_strength": 8.0},
    {"id": "subsurface-000", "subsurface": 0.0, "roughness": 0.46, "base_color": (0.62, 0.12, 0.07, 1)},
    {"id": "subsurface-100", "subsurface": 1.0, "roughness": 0.46, "base_color": (0.62, 0.12, 0.07, 1)},
    {"id": "thin-wall-off", "transmission": 1.0, "thin_wall": False, "roughness": 0.12},
    {"id": "thin-wall-on", "transmission": 1.0, "thin_wall": True, "roughness": 0.12},
]

scene, material = build_scene()
results = []
for case in CASES:
    configure(material, case)
    path = OUTPUT / f"{case['id']}.png"
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    rendered_image = bpy.data.images.load(str(path), check_existing=False)
    pixels = list(rendered_image.pixels)
    rgb = [pixels[index] for index in range(len(pixels)) if index % 4 != 3]
    mean_rgb = [sum(pixels[channel::4]) / (len(pixels) // 4) for channel in range(3)]
    results.append({
        "id": case["id"],
        "file": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "meanRgb": [round(value, 7) for value in mean_rgb],
        "minRgb": round(min(rgb), 7),
        "maxRgb": round(max(rgb), 7),
        "parameters": {key: value for key, value in case.items() if key != "id"},
    })
    bpy.data.images.remove(rendered_image)

manifest = {
    "blenderVersion": bpy.app.version_string,
    "blenderBuildHash": bpy.app.build_hash.decode("ascii"),
    "engine": scene.render.engine,
    "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    "cases": results,
    "differencePairs": [
        ["dielectric-roughness-015", "dielectric-roughness-080"],
        ["metal-roughness-015", "metal-roughness-080"],
        ["transmission-000", "transmission-100"],
        ["emission-strength-1", "emission-strength-8"],
        ["thin-wall-off", "thin-wall-on"],
    ],
    "excludedPairs": [
        {
            "ids": ["subsurface-000", "subsurface-100"],
            "reason": "This fixed EEVEE sphere scene changes RGB by at most one 8-bit code value, so it is retained as a reference render but not counted as visible A/B evidence.",
        }
    ],
}
(OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"[Node Lab] Rendered {len(results)} Blender reference cases to {OUTPUT}")
