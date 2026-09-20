import { existsSync, statSync } from "node:fs";
import presets from "../data/presets/index.js";
import presetCategories from "../data/presets/categories.js";
import tutorials from "../data/tutorials/index.js";
import nodeTutorialIndex from "../data/tutorials/nodeIndex.js";
import { challenges, debugLabs, learningActivities, assessmentQuestions, conceptCards, resolveLearningActivity } from "../data/learningActivities.js";
import { Graph } from "../js/core/graphModel.js";
import { listNodeTypes } from "../js/core/nodeRegistry.js";

const errors = [];
const expectCount = (label, actual, expected) => { if (actual !== expected) errors.push(`${label}: expected ${expected}, got ${actual}`); };
const unique = (label, items) => {
  const seen = new Set();
  for (const item of items) {
    if (!item?.id) errors.push(`${label}: item without id`);
    else if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
};

expectCount("presets", presets.length, 90);
expectCount("tutorials", tutorials.length, 83);
expectCount("challenges", challenges.length, 45);
expectCount("debug labs", debugLabs.length, 35);
expectCount("assessment questions", assessmentQuestions.length, 30);
expectCount("concept cards", conceptCards.length, 40);
unique("presets", presets);
unique("tutorials", tutorials);
unique("learning activities", learningActivities);
unique("concept cards", conceptCards);

const categoryCounts = new Map();
for (const category of presetCategories) for (const id of category.presetIds) categoryCounts.set(id, (categoryCounts.get(id) || 0) + 1);
for (const preset of presets) {
  if (categoryCounts.get(preset.id) !== 1) errors.push(`${preset.id}: expected exactly one preset category`);
  if ((preset.description?.zh?.length || 0) < 20 || (preset.description?.en?.length || 0) < 30) errors.push(`${preset.id}: description is too short`);
  const graph = Graph.fromJSON(preset.graph);
  if (graph.nodes.size !== preset.graph.nodes.length || graph.links.size !== preset.graph.links.length) errors.push(`${preset.id}: graph contains invalid nodes or links`);
}
for (const id of categoryCounts.keys()) if (!presets.some((preset) => preset.id === id)) errors.push(`preset category references unknown id ${id}`);

for (const activity of learningActivities) {
  const resolved = resolveLearningActivity(activity, tutorials);
  if (!resolved.startGraph || !resolved.targetGraph || resolved.checks.length === 0) {
    errors.push(`${activity.id}: missing start graph, target graph, or checks`);
    continue;
  }
  const start = Graph.fromJSON(resolved.startGraph);
  const target = Graph.fromJSON(resolved.targetGraph);
  const startPasses = resolved.checks.filter((check) => { try { return check.test(start); } catch { return false; } }).length;
  const targetPasses = resolved.checks.filter((check) => { try { return check.test(target); } catch { return false; } }).length;
  if (targetPasses !== resolved.checks.length) errors.push(`${activity.id}: reference target fails its own checks`);
  if (activity.kind === "debug" && startPasses === targetPasses) errors.push(`${activity.id}: broken start graph does not fail a check`);
}

assessmentQuestions.forEach((question, index) => {
  if (!question.topic) errors.push(`assessment ${index + 1}: missing topic`);
  if (!Array.isArray(question.options) || question.options.length < 3) errors.push(`assessment ${index + 1}: needs at least 3 options`);
  if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`assessment ${index + 1}: invalid correctIndex`);
});

const tutorialIds = new Set(tutorials.map((tutorial) => tutorial.id));
for (const node of listNodeTypes().filter((node) => node.supported !== false)) {
  const tutorialId = nodeTutorialIndex[node.id];
  if (!tutorialId || !tutorialIds.has(tutorialId)) errors.push(`${node.id}: supported node lacks a valid tutorial link`);
}

const libraryUrl = new URL("../downloads/blender-node-lab-material-library-5.2.2.blend", import.meta.url);
if (!existsSync(libraryUrl) || statSync(libraryUrl).size < 100000) errors.push("Blender material asset library is missing or unexpectedly small");

if (errors.length) {
  console.error(`Learning content audit failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Learning content audit passed: 90 presets, 83 tutorials, 45 challenges, 35 debug labs, 30 assessment questions, 40 concept cards, and complete supported-node tutorial coverage.");
