import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import presets from "../data/presets/index.js";
import { graphToBlenderPython } from "../js/core/blenderPythonExport.js";

const args = process.argv.slice(2);
const blenderArgIndex = args.indexOf("--blender");
const blender = blenderArgIndex >= 0 ? args[blenderArgIndex + 1] : process.env.BLENDER_EXE;
if (!blender) {
  console.error("Provide Blender 5.2.2 with --blender <path> or BLENDER_EXE.");
  process.exit(2);
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDir = resolve(root, "downloads");
const blendPath = resolve(outputDir, "blender-node-lab-material-library-5.2.2.blend");
const tempDir = await mkdtemp(resolve(tmpdir(), "blender-node-lab-assets-"));
const scriptPath = resolve(tempDir, "build-material-library.generated.py");
await mkdir(outputDir, { recursive: true });

const sections = presets.map((preset) => graphToBlenderPython(preset.graph, { materialName: preset.name.en }));
const metadata = Object.fromEntries(presets.map((preset) => [preset.name.en, preset.description.en]));
const finalizer = `
ASSET_METADATA = json.loads(${JSON.stringify(JSON.stringify(metadata))})
for asset_name, description in ASSET_METADATA.items():
    asset = bpy.data.materials.get(asset_name)
    if not asset:
        continue
    asset.asset_mark()
    if asset.asset_data:
        asset.asset_data.description = description
bpy.ops.wm.save_as_mainfile(filepath=${JSON.stringify(blendPath.replaceAll("\\", "/"))})
print("[Node Lab] Saved ${presets.length} material assets to ${blendPath.replaceAll("\\", "/")}")
`;
try {
  await writeFile(scriptPath, `${sections.join("\n\n")}\n${finalizer}`, "utf8");
  execFileSync(blender, ["--background", "--factory-startup", "--python", scriptPath], { cwd: root, stdio: "inherit" });
  console.log(`Blender asset library built: ${blendPath}`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
