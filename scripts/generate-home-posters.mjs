import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "img", "material-previews");
const presetIds = [
  "peacock_feather",
  "holographic_foil",
  "molten_gold",
  "jade_stone",
  "dragon_scale_armor",
  "alien_meteorite",
];
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname).replace(/^\/+/, "");
  const target = normalize(join(root, relative));
  if (!target.startsWith(root) || !existsSync(target)) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(target).pipe(response);
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const [{ Preview3D }, compiler, { Graph }, { default: presets }] = await Promise.all([
      import("./js/ui/preview3d.js"),
      import("./js/core/compiler.js"),
      import("./js/core/graphModel.js"),
      import("./data/presets/index.js"),
    ]);
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-1000px;top:0;width:600px;height:600px";
    document.body.appendChild(container);
    const preview = new Preview3D(container);
    preview.setMaterial(compiler.createPreviewMaterial());
    preview.setMesh("sphere");
    preview.controls.autoRotate = false;
    window.__homePosterRenderer = { preview, compiler, Graph, presets };
  });

  mkdirSync(outputDir, { recursive: true });
  for (const presetId of presetIds) {
    const dataUrl = await page.evaluate(async (id) => {
      const { preview, compiler, Graph, presets } = window.__homePosterRenderer;
      const preset = presets.find((item) => item.id === id);
      if (!preset) throw new Error(`Unknown preset: ${id}`);
      const graph = Graph.fromJSON(preset.graph);
      const result = compiler.compileGraph(graph);
      compiler.applyFragmentChunk(preview.getMaterial(), graph, result);
      preview._resize();
      await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
      preview.renderer.render(preview.scene, preview.camera);
      return preview.renderer.domElement.toDataURL("image/jpeg", 0.86);
    }, presetId);
    const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(join(outputDir, `${presetId}.jpg`), bytes);
    console.log(`${presetId}: ${bytes.length} bytes`);
  }
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

