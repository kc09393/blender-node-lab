import { getNodeType } from "./nodeRegistry.js";

function bi(zh, en) {
  return { zh, en };
}

function outputSurfaceLink(graph) {
  for (const link of graph.links.values()) {
    const target = graph.nodes.get(link.toNode);
    if (target?.typeId === "output_material" && link.toSocket === "surface") return link;
  }
  return null;
}

function outputSocketLink(graph, socketKey) {
  for (const link of graph.links.values()) {
    const target = graph.nodes.get(link.toNode);
    if (target?.typeId === "output_material" && link.toSocket === socketKey) return link;
  }
  return null;
}

function reachableNodeIds(graph) {
  const reachable = new Set();
  const queue = [];
  for (const node of graph.nodes.values()) {
    if (node.typeId === "output_material") {
      reachable.add(node.id);
      queue.push(node.id);
    }
  }
  while (queue.length) {
    const targetId = queue.shift();
    for (const link of graph.links.values()) {
      if (link.toNode !== targetId || reachable.has(link.fromNode)) continue;
      reachable.add(link.fromNode);
      queue.push(link.fromNode);
    }
  }
  return reachable;
}

export function diagnoseGraph(graph) {
  const issues = [];
  const outputNodes = [...graph.nodes.values()].filter((node) => node.typeId === "output_material");
  if (outputNodes.length === 0) {
    issues.push({
      code: "missing-output",
      severity: "error",
      message: bi("缺少材質輸出，任何節點都不會顯示在預覽上。", "Material Output is missing, so nothing can reach the preview."),
    });
    return issues;
  }
  if (!outputSurfaceLink(graph)) {
    issues.push({
      code: "surface-disconnected",
      severity: "error",
      message: bi("材質輸出的「表面」尚未接線。", "Material Output's Surface socket is not connected."),
    });
  }
  if (outputSocketLink(graph, "volume")) {
    issues.push({
      code: "volume-preview-unsupported",
      severity: "warning",
      message: bi("Volume 已接線，但瀏覽器預覽沒有 Blender 的體積光線步進；請在 Blender 5.2.2 檢查最終體積效果。", "Volume is connected, but the browser preview does not implement Blender's volumetric ray marching. Check the final volume effect in Blender 5.2.2."),
    });
  }

  const reachable = reachableNodeIds(graph);
  const unused = [...graph.nodes.values()].filter((node) => node.typeId !== "output_material" && !reachable.has(node.id));
  if (unused.length) {
    const names = unused.slice(0, 3).map((node) => getNodeType(node.typeId)?.name.zh || node.typeId).join("、");
    issues.push({
      code: "unused-nodes",
      severity: "warning",
      message: bi(`有 ${unused.length} 個節點沒有影響輸出：${names}${unused.length > 3 ? "…" : ""}`, `${unused.length} node${unused.length > 1 ? "s do" : " does"} not affect the output.`),
    });
  }

  for (const node of graph.nodes.values()) {
    if (node.typeId === "vector_normal_map") {
      const color = node.params.color;
      const convention = node.params.convention || "opengl";
      if (Array.isArray(color) && color[1] < 0.5 && convention === "opengl") {
        issues.push({
          code: "normal-convention",
          severity: "tip",
          message: bi("這張法線資料的綠色分量偏低；若凹凸方向顛倒，試試 DirectX 慣例。", "The normal data has a low green component. If bumps look inverted, try the DirectX convention."),
        });
      }
    }
    if (node.typeId === "shader_principled_bsdf") {
      if (Number(node.params.metallic) > 0.8 && Number(node.params.transmissionWeight) > 0.2) {
        issues.push({
          code: "metal-transmission-conflict",
          severity: "warning",
          message: bi("金屬度與透射同時很高；真實材質通常只選其中一種主要行為。", "Metallic and Transmission are both high; real materials usually use one as the dominant behavior."),
        });
      }
      if (node.params.thinWall && Number(node.params.transmissionWeight) === 0) {
        issues.push({
          code: "thin-wall-no-transmission",
          severity: "tip",
          message: bi("Thin Wall 已開啟，但透射權重是 0，目前幾乎看不出薄壁效果。", "Thin Wall is enabled, but Transmission Weight is 0, so the thin-wall effect is barely visible."),
        });
      }
    }
    if (node.typeId === "shader_emission" && Number(node.params.strength) > 20) {
      issues.push({
        code: "extreme-emission",
        severity: "warning",
        message: bi("發光強度非常高，容易讓預覽過曝；先從 1～5 比較容易觀察。", "Emission is extremely high and may blow out the preview. Start around 1–5."),
      });
    }
    if (node.typeId === "texture_image" && !node.params.image) {
      issues.push({
        code: "missing-image",
        severity: "error",
        message: bi("圖像紋理尚未載入圖片。", "The Image Texture node has no image loaded."),
      });
    }
  }

  return issues;
}

export function scoreGraphHealth(graph) {
  const issues = diagnoseGraph(graph);
  const penalty = issues.reduce((sum, issue) => sum + (issue.severity === "error" ? 25 : issue.severity === "warning" ? 12 : 4), 0);
  return Math.max(0, 100 - penalty);
}
