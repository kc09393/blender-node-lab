// 學習紀錄只存在使用者自己的瀏覽器，不需要帳號或後端。
// 舊版只存 completed id 陣列；新版啟動時會自動遷移，保留既有完成進度。
const STATE_KEY = "bml_learning_state_v2";
const LEGACY_COMPLETED_KEY = "bml_tutorials_completed_v1";

function emptyState() {
  return {
    version: 2,
    tutorials: {},
    activities: {},
    assessment: null,
    knownConcepts: [],
  };
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadLearningState() {
  let state = emptyState();
  try {
    state = { ...state, ...safeParse(localStorage.getItem(STATE_KEY), {}) };
    state.tutorials = state.tutorials && typeof state.tutorials === "object" ? state.tutorials : {};
    state.activities = state.activities && typeof state.activities === "object" ? state.activities : {};
    state.knownConcepts = Array.isArray(state.knownConcepts) ? state.knownConcepts : [];

    const legacyIds = safeParse(localStorage.getItem(LEGACY_COMPLETED_KEY), []);
    const now = Date.now();
    for (const id of Array.isArray(legacyIds) ? legacyIds : []) {
      if (!state.tutorials[id]) {
        state.tutorials[id] = {
          completedAt: now,
          lastReviewedAt: now,
          nextReviewAt: now + 24 * 60 * 60 * 1000,
          intervalDays: 1,
          attempts: 1,
          quizMistakes: 0,
        };
      }
    }
  } catch {
    // localStorage 被瀏覽器封鎖時仍可完整使用教學，只是不保留跨次進度。
  }
  return state;
}

export function saveLearningState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    const completedIds = Object.entries(state.tutorials)
      .filter(([, record]) => record?.completedAt)
      .map(([id]) => id);
    localStorage.setItem(LEGACY_COMPLETED_KEY, JSON.stringify(completedIds));
  } catch {
    // 不讓儲存失敗阻斷當次學習。
  }
}

export function completedTutorialIds(state) {
  return new Set(Object.entries(state.tutorials)
    .filter(([, record]) => record?.completedAt)
    .map(([id]) => id));
}

export function markTutorialComplete(state, tutorialId) {
  const now = Date.now();
  const previous = state.tutorials[tutorialId] || {};
  state.tutorials[tutorialId] = {
    completedAt: previous.completedAt || now,
    lastReviewedAt: now,
    nextReviewAt: now + 24 * 60 * 60 * 1000,
    intervalDays: Math.max(1, Number(previous.intervalDays) || 1),
    attempts: (Number(previous.attempts) || 0) + 1,
    quizMistakes: Number(previous.quizMistakes) || 0,
  };
  saveLearningState(state);
}

export function recordQuizAnswer(state, tutorialId, correct) {
  const record = state.tutorials[tutorialId] || {
    attempts: 0,
    intervalDays: 1,
    quizMistakes: 0,
  };
  if (!correct) record.quizMistakes = (Number(record.quizMistakes) || 0) + 1;
  state.tutorials[tutorialId] = record;
  saveLearningState(state);
}

export function markTutorialReviewed(state, tutorialId, successful = true) {
  const now = Date.now();
  const record = state.tutorials[tutorialId] || {};
  const previousInterval = Math.max(1, Number(record.intervalDays) || 1);
  const intervalDays = successful ? Math.min(30, previousInterval * 2) : 1;
  state.tutorials[tutorialId] = {
    ...record,
    completedAt: record.completedAt || now,
    lastReviewedAt: now,
    nextReviewAt: now + intervalDays * 24 * 60 * 60 * 1000,
    intervalDays,
    attempts: (Number(record.attempts) || 0) + 1,
    quizMistakes: successful ? 0 : (Number(record.quizMistakes) || 0),
  };
  saveLearningState(state);
}

export function dueTutorialIds(state, now = Date.now()) {
  return Object.entries(state.tutorials)
    .filter(([, record]) => record?.completedAt && Number(record.nextReviewAt) <= now)
    .sort((a, b) => Number(a[1].nextReviewAt) - Number(b[1].nextReviewAt))
    .map(([id]) => id);
}

export function mistakeTutorialIds(state) {
  return Object.entries(state.tutorials)
    .filter(([, record]) => (Number(record?.quizMistakes) || 0) > 0)
    .sort((a, b) => Number(b[1].quizMistakes) - Number(a[1].quizMistakes))
    .map(([id]) => id);
}

export function markActivityComplete(state, activityId, score) {
  const now = Date.now();
  const previous = state.activities[activityId] || {};
  state.activities[activityId] = {
    completedAt: now,
    bestScore: Math.max(Number(previous.bestScore) || 0, Number(score) || 0),
    attempts: Math.max(1, Number(previous.attempts) || 0),
  };
  saveLearningState(state);
}

export function recordActivityAttempt(state, activityId) {
  const previous = state.activities[activityId] || {};
  state.activities[activityId] = {
    ...previous,
    attempts: (Number(previous.attempts) || 0) + 1,
  };
  saveLearningState(state);
}

export function saveAssessment(state, result) {
  state.assessment = { ...result, completedAt: Date.now() };
  saveLearningState(state);
}

export function toggleKnownConcept(state, conceptId) {
  const known = new Set(state.knownConcepts);
  if (known.has(conceptId)) known.delete(conceptId);
  else known.add(conceptId);
  state.knownConcepts = [...known];
  saveLearningState(state);
  return known.has(conceptId);
}

export function learningStats(state, tutorialTotal, activityTotal) {
  const completed = completedTutorialIds(state).size;
  const activityRecords = Object.values(state.activities);
  return {
    completed,
    tutorialTotal,
    due: dueTutorialIds(state).length,
    mistakes: mistakeTutorialIds(state).length,
    activitiesCompleted: activityRecords.filter((record) => record?.completedAt).length,
    activityTotal,
  };
}
