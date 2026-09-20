import { Graph } from "./graphModel.js";

const VARIANTS = [
  { key: "original", label: { zh: "原始配色", en: "Original Palette" } },
  { key: "cool", label: { zh: "冷色變體", en: "Cool Variant" }, tint: [0.12, 0.38, 0.92] },
  { key: "warm", label: { zh: "暖色變體", en: "Warm Variant" }, tint: [0.92, 0.24, 0.08] },
];

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

function tintGraph(graphData, tint) {
  const graph = clone(graphData);
  let changed = 0;
  for (const node of graph?.nodes || []) {
    for (const [key, value] of Object.entries(node.params || {})) {
      if (!/color/i.test(key) || !Array.isArray(value) || value.length < 3) continue;
      const luminance = Math.max(0.12, Math.min(0.9, value[0] * 0.2126 + value[1] * 0.7152 + value[2] * 0.0722));
      node.params[key] = [
        Number((tint[0] * 0.72 + luminance * 0.28).toFixed(3)),
        Number((tint[1] * 0.72 + luminance * 0.28).toFixed(3)),
        Number((tint[2] * 0.72 + luminance * 0.28).toFixed(3)),
        value.length > 3 ? value[3] : 1,
      ];
      changed += 1;
    }
  }
  return { graph, changed };
}

function passesAll(activity, graphData) {
  try {
    const graph = Graph.fromJSON(graphData);
    return activity.checks.length > 0 && activity.checks.every((check) => Boolean(check.test(graph)));
  } catch {
    return false;
  }
}

function failsAtLeastOne(activity, graphData) {
  try {
    const graph = Graph.fromJSON(graphData);
    return activity.checks.some((check) => !check.test(graph));
  } catch {
    return false;
  }
}

export function activityVariants(activity) {
  if (!activity?.startGraph || !activity?.targetGraph || !activity?.checks?.length) return [VARIANTS[0]];
  const variants = [VARIANTS[0]];
  for (const variant of VARIANTS.slice(1)) {
    const start = tintGraph(activity.startGraph, variant.tint);
    const target = tintGraph(activity.targetGraph, variant.tint);
    if (start.changed > 0 && target.changed > 0 && passesAll(activity, target.graph) && failsAtLeastOne(activity, start.graph)) variants.push(variant);
  }
  return variants;
}

export function createActivityVariant(activity, variantIndex = 0) {
  const variants = activityVariants(activity);
  const variant = variants[Math.abs(Number(variantIndex) || 0) % variants.length];
  if (!variant.tint) return { ...activity, variant };
  return {
    ...activity,
    startGraph: tintGraph(activity.startGraph, variant.tint).graph,
    targetGraph: tintGraph(activity.targetGraph, variant.tint).graph,
    variant,
  };
}
