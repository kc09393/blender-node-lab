"""Export Blender's live shader-node schema for version-accurate website audits.

Usage:
  blender --background --factory-startup --python scripts/export-blender-node-schema.py -- output.json
"""

import json
import gettext
import os
import sys

import bpy


def load_zh_hant_translations():
    version_dir = f"{bpy.app.version[0]}.{bpy.app.version[1]}"
    mo_path = os.path.join(
        os.path.dirname(bpy.app.binary_path),
        version_dir,
        "datafiles",
        "locale",
        "zh_HANT",
        "LC_MESSAGES",
        "blender.mo",
    )
    try:
        with open(mo_path, "rb") as handle:
            return gettext.GNUTranslations(handle)
    except OSError:
        return gettext.NullTranslations()


ZH_HANT = load_zh_hant_translations()


def serial(value):
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    try:
        return [serial(item) for item in value]
    except TypeError:
        return str(value)


def translated(text):
    return ZH_HANT.gettext(text) if text else text


def socket_schema(socket, index):
    default = None
    if hasattr(socket, "default_value"):
        try:
            default = serial(socket.default_value)
        except Exception:
            default = None
    result = {
        "index": index,
        "identifier": socket.identifier,
        "name": socket.name,
        "nameZhHant": translated(socket.name),
        "type": socket.type,
        "blIdname": socket.bl_idname,
        "enabled": bool(socket.enabled),
        "hide": bool(socket.hide),
        "hideValue": bool(socket.hide_value),
        "default": default,
    }
    for key in ("min_value", "max_value"):
        if hasattr(socket, key):
            try:
                result[key] = serial(getattr(socket, key))
            except Exception:
                pass
    return result


def property_schema(node):
    generic = set(bpy.types.Node.bl_rna.properties.keys()) | {
        "rna_type",
        "type",
        "dimensions",
        "inputs",
        "outputs",
        "internal_links",
    }
    result = {}
    for prop in node.bl_rna.properties:
        if prop.identifier in generic or prop.is_readonly or prop.type not in {"ENUM", "BOOLEAN", "INT", "FLOAT"}:
            continue
        try:
            current = getattr(node, prop.identifier)
            items = []
            if prop.type == "ENUM":
                items = [
                    {
                        "identifier": item.identifier,
                        "name": item.name,
                        "nameZhHant": translated(item.name),
                    }
                    for item in prop.enum_items
                ]
        except Exception:
            continue
        result[prop.identifier] = {
            "name": prop.name,
            "nameZhHant": translated(prop.name),
            "default": serial(current),
            "type": prop.type,
        }
        if items:
            result[prop.identifier]["items"] = items
    return result


def main(output_path):
    preferences = bpy.context.preferences.view
    try:
        preferences.language = "zh_HANT"
        preferences.use_translate_interface = True
        preferences.use_translate_tooltips = True
    except Exception:
        pass

    material = bpy.data.materials.new("BML_SCHEMA_AUDIT")
    material.use_nodes = True
    tree = material.node_tree
    tree.nodes.clear()
    exported = []

    candidates = []
    for attr_name in dir(bpy.types):
        cls = getattr(bpy.types, attr_name)
        try:
            if not isinstance(cls, type) or not issubclass(cls, bpy.types.Node) or cls is bpy.types.Node:
                continue
        except Exception:
            continue
        identifier = getattr(getattr(cls, "bl_rna", None), "identifier", attr_name)
        candidates.append((identifier, cls))

    seen = set()
    for identifier, cls in sorted(candidates):
        if identifier in seen:
            continue
        seen.add(identifier)
        try:
            node = tree.nodes.new(identifier)
        except Exception:
            continue
        exported.append(
            {
                "blIdname": identifier,
                "name": node.bl_rna.name,
                "nameZhHant": translated(node.bl_rna.name),
                "inputs": [socket_schema(socket, index) for index, socket in enumerate(node.inputs)],
                "outputs": [socket_schema(socket, index) for index, socket in enumerate(node.outputs)],
                "properties": property_schema(node),
            }
        )
        tree.nodes.remove(node)

    payload = {
        "blenderVersion": bpy.app.version_string,
        "blenderVersionCycle": bpy.app.version_cycle,
        "blenderBuildHash": bpy.app.build_hash.decode("ascii") if isinstance(bpy.app.build_hash, bytes) else str(bpy.app.build_hash),
        "officialSource": "https://github.com/blender/blender/tree/v5.2.2",
        "locale": getattr(bpy.app.translations, "locale", ""),
        "nodeCount": len(exported),
        "nodes": exported,
    }
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"BML_SCHEMA_EXPORTED {len(exported)} {output_path}")


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if not args:
        raise SystemExit("Output JSON path is required after --")
    main(args[0])
