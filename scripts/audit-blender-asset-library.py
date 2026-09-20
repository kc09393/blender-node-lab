"""Open the generated .blend and verify every material is a usable asset."""
import bpy
from pathlib import Path

root = Path(__file__).resolve().parents[1]
library = root / "downloads" / "blender-node-lab-material-library-5.2.2.blend"
bpy.ops.wm.open_mainfile(filepath=str(library))
assets = [material for material in bpy.data.materials if material.asset_data is not None]
errors = []
if len(assets) != 90:
    errors.append(f"expected 90 material assets, got {len(assets)}")
for material in assets:
    tree = material.node_tree
    if tree is None:
        errors.append(f"{material.name}: missing node tree")
        continue
    if not any(node.bl_idname == "ShaderNodeOutputMaterial" for node in tree.nodes):
        errors.append(f"{material.name}: missing Material Output")
    if not tree.links:
        errors.append(f"{material.name}: node tree has no links")
if errors:
    raise RuntimeError("Blender asset library audit failed:\n- " + "\n- ".join(errors))
print(f"[Node Lab] Asset library audit passed: {len(assets)} materials, all marked as assets with linked node trees")
