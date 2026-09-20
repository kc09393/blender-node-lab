const SKILLS = [
  { id: "pbr", label: { zh: "PBR 基礎", en: "PBR" }, topics: ["pbr"] },
  { id: "coordinates", label: { zh: "座標與紋理", en: "Coordinates & Textures" }, topics: ["mapping", "texture", "animation"] },
  { id: "masks", label: { zh: "遮罩與混合", en: "Masks & Mixing" }, topics: ["masking", "stylized"] },
  { id: "surface", label: { zh: "表面細節", en: "Surface Detail" }, topics: ["surface", "displacement"] },
  { id: "shading", label: { zh: "著色與透光", en: "Shading & Transmission" }, topics: ["shading", "glass", "emission"] },
  { id: "workflow", label: { zh: "材質工作流程", en: "Material Workflow" }, topics: ["workflow"] },
];

export const learningSkills = SKILLS;

export function inferActivityTopic(activity) {
  if (activity?.topic) return activity.topic;
  const text = `${activity?.id || ""} ${activity?.sourceTutorialId || ""}`.toLowerCase();
  if (/metal|roughness|principled|carpaint/.test(text)) return "pbr";
  if (/mapping|coordinate|uv/.test(text)) return "mapping";
  if (/glass|transmission/.test(text)) return "glass";
  if (/emission|neon|blackbody|glow/.test(text)) return "emission";
  if (/mask|rust|wear|puddle|terrain/.test(text)) return "masking";
  if (/displacement|bump|normal/.test(text)) return "displacement";
  if (/channel|colorway|pack/.test(text)) return "workflow";
  if (/skin|candle|shader/.test(text)) return "shading";
  return "surface";
}

export function topicLabel(topic) {
  const labels = {
    pbr: { zh: "PBR", en: "PBR" },
    mapping: { zh: "座標", en: "Mapping" },
    texture: { zh: "紋理", en: "Texture" },
    animation: { zh: "動畫", en: "Animation" },
    masking: { zh: "遮罩", en: "Masking" },
    stylized: { zh: "風格化", en: "Stylized" },
    surface: { zh: "表面", en: "Surface" },
    displacement: { zh: "位移／法線", en: "Displacement / Normals" },
    shading: { zh: "著色", en: "Shading" },
    glass: { zh: "玻璃／透光", en: "Glass / Transmission" },
    emission: { zh: "發光", en: "Emission" },
    workflow: { zh: "工作流程", en: "Workflow" },
  };
  return labels[topic] || { zh: "綜合", en: "Mixed" };
}

export function estimateActivityMinutes(activity) {
  const label = `${activity?.level?.zh || ""} ${activity?.level?.en || ""}`.toLowerCase();
  const base = label.includes("進階") || label.includes("advanced") ? 15 : label.includes("中階") || label.includes("intermediate") ? 10 : 5;
  return Math.min(20, base + (Number(activity?.checks?.length) >= 5 ? 5 : 0));
}

function recordMastery(record) {
  if (!record) return 0;
  if (!record.completedAt) return Math.min(20, (Number(record.attempts) || 0) * 5);
  const score = Math.max(0, Math.min(100, Number(record.bestScore) || 60));
  const repeatBonus = Math.min(10, Math.max(0, (Number(record.completions) || 1) - 1) * 3);
  return Math.min(100, Math.round(score * 0.9 + repeatBonus));
}

export function calculateSkillMastery(state, activities) {
  return SKILLS.map((skill) => {
    const matches = activities.filter((activity) => skill.topics.includes(inferActivityTopic(activity)));
    const attempted = matches.filter((activity) => state.activities?.[activity.id]);
    const total = matches.length;
    const score = total === 0
      ? 0
      : Math.round(matches.reduce((sum, activity) => sum + recordMastery(state.activities?.[activity.id]), 0) / total);
    return { ...skill, score, attempted: attempted.length, total };
  });
}

export function recommendActivity(state, activities) {
  const skills = calculateSkillMastery(state, activities).sort((a, b) => a.score - b.score || a.attempted - b.attempted);
  const favorites = new Set(state.favoriteActivities || []);
  for (const skill of skills) {
    const candidates = activities
      .filter((activity) => skill.topics.includes(inferActivityTopic(activity)))
      .sort((a, b) => {
        const aRecord = state.activities?.[a.id];
        const bRecord = state.activities?.[b.id];
        return Number(Boolean(aRecord?.completedAt)) - Number(Boolean(bRecord?.completedAt))
          || Number(Boolean(favorites.has(b.id))) - Number(Boolean(favorites.has(a.id)))
          || (Number(aRecord?.attempts) || 0) - (Number(bRecord?.attempts) || 0);
      });
    if (candidates.length) return { activity: candidates[0], skill };
  }
  return null;
}
