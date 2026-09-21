import { initLangToggle, tBi, getLang, t } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { Preview3D } from "./ui/preview3d.js";
import { NodeEditor } from "./ui/nodeEditor.js";
import { renderPalette } from "./ui/palette.js";
import { renderInspector } from "./ui/inspector.js";
import { compileGraph, applyFragmentChunk, createPreviewMaterial, CompileError } from "./core/compiler.js";
import { Graph } from "./core/graphModel.js";
import { getNodeType } from "./core/nodeRegistry.js";
import { diagnoseGraph, scoreGraphHealth } from "./core/graphDiagnostics.js";
import {
  loadLearningState,
  completedTutorialIds,
  markTutorialComplete,
  recordQuizAnswer,
  markTutorialReviewed,
  dueTutorialIds,
  mistakeTutorialIds,
  markActivityComplete,
  recordActivityAttempt,
  saveAssessment,
  toggleKnownConcept,
  toggleFavoriteActivity,
  createLearningBackup,
  restoreLearningBackup,
  learningStats,
} from "./core/learningProgress.js";
import { calculateSkillMastery, recommendActivity, inferActivityTopic, topicLabel, estimateActivityMinutes } from "./core/learningSkills.js";
import { activityVariants, createActivityVariant } from "./core/learningVariants.js";
import tutorials from "../data/tutorials/index.js";
import learningPath from "../data/tutorials/learningPath.js";
import { challenges, debugLabs, learningActivities, assessmentQuestions, conceptCards, resolveLearningActivity } from "../data/learningActivities.js";
import { mountControlsHint } from "./ui/controlsHint.js";
import { initMobilePanelTabs } from "./ui/mobilePanels.js";
import { initMobileNav } from "./ui/mobileNav.js";
import { initMobilePreviewDock } from "./ui/mobilePreviewDock.js";
import { setPageSeo, tutorialSeo } from "./seo.js";

initLangToggle();
initMobileNav();
initGlobalSearch();
initMobilePanelTabs(document.querySelector(".sandbox-body"));

const listView = document.getElementById("tutorial-list-view");
const runView = document.getElementById("tutorial-run-view");
const cardsContainer = document.getElementById("tutorial-cards");
const searchInput = document.getElementById("tutorial-search");
const levelFilterContainer = document.getElementById("tutorial-level-filters");
const progressEl = document.getElementById("tutorial-progress");
const pathBody = document.getElementById("learning-path-body");

// 學習中心只顯示一種工作模式，避免課程、挑戰、除錯與複習內容同時堆在長頁面上。
// view 會留在網址中，讓使用者可以直接分享某個分區，也支援瀏覽器上一頁／下一頁。
const LEARNING_VIEWS = new Set(["courses", "challenges", "debug", "review"]);
function learningViewFromLocation() {
  const requested = new URLSearchParams(location.search).get("view");
  return LEARNING_VIEWS.has(requested) ? requested : "courses";
}
let activeLearningView = learningViewFromLocation();

function applyLearningView(view, { updateUrl = false } = {}) {
  activeLearningView = LEARNING_VIEWS.has(view) ? view : "courses";
  document.querySelectorAll("[data-learning-view]").forEach((section) => {
    section.hidden = section.dataset.learningView !== activeLearningView;
  });
  document.querySelectorAll("[data-learning-view-target]").forEach((button) => {
    const active = button.dataset.learningViewTarget === activeLearningView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (updateUrl) {
    const url = new URL(location.href);
    if (activeLearningView === "courses") url.searchParams.delete("view");
    else url.searchParams.set("view", activeLearningView);
    history.pushState({ learningView: activeLearningView }, "", `${url.pathname}${url.search}${url.hash}`);
    listView.scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.querySelectorAll("[data-learning-view-target]").forEach((button) => {
  button.addEventListener("click", () => applyLearningView(button.dataset.learningViewTarget, { updateUrl: true }));
});
window.addEventListener("popstate", () => applyLearningView(learningViewFromLocation()));
applyLearningView(activeLearningView);

// ---------- 學習紀錄（只存這台裝置的 localStorage，不需要帳號）----------
const learningState = loadLearningState();
const completedSet = completedTutorialIds(learningState);

let currentLevelFilter = ""; // "" = 全部，或 "入門"/"中階"/"進階"（用 level.zh 當穩定 key，不受目前顯示語言影響）

// 學習路徑的扁平順序（跨階段），用來在「完成教學」時算出「下一步是哪篇」——
// 沒有這個，使用者跟著學習路徑做完一篇教學後只會被丟回一個很長的列表最上方，
// 得自己往下滑、自己找剛才做到哪、自己點下一篇，「引導路徑」的體驗就斷在這裡。
const learningPathFlatIds = learningPath.flatMap((stage) => stage.steps.map((s) => s.tutorialId));
// 回傳值：undefined＝這篇教學根本不在學習路徑裡（維持原本行為，直接回列表）；
// null＝這篇已經是路徑最後一步（顯示「整條路徑走完了」的祝賀畫面）；
// 否則＝下一篇教學的 id。
function getNextInPath(tutorialId) {
  const idx = learningPathFlatIds.indexOf(tutorialId);
  if (idx === -1) return undefined;
  if (idx === learningPathFlatIds.length - 1) return null;
  return learningPathFlatIds[idx + 1];
}

// 找出一篇教學在學習路徑裡的位置（第幾階段、階段內第幾步、全路徑第幾步）——用來在
// 教學進行中顯示「你在整條路徑的哪裡」，以及在完成教學時判斷「這是不是剛好走完一整個
// 階段」，讓使用者不是只在做完全部 27 篇之後才有「里程碑」的感覺，每個階段本身也算一個
// 有感的段落，減少「每篇教學都是孤立一篇」的分割感。回傳 null 代表這篇不在路徑裡。
function getPathPosition(tutorialId) {
  const flatIndex = learningPathFlatIds.indexOf(tutorialId);
  if (flatIndex === -1) return null;
  for (let stageIndex = 0; stageIndex < learningPath.length; stageIndex++) {
    const stage = learningPath[stageIndex];
    const stepIndexInStage = stage.steps.findIndex((s) => s.tutorialId === tutorialId);
    if (stepIndexInStage !== -1) {
      return { stage, stageIndex, stepIndexInStage, flatIndex };
    }
  }
  return null;
}

// ---------- 學習中心：診斷、實戰、除錯、間隔複習 ----------
const resolvedActivities = learningActivities.map((activity) => resolveLearningActivity(activity, tutorials));
const resolvedActivityById = new Map(resolvedActivities.map((activity) => [activity.id, activity]));

const learningDialog = document.getElementById("learning-dialog");
const learningDialogTitle = document.getElementById("learning-dialog-title");
const learningDialogBody = document.getElementById("learning-dialog-body");

function openLearningDialog(title, content) {
  learningDialogTitle.textContent = title;
  learningDialogBody.replaceChildren();
  if (typeof content === "string") learningDialogBody.innerHTML = content;
  else if (content) learningDialogBody.appendChild(content);
  if (typeof learningDialog.showModal === "function") learningDialog.showModal();
  else learningDialog.setAttribute("open", "");
}

function closeLearningDialog() {
  if (typeof learningDialog.close === "function") learningDialog.close();
  else learningDialog.removeAttribute("open");
}

document.getElementById("learning-dialog-close").addEventListener("click", closeLearningDialog);
learningDialog.addEventListener("click", (event) => {
  if (event.target === learningDialog) closeLearningDialog();
});

function getRecommendedTutorial() {
  const stageIndex = Math.min(learningPath.length - 1, Math.max(0, Number(learningState.assessment?.stageIndex) || 0));
  const stage = learningPath[stageIndex];
  const firstIncomplete = stage?.steps.find((step) => !completedSet.has(step.tutorialId));
  const id = firstIncomplete?.tutorialId || learningPathFlatIds.find((tutorialId) => !completedSet.has(tutorialId));
  return id ? tutorials.find((tutorial) => tutorial.id === id) : null;
}

function getAssessmentPracticeActivity() {
  const weakTopics = learningState.assessment?.weakTopics || [];
  for (const topic of weakTopics) {
    const activity = resolvedActivities.find((item) => inferActivityTopic(item) === topic && !learningState.activities?.[item.id]?.completedAt);
    if (activity) return activity;
  }
  return null;
}

function renderLearningDashboard() {
  const lang = getLang();
  const stats = learningStats(learningState, tutorials.length, resolvedActivities.length);
  const assessment = learningState.assessment;
  const recommendation = getRecommendedTutorial();
  const assessmentPractice = getAssessmentPracticeActivity();
  const weaknessText = (assessment?.weakTopics || []).slice(0, 2).map((topic) => tBi(topicLabel(topic))).join("、");
  const profileSummary = document.getElementById("learning-profile-summary");
  profileSummary.textContent = assessment
    ? (lang === "zh"
      ? `目前程度：${assessment.levelZh}。${weaknessText ? `優先補強：${weaknessText}。` : ""}建議下一步：${assessmentPractice ? tBi(assessmentPractice.name) : recommendation ? tBi(recommendation.name) : "自由挑戰自己的材質"}。`
      : `Current level: ${assessment.levelEn}. ${weaknessText ? `Priority gaps: ${weaknessText}. ` : ""}Recommended next: ${assessmentPractice ? tBi(assessmentPractice.name) : recommendation ? tBi(recommendation.name) : "build a material of your own"}.`)
    : (lang === "zh"
      ? `先做 ${assessmentQuestions.length} 題能力診斷，網站會分析弱項與合適起點；所有進度只存在這台裝置。`
      : `Take the ${assessmentQuestions.length}-question skill check to identify gaps and a good starting point. Progress stays only on this device.`);

  document.getElementById("learning-stats").innerHTML = `
    <div><strong>${stats.completed}</strong><span>${lang === "zh" ? `完成教學 / ${stats.tutorialTotal}` : `tutorials / ${stats.tutorialTotal}`}</span></div>
    <div><strong>${stats.activitiesCompleted}</strong><span>${lang === "zh" ? `完成實作 / ${stats.activityTotal}` : `activities / ${stats.activityTotal}`}</span></div>
    <div><strong>${stats.due}</strong><span>${lang === "zh" ? "到期複習" : "reviews due"}</span></div>
    <div><strong>${stats.mistakes}</strong><span>${lang === "zh" ? "需再確認" : "need review"}</span></div>
  `;

  const mastery = calculateSkillMastery(learningState, resolvedActivities);
  document.getElementById("skill-mastery").innerHTML = `
    <div class="skill-mastery-title">${lang === "zh" ? "能力地圖" : "Skill Map"}</div>
    ${mastery.map((skill) => `
      <div class="skill-row">
        <div class="skill-row-label"><span>${tBi(skill.label)}</span><b>${skill.score}%</b></div>
        <div class="skill-meter"><i style="width:${skill.score}%"></i></div>
      </div>
    `).join("")}
  `;

  const dueButton = document.getElementById("review-due-btn");
  const mistakeButton = document.getElementById("mistake-review-btn");
  const continueButton = document.getElementById("continue-activity-btn");
  const smartButton = document.getElementById("smart-practice-btn");
  dueButton.disabled = stats.due === 0;
  mistakeButton.disabled = stats.mistakes === 0;
  continueButton.disabled = !resolvedActivityById.has(learningState.lastActivityId);
  continueButton.textContent = lang === "zh" ? "繼續上次" : "Continue Last";
  const smart = recommendActivity(learningState, resolvedActivities);
  smartButton.textContent = smart
    ? (lang === "zh" ? `練弱項：${tBi(smart.skill.label)}` : `Practice: ${tBi(smart.skill.label)}`)
    : (lang === "zh" ? "推薦練習" : "Recommended Practice");
  document.getElementById("progress-backup-btn").textContent = lang === "zh" ? "匯出進度" : "Export Progress";
  document.getElementById("progress-restore-btn").textContent = lang === "zh" ? "匯入進度" : "Import Progress";
}

const activityFilters = {
  challenge: { query: "", level: "", topic: "", time: "", favorites: false },
  debug: { query: "", level: "", topic: "", time: "", favorites: false },
};

function activityDifficulty(activity) {
  const label = `${activity.level?.zh || ""} ${activity.level?.en || ""}`.toLowerCase();
  if (label.includes("進階") || label.includes("advanced")) return "advanced";
  if (label.includes("中階") || label.includes("intermediate")) return "intermediate";
  return "beginner";
}

function activityMatchesFilter(activity, filter) {
  if (filter.level && activityDifficulty(activity) !== filter.level) return false;
  if (filter.topic && inferActivityTopic(activity) !== filter.topic) return false;
  const minutes = estimateActivityMinutes(activity);
  if (filter.time === "5" && minutes !== 5) return false;
  if (filter.time === "10" && minutes !== 10) return false;
  if (filter.time === "15" && minutes < 15) return false;
  if (filter.favorites && !(learningState.favoriteActivities || []).includes(activity.id)) return false;
  const query = filter.query.trim().toLowerCase();
  if (!query) return true;
  return [activity.name?.zh, activity.name?.en, activity.description?.zh, activity.description?.en, activity.objective?.zh, activity.objective?.en, activity.topic]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function renderActivityCards(items, containerId, progressId, filterKey) {
  const lang = getLang();
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  let completed = 0;
  const visibleItems = items.filter((item) => activityMatchesFilter(item, activityFilters[filterKey]));
  for (const originalActivity of items) {
    const activity = resolvedActivityById.get(originalActivity.id);
    const record = learningState.activities[activity.id];
    const topic = inferActivityTopic(activity);
    const minutes = estimateActivityMinutes(activity);
    const variants = activityVariants(activity);
    const favorite = (learningState.favoriteActivities || []).includes(activity.id);
    if (record?.completedAt) completed += 1;
    if (!visibleItems.some((item) => item.id === activity.id)) continue;
    const card = document.createElement("article");
    card.className = `activity-card${record?.completedAt ? " completed" : ""}`;
    card.innerHTML = `
      <div class="activity-card-top"><span>${tBi(activity.level)}</span><button type="button" class="activity-favorite${favorite ? " active" : ""}" aria-label="${favorite ? (lang === "zh" ? "取消收藏" : "Remove favorite") : (lang === "zh" ? "加入收藏" : "Add favorite")}" aria-pressed="${favorite}">${favorite ? "★" : "☆"}</button></div>
      <h3>${tBi(activity.name)}</h3>
      <p>${tBi(activity.description)}</p>
      <img class="activity-thumb loading" data-thumbnail-id="${activity.id}" alt="${tBi(activity.name)}">
      <div class="activity-tags"><span>${tBi(topicLabel(topic))}</span><span>⏱ ${minutes} ${lang === "zh" ? "分鐘" : "min"}</span>${variants.length > 1 ? `<span>◐ ${variants.length} ${lang === "zh" ? "種變體" : "variants"}</span>` : ""}</div>
      <div class="activity-meta"><span>${record?.bestScore ? `${lang === "zh" ? "最佳" : "Best"} ${record.bestScore}` : `${activity.checks.length} ${lang === "zh" ? "個驗證目標" : "checks"}`}</span>${record?.completedAt ? `<span class="activity-done">✓ ${lang === "zh" ? "完成" : "Done"}</span>` : ""}</div>
      <button type="button" class="primary activity-start">${record?.completedAt ? (lang === "zh" ? "再練一次" : "Practice Again") : (lang === "zh" ? "開始實作" : "Start")}</button>
    `;
    const thumb = card.querySelector(".activity-thumb");
    const cached = thumbCache.get(activity.id);
    if (cached) {
      thumb.src = cached;
      thumb.classList.remove("loading");
    } else if (thumbCache.has(activity.id)) {
      thumb.classList.remove("loading");
      thumb.classList.add("failed");
    }
    card.querySelector(".activity-start").addEventListener("click", () => startActivity(activity));
    card.querySelector(".activity-favorite").addEventListener("click", () => {
      toggleFavoriteActivity(learningState, activity.id);
      renderLearningHub();
    });
    container.appendChild(card);
    if (!thumbCache.has(activity.id)) {
      if (thumbnailObserver) thumbnailObserver.observe(thumb);
      else queueThumbnail(activity.id);
    }
  }
  if (visibleItems.length === 0) {
    container.innerHTML = `<div class="activity-empty">${lang === "zh" ? "沒有符合條件的案例" : "No activities match these filters"}</div>`;
  }
  const filteredNote = visibleItems.length === items.length ? "" : (lang === "zh" ? ` · 顯示 ${visibleItems.length}` : ` · showing ${visibleItems.length}`);
  document.getElementById(progressId).textContent = lang === "zh"
    ? `已完成 ${completed} / ${items.length}${filteredNote}`
    : `${completed} / ${items.length} completed${filteredNote}`;
}

let conceptIndex = Math.floor(Date.now() / 86400000) % conceptCards.length;
let conceptFlipped = false;

function renderConceptCard() {
  const card = conceptCards[conceptIndex];
  const known = learningState.knownConcepts.includes(card.id);
  const cardEl = document.getElementById("concept-card");
  cardEl.classList.toggle("flipped", conceptFlipped);
  cardEl.classList.toggle("known", known);
  cardEl.innerHTML = `
    <div class="concept-tag">${tBi(card.tag)} · ${conceptIndex + 1}/${conceptCards.length}${known ? " · ✓" : ""}</div>
    <strong>${tBi(conceptFlipped ? card.back : card.front)}</strong>
  `;
  document.getElementById("concept-flip-btn").textContent = conceptFlipped
    ? (getLang() === "zh" ? "回到題目" : "Show Question")
    : t("tutorials.conceptFlip");
  document.getElementById("concept-known-btn").classList.toggle("active", known);
}

function moveConcept(direction) {
  conceptIndex = (conceptIndex + direction + conceptCards.length) % conceptCards.length;
  conceptFlipped = false;
  renderConceptCard();
}

document.getElementById("concept-prev-btn").addEventListener("click", () => moveConcept(-1));
document.getElementById("concept-next-btn").addEventListener("click", () => moveConcept(1));
document.getElementById("concept-flip-btn").addEventListener("click", () => {
  conceptFlipped = !conceptFlipped;
  renderConceptCard();
});
document.getElementById("concept-card").addEventListener("click", () => {
  conceptFlipped = !conceptFlipped;
  renderConceptCard();
});
document.getElementById("concept-card").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  conceptFlipped = !conceptFlipped;
  renderConceptCard();
});
document.getElementById("concept-known-btn").addEventListener("click", () => {
  toggleKnownConcept(learningState, conceptCards[conceptIndex].id);
  renderConceptCard();
});

function openAssessment() {
  const lang = getLang();
  const form = document.createElement("form");
  form.className = "assessment-form";
  assessmentQuestions.forEach((question, questionIndex) => {
    const fieldset = document.createElement("fieldset");
    fieldset.innerHTML = `<legend>${questionIndex + 1}. ${tBi(question.question)}</legend>`;
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="radio" name="assessment-${questionIndex}" value="${optionIndex}" required> <span>${tBi(option)}</span>`;
      fieldset.appendChild(label);
    });
    form.appendChild(fieldset);
  });
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary";
  submit.textContent = lang === "zh" ? "查看建議起點" : "See My Starting Point";
  form.appendChild(submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const answers = assessmentQuestions.map((question, index) => Number(data.get(`assessment-${index}`)) === question.correctIndex);
    const score = answers.filter(Boolean).length;
    const ratio = score / assessmentQuestions.length;
    const topicScores = new Map();
    assessmentQuestions.forEach((question, index) => {
      const topic = question.topic || "workflow";
      const record = topicScores.get(topic) || { correct: 0, total: 0 };
      record.total += 1;
      if (answers[index]) record.correct += 1;
      topicScores.set(topic, record);
    });
    const weakTopics = [...topicScores.entries()]
      .map(([topic, record]) => ({ topic, ratio: record.correct / record.total }))
      .sort((a, b) => a.ratio - b.ratio || a.topic.localeCompare(b.topic))
      .filter((item) => item.ratio < 0.8)
      .slice(0, 3)
      .map((item) => item.topic);
    const level = ratio <= 0.4
      ? { zh: "基礎探索者", en: "Foundation Explorer", stageIndex: 0 }
      : ratio <= 0.72
        ? { zh: "材質實作者", en: "Material Builder", stageIndex: Math.min(2, learningPath.length - 1) }
        : { zh: "節點解題者", en: "Node Problem Solver", stageIndex: Math.min(4, learningPath.length - 1) };
    saveAssessment(learningState, { score, total: assessmentQuestions.length, levelZh: level.zh, levelEn: level.en, stageIndex: level.stageIndex, weakTopics });
    renderLearningDashboard();
    const recommendation = getRecommendedTutorial();
    const practice = getAssessmentPracticeActivity();
    const weakLabels = weakTopics.map((topic) => tBi(topicLabel(topic))).join("、");
    const result = document.createElement("div");
    result.className = "assessment-result";
    result.innerHTML = `
      <div class="assessment-score">${score} / ${assessmentQuestions.length}</div>
      <h3>${lang === "zh" ? `你是「${level.zh}」` : `You're a ${level.en}`}</h3>
      <p>${lang === "zh" ? "這不是考試成績，而是幫你略過太簡單內容、補齊容易漏掉的基礎。" : "This is not a grade. It helps you skip material that is too easy while filling important gaps."}</p>
      ${weakLabels ? `<p><strong>${lang === "zh" ? "優先補強" : "Priority gaps"}：</strong>${weakLabels}</p>` : ""}
      ${practice || recommendation ? `<button type="button" class="primary" id="assessment-recommendation">${lang === "zh" ? `從「${tBi((practice || recommendation).name)}」開始` : `Start with “${tBi((practice || recommendation).name)}”`}</button>` : ""}
    `;
    learningDialogBody.replaceChildren(result);
    result.querySelector("button")?.addEventListener("click", () => {
      closeLearningDialog();
      if (practice) startActivity(practice);
      else startTutorial(recommendation);
    });
  });
  openLearningDialog(lang === "zh" ? "能力診斷" : "Skill Check", form);
}

function renderLearningHub() {
  renderLearningDashboard();
  renderTopicFilters();
  renderActivityCards(challenges, "challenge-cards", "challenge-progress", "challenge");
  renderActivityCards(debugLabs, "debug-cards", "debug-progress", "debug");
  renderConceptCard();
}

function renderTopicFilters() {
  const lang = getLang();
  for (const [kind, items] of [["challenge", challenges], ["debug", debugLabs]]) {
    const select = document.getElementById(`${kind}-topic`);
    const selected = select.value || activityFilters[kind].topic;
    const topics = [...new Set(items.map(inferActivityTopic))].sort((a, b) => tBi(topicLabel(a)).localeCompare(tBi(topicLabel(b))));
    select.innerHTML = `<option value="">${lang === "zh" ? "全部主題" : "All Topics"}</option>${topics.map((topic) => `<option value="${topic}">${tBi(topicLabel(topic))}</option>`).join("")}`;
    select.value = selected;
    const time = document.getElementById(`${kind}-time`);
    time.options[0].textContent = lang === "zh" ? "全部時間" : "Any Duration";
    time.options[1].textContent = lang === "zh" ? "約 5 分鐘" : "About 5 min";
    time.options[2].textContent = lang === "zh" ? "約 10 分鐘" : "About 10 min";
    time.options[3].textContent = lang === "zh" ? "約 15 分鐘以上" : "15+ min";
    const favoriteLabel = document.getElementById(`${kind}-favorites`).closest("label");
    if (favoriteLabel) favoriteLabel.lastChild.textContent = lang === "zh" ? " 只看收藏" : " Favorites only";
  }
}

function bindActivityFilters(kind, items, containerId, progressId) {
  const search = document.getElementById(`${kind}-search`);
  const level = document.getElementById(`${kind}-level`);
  const topic = document.getElementById(`${kind}-topic`);
  const time = document.getElementById(`${kind}-time`);
  const favorites = document.getElementById(`${kind}-favorites`);
  search.addEventListener("input", () => {
    activityFilters[kind].query = search.value;
    renderActivityCards(items, containerId, progressId, kind);
  });
  level.addEventListener("change", () => {
    activityFilters[kind].level = level.value;
    renderActivityCards(items, containerId, progressId, kind);
  });
  topic.addEventListener("change", () => {
    activityFilters[kind].topic = topic.value;
    renderActivityCards(items, containerId, progressId, kind);
  });
  time.addEventListener("change", () => {
    activityFilters[kind].time = time.value;
    renderActivityCards(items, containerId, progressId, kind);
  });
  favorites.addEventListener("change", () => {
    activityFilters[kind].favorites = favorites.checked;
    renderActivityCards(items, containerId, progressId, kind);
  });
}

bindActivityFilters("challenge", challenges, "challenge-cards", "challenge-progress");
bindActivityFilters("debug", debugLabs, "debug-cards", "debug-progress");

document.getElementById("assessment-start-btn").addEventListener("click", openAssessment);
document.getElementById("review-due-btn").addEventListener("click", () => {
  const nextId = dueTutorialIds(learningState).find((id) => tutorials.some((tutorial) => tutorial.id === id));
  const tutorial = tutorials.find((item) => item.id === nextId);
  if (tutorial) startTutorial(tutorial);
});
document.getElementById("mistake-review-btn").addEventListener("click", () => {
  const nextId = mistakeTutorialIds(learningState).find((id) => tutorials.some((tutorial) => tutorial.id === id));
  const tutorial = tutorials.find((item) => item.id === nextId);
  if (tutorial) startTutorial(tutorial);
});
document.getElementById("random-challenge-btn").addEventListener("click", () => {
  startActivity(resolvedActivityById.get(challenges[Math.floor(Math.random() * challenges.length)].id));
});
document.getElementById("smart-practice-btn").addEventListener("click", () => {
  const recommendation = recommendActivity(learningState, resolvedActivities);
  if (recommendation) startActivity(recommendation.activity);
});
document.getElementById("continue-activity-btn").addEventListener("click", () => {
  const activity = resolvedActivityById.get(learningState.lastActivityId);
  if (activity) startActivity(activity);
});
document.getElementById("progress-backup-btn").addEventListener("click", () => {
  const blob = new Blob([createLearningBackup(learningState)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `blender-node-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
});
document.getElementById("progress-restore-btn").addEventListener("click", () => document.getElementById("progress-restore-input").click());
document.getElementById("progress-restore-input").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  const lang = getLang();
  try {
    const raw = await file.text();
    const accepted = window.confirm(lang === "zh" ? "匯入會以備份內容取代這台裝置目前的學習進度，確定繼續？" : "Importing replaces the current learning progress on this device. Continue?");
    if (!accepted) return;
    restoreLearningBackup(learningState, raw);
    completedSet.clear();
    completedTutorialIds(learningState).forEach((id) => completedSet.add(id));
    renderLearningHub();
    renderLearningPath();
    renderTutorialCards();
    openLearningDialog(lang === "zh" ? "匯入完成" : "Import Complete", `<p>${lang === "zh" ? "學習進度已從備份還原。" : "Your learning progress was restored from the backup."}</p>`);
  } catch {
    openLearningDialog(lang === "zh" ? "無法匯入" : "Import Failed", `<p>${lang === "zh" ? "檔案不是有效的 Blender Material Node Lab 學習備份。" : "This file is not a valid Blender Material Node Lab learning backup."}</p>`);
  } finally {
    input.value = "";
  }
});

function renderLearningPath() {
  // 路徑本身的完成度（跟下面「瀏覽全部教學」的全站進度數字是兩個不同的概念，
  // 分開顯示——使用者跟著路徑走時關心的是「這條路徑走到哪」，不是全站教學總數裡完成幾篇，
  // 兩個數字混在一起容易誤解。放在收合狀態外面，收合時也看得到目前進度。
  const pathDone = learningPathFlatIds.reduce((n, id) => n + (completedSet.has(id) ? 1 : 0), 0);
  const pathProgressEl = document.getElementById("learning-path-progress");
  if (pathProgressEl) {
    pathProgressEl.textContent =
      getLang() === "zh"
        ? `路徑進度：已完成 ${pathDone} / ${learningPathFlatIds.length}`
        : `Path progress: ${pathDone} / ${learningPathFlatIds.length} completed`;
  }

  // 回訪的使用者（關掉瀏覽器隔天回來）沒有「完成教學」那個當下的下一步提示可看，
  // 只能自己在 27 張卡片裡找第一個沒打勾的——標出「從這裡繼續」，跟前面完成教學後
  // 的即時導引互補，涵蓋「當下繼續」跟「回訪繼續」兩種情境。
  const nextUpId = learningPathFlatIds.find((id) => !completedSet.has(id));
  const nextStageIndex = learningPath.findIndex((stage) => stage.steps.some((step) => step.tutorialId === nextUpId));
  const currentStageIndex = nextStageIndex >= 0 ? nextStageIndex : Math.max(0, learningPath.length - 1);

  pathBody.innerHTML = "";
  learningPath.forEach((stage, stageIndex) => {
    const stageEl = document.createElement("details");
    stageEl.className = "path-stage";
    stageEl.open = stageIndex === currentStageIndex;
    const stageDone = stage.steps.reduce((count, step) => count + Number(completedSet.has(step.tutorialId)), 0);
    const stageTitle = document.createElement("summary");
    const titleText = document.createElement("span");
    titleText.textContent = tBi(stage.title);
    const progressText = document.createElement("span");
    progressText.className = "path-stage-progress";
    progressText.textContent = `${stageDone}/${stage.steps.length}`;
    stageTitle.append(titleText, progressText);
    stageEl.appendChild(stageTitle);

    const list = document.createElement("div");
    list.className = "path-steps";
    stage.steps.forEach((step, i) => {
      const tut = tutorials.find((t) => t.id === step.tutorialId);
      if (!tut) return; // 資料打錯字或教學被移除時直接跳過，不讓整條路徑掛掉
      const done = completedSet.has(tut.id);
      const isNextUp = tut.id === nextUpId;
      const item = document.createElement("a");
      item.className = `path-step${done ? " done" : ""}${isNextUp ? " next-up" : ""}`;
      item.href = `learn/${encodeURIComponent(tut.id)}${getLang() === "en" ? ".en" : ""}.html`;
      item.innerHTML = `
        <div class="path-step-num">${done ? "✓" : i + 1}</div>
        <div class="path-step-body">
          ${isNextUp ? `<div class="path-step-continue">${getLang() === "zh" ? "▶ 從這裡繼續" : "▶ Continue here"}</div>` : ""}
          <div class="path-step-name">${tBi(tut.name)}</div>
          <div class="path-step-note">${tBi(step.note)}</div>
        </div>
      `;
      item.addEventListener("click", (event) => {
        event.preventDefault();
        startTutorial(tut);
      });
      list.appendChild(item);
    });
    stageEl.appendChild(list);
    pathBody.appendChild(stageEl);
  });
}

// ---------- 教學卡片縮圖：把每個教學的「完成材質」（endGraph）渲染成一張靜態小圖 ----------
// 用同一個隱藏的 Preview3D 實例依序渲染每張縮圖，而不是每張卡片各開一個 WebGL context——
// 瀏覽器對同時存在的 WebGL context 數量有限制（通常 ~16 個），縮圖一多就會出問題。
let thumbPreview = null;
function ensureThumbPreview() {
  if (thumbPreview) return thumbPreview;
  const container = document.getElementById("thumb-render-container");
  thumbPreview = new Preview3D(container);
  thumbPreview.setMaterial(createPreviewMaterial());
  thumbPreview.setMesh("sphere");
  return thumbPreview;
}

// 渲染單一教學的縮圖，回傳 data URL；graph 編譯失敗（理論上不該發生，endGraph 都驗證過）時回傳 null，
// 讓呼叫端保留占位圖而不是讓整頁縮圖渲染中斷。
function renderGraphThumbnail(graphData, label = "graph") {
  if (!graphData) return null;
  try {
    const preview = ensureThumbPreview();
    const graph = Graph.fromJSON(graphData);
    const result = compileGraph(graph);
    applyFragmentChunk(preview.getMaterial(), graph, result);
    preview._resize();
    preview.renderer.render(preview.scene, preview.camera);
    return preview.renderer.domElement.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.error(`縮圖渲染失敗（${label}）:`, err);
    return null;
  }
}

function renderTutorialThumbnail(tut) {
  return renderGraphThumbnail(tut.endGraph || tut.startGraph, tut.id);
}

// 縮圖快取：一份材質圖只需要渲染一次，搜尋/篩選/切換語言都只是重新篩過 DOM，不用重畫縮圖
// （縮圖渲染要跑一次完整編譯+WebGL render，全部重畫會在每次打字時卡頓）。
const thumbCache = new Map();
const thumbnailGraphById = new Map([
  ...tutorials.map((tutorial) => [tutorial.id, tutorial.endGraph || tutorial.startGraph]),
  ...[...resolvedActivityById.values()].map((activity) => [activity.id, activity.targetGraph || activity.startGraph]),
]);
const pendingThumbnailIds = [];
const queuedThumbnailIds = new Set();
let thumbnailWorkScheduled = false;

function applyCachedThumbnail(thumbnailId) {
  const cached = thumbCache.get(thumbnailId);
  document.querySelectorAll(`[data-thumbnail-id="${CSS.escape(thumbnailId)}"]`).forEach((img) => {
    if (cached) {
      img.src = cached;
      img.classList.remove("loading");
    } else if (thumbCache.has(thumbnailId)) {
      img.classList.remove("loading");
      img.classList.add("failed");
    }
  });
}

function processNextThumbnail() {
  thumbnailWorkScheduled = false;
  const thumbnailId = pendingThumbnailIds.shift();
  if (!thumbnailId) return;
  queuedThumbnailIds.delete(thumbnailId);
  if (!thumbCache.has(thumbnailId)) {
    const graph = thumbnailGraphById.get(thumbnailId);
    thumbCache.set(thumbnailId, renderGraphThumbnail(graph, thumbnailId));
  }
  applyCachedThumbnail(thumbnailId);
  scheduleThumbnailWork();
}

function scheduleThumbnailWork() {
  if (thumbnailWorkScheduled || pendingThumbnailIds.length === 0) return;
  thumbnailWorkScheduled = true;
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(processNextThumbnail, { timeout: 350 });
  } else {
    setTimeout(processNextThumbnail, 16);
  }
}

function queueThumbnail(thumbnailId) {
  if (thumbCache.has(thumbnailId)) {
    applyCachedThumbnail(thumbnailId);
    return;
  }
  if (!queuedThumbnailIds.has(thumbnailId)) {
    queuedThumbnailIds.add(thumbnailId);
    pendingThumbnailIds.push(thumbnailId);
  }
  scheduleThumbnailWork();
}

const thumbnailObserver = typeof IntersectionObserver === "function"
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        thumbnailObserver.unobserve(entry.target);
        queueThumbnail(entry.target.dataset.thumbnailId);
      }
    }, { root: listView, rootMargin: "500px 0px" })
  : null;

function getFilteredTutorials() {
  const query = searchInput.value.trim().toLowerCase();
  return tutorials.filter((tut) => {
    if (currentLevelFilter && tut.level.zh !== currentLevelFilter) return false;
    if (!query) return true;
    const haystack = `${tBi(tut.name)} ${tBi(tut.description)}`.toLowerCase();
    return haystack.includes(query);
  });
}

function updateProgressLabel() {
  const total = tutorials.length;
  const done = tutorials.reduce((n, t) => n + (completedSet.has(t.id) ? 1 : 0), 0);
  progressEl.textContent = getLang() === "zh" ? `已完成 ${done} / ${total}` : `${done} / ${total} completed`;
}

function renderTutorialCards() {
  const filtered = getFilteredTutorials();
  cardsContainer.innerHTML = "";
  if (filtered.length === 0) {
    const hint = document.createElement("div");
    hint.className = "empty-hint";
    hint.textContent = t("tutorials.noResults");
    cardsContainer.appendChild(hint);
  }
  for (const tut of filtered) {
    const card = document.createElement("a");
    card.className = "tutorial-card";
    card.href = `learn/${encodeURIComponent(tut.id)}${getLang() === "en" ? ".en" : ""}.html`;
    const thumb = document.createElement("img");
    const cached = thumbCache.get(tut.id);
    thumb.className = cached ? "t-thumb" : "t-thumb loading";
    if (cached) thumb.src = cached;
    thumb.dataset.thumbnailId = tut.id;
    thumb.alt = tBi(tut.name);
    card.appendChild(thumb);
    if (completedSet.has(tut.id)) {
      const badge = document.createElement("div");
      badge.className = "t-completed-badge";
      badge.textContent = "✓";
      card.appendChild(badge);
    }
    const body = document.createElement("div");
    body.className = "t-body";
    body.innerHTML = `
      <div class="t-level">${tBi(tut.level)}</div>
      <h3>${tBi(tut.name)}</h3>
      <p>${tBi(tut.description)}</p>
    `;
    card.appendChild(body);
    card.addEventListener("click", (event) => {
      event.preventDefault();
      startTutorial(tut);
    });
    cardsContainer.appendChild(card);
    if (!cached) {
      if (thumbnailObserver) thumbnailObserver.observe(thumb);
      else queueThumbnail(tut.id);
    }
  }
  updateProgressLabel();
}
document.addEventListener("langchange", () => {
  renderTutorialCards();
  renderLearningPath();
  renderLearningHub();
  if (currentTutorial) tutorialSeo(currentTutorial);
  else if (currentActivity) {
    setPageSeo({
      title: `${tBi(currentActivity.name)} · ${t("meta.tutorials.title")}`,
      description: tBi(currentActivity.description),
      path: `tutorials.html?activity=${encodeURIComponent(currentActivity.id)}${getLang() === "en" ? "&lang=en" : ""}`,
    });
  } else resetTutorialSeo();
  // 已經放進畫布的節點卡片（標籤/插槽名稱/下拉選單文字）是新增/編輯當下就把字串定案進 DOM，
  // 不會自動跟著切換語言——教學進行中畫布上通常已經有 startGraph 帶進來的節點，不補這行的話
  // 使用者切語言時，疊加層文字/教學清單都換了，畫布上的節點卡片卻還停在切換前的語言。
  if (editor) editor.render();
  if (currentActivity) {
    if (overlayMode === "activity-completion") renderActivityCompletion(currentActivity, activeActivityScore);
    else renderActivityOverlay();
    return;
  }
  if (!currentTutorial) return;
  // 教學進行中的疊加層有三種子畫面（一般步驟／結業測驗／學習路徑下一步），語言切換要重繪
  // 「使用者當下真的在看的那個」，不能無條件呼叫 renderOverlay()——不然使用者在測驗或
  // 「下一步」畫面切語言時，畫面會憑空跳回步驟畫面，很讓人困惑（這是加測驗功能時才浮現
  // 的既有邏輯缺口，不是這次才有的新狀態）。
  if (overlayMode === "quiz" && activeQuizState) {
    renderQuiz(activeQuizState.quiz, activeQuizState.index);
  } else if (overlayMode === "completion") {
    renderPathCompletion(activeCompletionNextId, activeCompletionStage);
  } else {
    renderOverlay();
  }
});

searchInput.addEventListener("input", renderTutorialCards);
levelFilterContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".level-filter-btn");
  if (!btn) return;
  currentLevelFilter = btn.dataset.level || "";
  levelFilterContainer.querySelectorAll(".level-filter-btn").forEach((b) => b.classList.toggle("active", b === btn));
  renderTutorialCards();
});

// ---------- 教學進行畫面（重用沙盒的節點編輯器 / 3D 預覽元件） ----------
let editor = null;
let preview = null;
let currentTutorial = null;
let currentActivity = null;
let activityStartedAt = 0;
let revealedHintCount = 0;
let activeActivityScore = 0;
let currentStepIndex = 0;
// 教學進行中的疊加層目前顯示哪個子畫面："step"（一般步驟）／"quiz"（結業測驗）／
// "completion"（學習路徑「下一步」畫面）。切換語言時（見下方 langchange 監聽）要重繪
// 「使用者當下真的在看的那個畫面」，不能每次都無條件重繪回一般步驟畫面——
// 不然使用者切語言時，測驗或「下一步」畫面會憑空消失、跳回步驟畫面，很讓人困惑。
let overlayMode = "step";
let activeQuizState = null; // { quiz, index }，overlayMode === "quiz" 時有值
let activeCompletionNextId; // overlayMode === "completion" 時有值（可能是 null，代表整條路徑走完）
let activeCompletionStage = null; // 剛完成的階段物件，只有「這次完成的教學剛好是某階段最後一步」時有值

function ensureEditorInitialized() {
  if (editor) return;
  const previewContainer = document.getElementById("t-preview-container");
  preview = new Preview3D(previewContainer);
  preview.setMaterial(createPreviewMaterial());
  document.getElementById("t-mesh-select").addEventListener("change", (e) => preview.setMesh(e.target.value));
  initMobilePreviewDock(
    document.querySelector(".sandbox-body"),
    previewContainer,
    document.getElementById("t-mini-preview-slot")
  );

  const canvasEl = document.getElementById("t-graph-canvas");
  const editorPanel = canvasEl.closest(".editor-panel");
  const editorToolbar = editorPanel.querySelector(".editor-toolbar");
  const syncOverlayPosition = () => editorPanel.style.setProperty("--tutorial-toolbar-height", `${editorToolbar.offsetHeight}px`);
  syncOverlayPosition();
  if (typeof ResizeObserver === "function") new ResizeObserver(syncOverlayPosition).observe(editorToolbar);
  const errorBox = document.getElementById("t-shader-error");
  const inspectorBody = document.getElementById("t-inspector-body");
  mountControlsHint(canvasEl.parentElement);

  function showError(message) {
    errorBox.hidden = !message;
    errorBox.textContent = message || "";
  }

  const btnUndo = document.getElementById("t-undo");
  const btnRedo = document.getElementById("t-redo");
  function refreshUndoRedoButtons() {
    btnUndo.disabled = !editor.canUndo;
    btnRedo.disabled = !editor.canRedo;
  }

  editor = new NodeEditor(canvasEl, {
    onChange: (graph) => {
      try {
        const result = compileGraph(graph);
        applyFragmentChunk(preview.getMaterial(), graph, result);
        showError(null);
      } catch (err) {
        showError(err instanceof CompileError ? err.message : `未預期的錯誤: ${err.message}`);
      }
      if (currentActivity) updateActivityStatus();
      else checkCurrentStep();
      refreshUndoRedoButtons();
    },
    onSelect: (nodeId) => renderInspector(inspectorBody, editor.graph, nodeId),
  });

  btnUndo.addEventListener("click", () => editor.undo());
  btnRedo.addEventListener("click", () => editor.redo());
  refreshUndoRedoButtons();

  // 觸控裝置沒有實體鍵盤按不到 Delete/Shift+D/Home，見 app-sandbox.js 同款按鈕的說明。
  document.getElementById("t-delete").addEventListener("click", () => editor.removeSelected());
  document.getElementById("t-duplicate").addEventListener("click", () => editor.duplicateSelected());
  document.getElementById("t-frame-all").addEventListener("click", () => editor.frameAll());

  const paletteList = document.getElementById("t-palette-list");
  const paletteSearch = document.getElementById("t-palette-search");
  canvasEl.addEventListener("nodeaddrequest", () => {
    document.querySelector('#tutorial-run-view .mobile-panel-tab[data-panel="nodes"]')?.click();
    paletteSearch.focus();
    paletteSearch.select();
  });
  function refreshPalette() {
    // 點選節點面板的項目：節點會跟著游標移動，再點一次畫布才放置（比照 Blender 的 Shift+A 流程）。
    renderPalette(paletteList, paletteSearch.value, (typeId) => editor.startPlacingNode(typeId));
  }
  refreshPalette();
  paletteSearch.addEventListener("input", refreshPalette);
  document.addEventListener("langchange", refreshPalette);

  canvasEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  canvasEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData("text/plain");
    if (!typeId) return;
    const { x, y } = editor.screenToGraph(e.clientX, e.clientY);
    editor.addNode(typeId, x - 90, y - 20);
  });
}

function startTutorial(tut) {
  currentActivity = null;
  currentTutorial = tut;
  currentStepIndex = 0;
  ensureEditorInitialized();
  // 先讓畫布容器變成可見（.tutorial-run-view 從 display:none 變 flex）再 loadGraph()——
  // loadGraph() 內部現在會呼叫 frameAll() 自動置中視角（見 nodeEditor.js），這個計算要靠
  // container 當下的實際寬高，容器還隱藏時量到的寬高是 0，算出來的縮放/置中會整個錯掉。
  listView.style.display = "none";
  runView.classList.add("active");
  editor.loadGraph(Graph.fromJSON(tut.startGraph));
  editor.clearHistory();
  renderOverlay();
  const url = new URL(location.href);
  url.searchParams.set("tutorial", tut.id);
  url.searchParams.delete("activity");
  history.replaceState({ tutorial: tut.id }, "", `${url.pathname}${url.search}${url.hash}`);
  tutorialSeo(tut);
}

function startActivity(activity) {
  if (!activity?.startGraph) return;
  const priorAttempts = Number(learningState.activities?.[activity.id]?.attempts) || 0;
  const activityForAttempt = createActivityVariant(activity, priorAttempts);
  currentTutorial = null;
  currentActivity = activityForAttempt;
  activityStartedAt = Date.now();
  revealedHintCount = 0;
  activeActivityScore = 0;
  overlayMode = "activity";
  ensureEditorInitialized();
  listView.style.display = "none";
  runView.classList.add("active");
  editor.loadGraph(Graph.fromJSON(activityForAttempt.startGraph));
  editor.clearHistory();
  recordActivityAttempt(learningState, activityForAttempt.id);
  renderActivityOverlay();
  const url = new URL(location.href);
  url.searchParams.delete("tutorial");
  url.searchParams.set("activity", activityForAttempt.id);
  history.replaceState({ activity: activityForAttempt.id }, "", `${url.pathname}${url.search}${url.hash}`);
  setPageSeo({
    title: `${tBi(activityForAttempt.name)} · ${t("meta.tutorials.title")}`,
    description: tBi(activityForAttempt.description),
    path: `tutorials.html?activity=${encodeURIComponent(activityForAttempt.id)}${getLang() === "en" ? "&lang=en" : ""}`,
  });
}

function activityResults() {
  if (!currentActivity || !editor) return [];
  return currentActivity.checks.map((check) => ({ ...check, passed: Boolean(check.test(editor.graph)) }));
}

function renderSmartCoach(graph, element) {
  if (!element) return;
  const issues = diagnoseGraph(graph);
  if (issues.length === 0) {
    element.innerHTML = `<div class="smart-coach-title">${getLang() === "zh" ? "智慧檢查" : "Smart Check"}</div><div class="smart-coach-item">✓ ${getLang() === "zh" ? "目前沒有發現常見結構問題。" : "No common structural problems found."}</div>`;
    return;
  }
  element.innerHTML = `
    <div class="smart-coach-title">${getLang() === "zh" ? "智慧檢查" : "Smart Check"} · ${scoreGraphHealth(graph)}/100</div>
    ${issues.slice(0, 3).map((issue) => `<div class="smart-coach-item ${issue.severity}">${issue.severity === "error" ? "!" : issue.severity === "warning" ? "△" : "i"} ${tBi(issue.message)}</div>`).join("")}
  `;
}

function updateActivityStatus() {
  if (!currentActivity || !editor) return;
  const results = activityResults();
  results.forEach((result, index) => {
    const row = document.querySelector(`[data-activity-check="${index}"]`);
    if (!row) return;
    row.classList.toggle("done", result.passed);
    const icon = row.querySelector("span");
    if (icon) icon.textContent = result.passed ? "✓" : "○";
  });
  const passed = results.filter((result) => result.passed).length;
  const finish = document.getElementById("activity-finish-btn");
  if (finish) finish.disabled = passed !== results.length;
  const progress = document.getElementById("activity-live-progress");
  if (progress) progress.textContent = `${passed} / ${results.length}`;
  renderSmartCoach(editor.graph, document.getElementById("activity-smart-coach"));
}

function renderRevealedHints() {
  if (!currentActivity) return;
  const hintList = document.getElementById("activity-hints");
  if (!hintList) return;
  hintList.innerHTML = currentActivity.hints.slice(0, revealedHintCount)
    .map((hint, index) => `<div><strong>${getLang() === "zh" ? `提示 ${index + 1}` : `Hint ${index + 1}`}：</strong>${tBi(hint)}</div>`)
    .join("");
  const button = document.getElementById("activity-hint-btn");
  button.disabled = revealedHintCount >= currentActivity.hints.length;
  button.textContent = revealedHintCount >= currentActivity.hints.length
    ? (getLang() === "zh" ? "提示已全部顯示" : "All Hints Revealed")
    : (getLang() === "zh" ? `再看一個提示（剩 ${currentActivity.hints.length - revealedHintCount}）` : `Reveal Another Hint (${currentActivity.hints.length - revealedHintCount} left)`);
}

function showNextHint() {
  if (!currentActivity) return;
  revealedHintCount = Math.min(currentActivity.hints.length, revealedHintCount + 1);
  renderRevealedHints();
}

function openComparison(currentGraphData, targetGraphData, title) {
  const currentImage = renderGraphThumbnail(currentGraphData, "current-comparison");
  const targetImage = renderGraphThumbnail(targetGraphData, "target-comparison");
  const lang = getLang();
  openLearningDialog(title, `
    <p>${lang === "zh" ? "比較的是材質外觀，不是要求節點位置或顏色完全一樣；只要原理與目標成立，就可能有不只一種正確解法。" : "Compare the material result, not exact node positions or colors. More than one graph can be correct if the goal and principle are satisfied."}</p>
    <div class="comparison-grid">
      <div class="comparison-panel"><h3>${lang === "zh" ? "你的結果" : "Your Result"}</h3>${currentImage ? `<img src="${currentImage}" alt="${lang === "zh" ? "目前材質預覽" : "Current material preview"}">` : `<p>${lang === "zh" ? "無法產生預覽" : "Preview unavailable"}</p>`}</div>
      <div class="comparison-panel"><h3>${lang === "zh" ? "參考方向" : "Reference Direction"}</h3>${targetImage ? `<img src="${targetImage}" alt="${lang === "zh" ? "參考材質預覽" : "Reference material preview"}">` : `<p>${lang === "zh" ? "這項練習沒有單一參考外觀" : "This activity has no single reference look"}</p>`}</div>
    </div>
  `);
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map((item) => typeof item === "number" ? Number(item.toFixed(3)) : item).join(", ");
  if (typeof value === "number") return String(Number(value.toFixed(3)));
  return String(value);
}

function englishLabel(value, fallback = "") {
  if (typeof value === "string") return value;
  return value?.en || value?.zh || fallback;
}

function openTransferGuide(graphData) {
  const lang = getLang();
  const graph = Graph.fromJSON(graphData);
  const nodeRows = [...graph.nodes.values()].map((node, index) => {
    const definition = getNodeType(node.typeId);
    const changed = [];
    for (const input of definition?.inputs || []) {
      if (graph.getIncomingLink(node.id, input.key)) continue;
      const value = node.params[input.key];
      if (JSON.stringify(value) !== JSON.stringify(input.default)) changed.push(`${tBi(input.label)} = ${formatValue(value)}`);
    }
    for (const setting of definition?.settings || []) {
      const value = node.params[setting.key];
      if (JSON.stringify(value) !== JSON.stringify(setting.default)) changed.push(`${tBi(setting.label)} = ${formatValue(value)}`);
    }
    return `<li><strong>${index + 1}. Shift+A → Search → ${englishLabel(definition?.name, node.typeId)}</strong>${changed.length ? `<div>${changed.join(" · ")}</div>` : ""}</li>`;
  }).join("");
  const linkRows = [...graph.links.values()].map((link) => {
    const fromNode = graph.nodes.get(link.fromNode);
    const toNode = graph.nodes.get(link.toNode);
    const fromDefinition = getNodeType(fromNode?.typeId);
    const toDefinition = getNodeType(toNode?.typeId);
    const fromSocket = fromDefinition?.outputs.find((socket) => socket.key === link.fromSocket);
    const toSocket = toDefinition?.inputs.find((socket) => socket.key === link.toSocket);
    return `<li>${englishLabel(fromDefinition?.name, fromNode?.typeId)} · ${englishLabel(fromSocket?.label, link.fromSocket)} → ${englishLabel(toDefinition?.name, toNode?.typeId)} · ${englishLabel(toSocket?.label, link.toSocket)}</li>`;
  }).join("");
  openLearningDialog(lang === "zh" ? "在 Blender 5.2 LTS 重做" : "Rebuild in Blender 5.2 LTS", `
    <div class="transfer-guide">
      <p>${lang === "zh" ? "網站預覽用來學結構；最後請在 Blender 裡重做一次，確認燈光、色彩管理與實際模型下的結果。" : "The web preview teaches structure. Rebuild once in Blender to verify lighting, color management, and your real model."}</p>
      <h3>${lang === "zh" ? "1. 新增節點" : "1. Add nodes"}</h3><ol>${nodeRows}</ol>
      <h3>${lang === "zh" ? "2. 接線" : "2. Connect sockets"}</h3><ol>${linkRows}</ol>
      <h3>${lang === "zh" ? "3. 實機確認" : "3. Verify in Blender"}</h3>
      <ul><li>${lang === "zh" ? "使用 Material Preview 與 Rendered 各看一次" : "Check both Material Preview and Rendered view"}</li><li>${lang === "zh" ? "換一個 HDRI 或燈光角度，確認材質不是只在單一光線下好看" : "Change the HDRI or light angle so the material works beyond one lighting setup"}</li><li>${lang === "zh" ? "資料貼圖使用 Non-Color；法線貼圖確認 OpenGL／DirectX 慣例" : "Use Non-Color for data maps and verify OpenGL/DirectX normal convention"}</li></ul>
    </div>
  `);
}

function finishActivity() {
  if (!currentActivity || activityResults().some((result) => !result.passed)) return;
  const activity = currentActivity;
  const score = Math.max(60, 100 - revealedHintCount * 10);
  markActivityComplete(learningState, activity.id, score, {
    hintsUsed: revealedHintCount,
    durationMs: activityStartedAt ? Date.now() - activityStartedAt : 0,
    variantKey: activity.variant?.key,
  });
  renderLearningHub();
  renderActivityCompletion(activity, score);
}

function renderActivityCompletion(activity, score) {
  overlayMode = "activity-completion";
  activeActivityScore = score;
  const overlay = document.getElementById("tutorial-overlay");
  overlay.innerHTML = `
    <div class="step-count">${getLang() === "zh" ? "實作完成" : "Activity Complete"}</div>
    <h4>🎉 ${tBi(activity.name)}</h4>
    <p>${getLang() === "zh" ? `完成分數 ${score}。提示是學習工具，不是扣分處罰；下次可以試著少看一個。` : `Score: ${score}. Hints are learning tools, not a punishment—try one fewer next time.`}</p>
    <div class="step-actions challenge-tools">
      <button type="button" id="activity-comparison-btn">${getLang() === "zh" ? "前後比較" : "Compare"}</button>
      <button type="button" id="activity-transfer-btn">${getLang() === "zh" ? "Blender 實作清單" : "Blender Checklist"}</button>
      <button type="button" id="activity-back-btn" class="primary">${getLang() === "zh" ? "回學習中心" : "Back to Learning Center"}</button>
    </div>
  `;
  document.getElementById("activity-comparison-btn").addEventListener("click", () => openComparison(editor.graph.toJSON(), activity.targetGraph, tBi(activity.name)));
  document.getElementById("activity-transfer-btn").addEventListener("click", () => openTransferGuide(editor.graph.toJSON()));
  document.getElementById("activity-back-btn").addEventListener("click", exitTutorial);
}

function renderActivityOverlay() {
  if (!currentActivity) return;
  overlayMode = "activity";
  const lang = getLang();
  const overlay = document.getElementById("tutorial-overlay");
  overlay.innerHTML = `
    <div class="step-count">${currentActivity.kind === "debug" ? (lang === "zh" ? "除錯實驗" : "Debug Lab") : (lang === "zh" ? "實戰挑戰" : "Challenge")} · ${currentActivity.variant ? tBi(currentActivity.variant.label) + " · " : ""}<span id="activity-live-progress">0 / ${currentActivity.checks.length}</span></div>
    <h4>${tBi(currentActivity.name)}</h4>
    <p>${tBi(currentActivity.objective)}</p>
    <div class="challenge-checklist">${currentActivity.checks.map((check, index) => `<div class="challenge-check" data-activity-check="${index}"><span>○</span><div>${tBi(check.label)}</div></div>`).join("")}</div>
    <div id="activity-smart-coach" class="smart-coach"></div>
    <div id="activity-hints" class="challenge-hints"></div>
    <div class="step-actions challenge-tools">
      <button type="button" id="activity-hint-btn">${lang === "zh" ? "看一個提示" : "Reveal a Hint"}</button>
      <button type="button" id="activity-compare-live-btn">${lang === "zh" ? "與參考比較" : "Compare Reference"}</button>
      <button type="button" id="activity-transfer-live-btn">${lang === "zh" ? "Blender 實作清單" : "Blender Checklist"}</button>
      <button type="button" id="activity-finish-btn" class="primary" disabled>${lang === "zh" ? "完成挑戰" : "Complete Activity"}</button>
    </div>
  `;
  renderRevealedHints();
  document.getElementById("activity-hint-btn").addEventListener("click", showNextHint);
  document.getElementById("activity-compare-live-btn").addEventListener("click", () => openComparison(editor.graph.toJSON(), currentActivity.targetGraph, tBi(currentActivity.name)));
  document.getElementById("activity-transfer-live-btn").addEventListener("click", () => openTransferGuide(editor.graph.toJSON()));
  document.getElementById("activity-finish-btn").addEventListener("click", finishActivity);
  updateActivityStatus();
}

function checkCurrentStep() {
  if (!currentTutorial || !editor) return;
  const step = currentTutorial.steps[currentStepIndex];
  if (!step) return;
  const passed = step.check(editor.graph);
  const nextBtn = document.getElementById("tutorial-next-btn");
  const statusEl = document.getElementById("tutorial-step-status");
  if (nextBtn) nextBtn.disabled = !passed;
  if (statusEl) {
    statusEl.className = `step-status ${passed ? "done" : "pending"}`;
    statusEl.textContent = passed
      ? getLang() === "zh" ? "✓ 完成，可以進入下一步" : "✓ Done — you can continue"
      : getLang() === "zh" ? "尚未完成這一步" : "Not done yet";
  }
  renderSmartCoach(editor.graph, document.getElementById("tutorial-smart-coach"));
}

function finishTutorial() {
  if (!currentTutorial) return;
  const finishedId = currentTutorial.id;
  const wasCompleted = completedSet.has(finishedId);
  completedSet.add(finishedId);
  if (wasCompleted) markTutorialReviewed(learningState, finishedId, true);
  else markTutorialComplete(learningState, finishedId);
  renderLearningDashboard();
  const nextId = getNextInPath(finishedId);
  if (nextId === undefined) {
    exitTutorial();
    return;
  }
  // 如果下一篇屬於不同的階段，代表剛好走完一整個階段——這比「完成了一篇教學」更值得
  // 慶祝一下，用一個階段里程碑訊息取代平常的「下一步」訊息，讓 27 篇教學不是全部走完
  // 才有成就感，每個階段本身也是一個有感的段落。
  let stageJustCompleted = null;
  if (nextId !== null) {
    const currentPos = getPathPosition(finishedId);
    const nextPos = getPathPosition(nextId);
    if (currentPos && nextPos && nextPos.stageIndex !== currentPos.stageIndex) {
      stageJustCompleted = currentPos.stage;
    }
  }
  renderPathCompletion(nextId, stageJustCompleted);
}

// 學習路徑專屬的「完成後」畫面——不是每篇教學都走這條，只有本身是學習路徑一部分的
// 教學才會顯示「下一步是哪篇」，其餘教學（進階技法/單一節點導覽等）完成後維持原本
// 直接退回列表的行為，不強行幫每篇教學都湊一個「下一步」建議。
function renderPathCompletion(nextId, stageJustCompleted = null) {
  overlayMode = "completion";
  activeCompletionNextId = nextId;
  activeCompletionStage = stageJustCompleted;
  const overlay = document.getElementById("tutorial-overlay");
  const lang = getLang();

  if (nextId === null) {
    overlay.innerHTML = `
      <div class="step-count">${lang === "zh" ? "學習路徑" : "Learning Path"}</div>
      <h4>${lang === "zh" ? "🎉 恭喜走完整條建議學習路徑！" : "🎉 You've completed the entire Learning Path!"}</h4>
      <p>${
        lang === "zh"
          ? "從材質圖基礎到綜合實戰，全部走過一輪了——接下來可以自由瀏覽全部教學，或直接到沙盒動手做自己的材質。"
          : "From material-graph basics all the way to putting it all together — you've been through it all. From here, browse all tutorials freely, or head to the Sandbox and build something of your own."
      }</p>
      <div class="step-actions">
        <button type="button" id="path-back-btn">${lang === "zh" ? "回教學列表" : "Back to tutorial list"}</button>
      </div>
    `;
    document.getElementById("path-back-btn").addEventListener("click", exitTutorial);
    return;
  }

  const nextTut = tutorials.find((t) => t.id === nextId);
  const heading = stageJustCompleted
    ? (lang === "zh" ? `🎉 完成「${tBi(stageJustCompleted.title)}」！` : `🎉 Finished "${tBi(stageJustCompleted.title)}"!`)
    : (lang === "zh" ? "✓ 這篇完成了！" : "✓ Done with this one!");
  const nextLabel = stageJustCompleted
    ? (lang === "zh" ? "下一階段從這篇開始：" : "The next stage starts with:")
    : (lang === "zh" ? "學習路徑的下一步：" : "Next in your Learning Path:");
  overlay.innerHTML = `
    <div class="step-count">${lang === "zh" ? "完成教學" : "Tutorial complete"}</div>
    <h4>${heading}</h4>
    <p>${nextLabel}<br /><strong>${tBi(nextTut.name)}</strong></p>
    <div class="step-actions">
      <button type="button" id="path-stay-btn">${lang === "zh" ? "回列表" : "Back to list"}</button>
      <button type="button" id="path-next-btn" class="primary">${lang === "zh" ? "繼續下一步 →" : "Continue →"}</button>
    </div>
  `;
  document.getElementById("path-stay-btn").addEventListener("click", exitTutorial);
  document.getElementById("path-next-btn").addEventListener("click", () => startTutorial(nextTut));
}

// ---------- 結業小測驗（testing effect：完成步驟只證明有跟著操作，不代表真的理解「為什麼」）----------
// currentTutorial.quiz 是可選欄位（陣列），目前只有一部分概念密度高的教學有寫，其餘教學完成後
// 直接呼叫 finishTutorial()，不強迫每篇都要有測驗題——沒有硬湊的低品質題目。
function renderQuiz(quiz, index) {
  overlayMode = "quiz";
  activeQuizState = { quiz, index };
  const overlay = document.getElementById("tutorial-overlay");
  const item = quiz[index];
  const isLastQuestion = index === quiz.length - 1;
  const lang = getLang();
  overlay.innerHTML = `
    <div class="step-count">${tBi(currentTutorial.name)} · ${lang === "zh" ? "小測驗" : "Quick Check"} ${index + 1}/${quiz.length}</div>
    <h4>${tBi(item.question)}</h4>
    <div class="quiz-options" id="quiz-options"></div>
    <div class="quiz-explanation" id="quiz-explanation" hidden></div>
    <div class="step-actions">
      <button type="button" id="quiz-continue-btn" hidden>${isLastQuestion ? (lang === "zh" ? "完成教學 🎉" : "Finish 🎉") : lang === "zh" ? "下一題" : "Next Question"}</button>
    </div>
  `;
  const optionsEl = document.getElementById("quiz-options");
  const explanationEl = document.getElementById("quiz-explanation");
  const continueBtn = document.getElementById("quiz-continue-btn");
  let answered = false;

  item.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = tBi(opt);
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const isCorrect = i === item.correctIndex;
      recordQuizAnswer(learningState, currentTutorial.id, isCorrect);
      btn.classList.add(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) {
        [...optionsEl.children][item.correctIndex].classList.add("correct");
      }
      [...optionsEl.children].forEach((el) => (el.disabled = true));
      explanationEl.hidden = false;
      explanationEl.innerHTML = `
        <span class="quiz-verdict ${isCorrect ? "correct" : "incorrect"}">${isCorrect ? (lang === "zh" ? "答對了！" : "Correct!") : lang === "zh" ? "答錯了，看看為什麼：" : "Not quite — here's why:"}</span>
        ${tBi(item.explanation)}
      `;
      continueBtn.hidden = false;
    });
    optionsEl.appendChild(btn);
  });

  continueBtn.addEventListener("click", () => {
    if (!currentTutorial) return;
    if (isLastQuestion) {
      finishTutorial();
    } else {
      renderQuiz(quiz, index + 1);
    }
  });
}

function renderOverlay() {
  overlayMode = "step";
  const overlay = document.getElementById("tutorial-overlay");
  const step = currentTutorial.steps[currentStepIndex];
  const isLast = currentStepIndex === currentTutorial.steps.length - 1;
  // 如果這篇教學是學習路徑的一部分，額外顯示「你在整條路徑的哪裡」——不是只有做完
  // 才看得到進度，做的過程中就持續有「這是一條連續路徑，不是孤立一篇」的感覺。
  const pathPos = getPathPosition(currentTutorial.id);
  const pathContextHtml = pathPos
    ? `<div class="step-path-context">${tBi(pathPos.stage.title)} · ${getLang() === "zh" ? "路徑第" : "Path step"} ${pathPos.flatIndex + 1}${getLang() === "zh" ? ` / ${learningPathFlatIds.length} 步` : ` / ${learningPathFlatIds.length}`}</div>`
    : "";
  overlay.innerHTML = `
    <div class="step-count">${tBi(currentTutorial.name)} · ${currentStepIndex + 1} / ${currentTutorial.steps.length}</div>
    ${pathContextHtml}
    <h4>${tBi(step.title)}</h4>
    <p>${tBi(step.instruction)}</p>
    <div class="step-status pending" id="tutorial-step-status">${getLang() === "zh" ? "尚未完成這一步" : "Not done yet"}</div>
    <div id="tutorial-smart-coach" class="smart-coach"></div>
    <div class="step-actions">
      <button type="button" id="tutorial-compare-btn">${getLang() === "zh" ? "前後比較" : "Compare"}</button>
      <button type="button" id="tutorial-transfer-btn">${getLang() === "zh" ? "Blender 實作清單" : "Blender Checklist"}</button>
      <button type="button" id="tutorial-next-btn" disabled>${isLast ? (getLang() === "zh" ? "完成教學 🎉" : "Finish 🎉") : getLang() === "zh" ? "下一步" : "Next"}</button>
    </div>
  `;
  document.getElementById("tutorial-compare-btn").addEventListener("click", () => openComparison(editor.graph.toJSON(), currentTutorial.endGraph, tBi(currentTutorial.name)));
  document.getElementById("tutorial-transfer-btn").addEventListener("click", () => openTransferGuide(editor.graph.toJSON()));
  document.getElementById("tutorial-next-btn").addEventListener("click", () => {
    // 這個按鈕點下去之後畫面才會切換／消失，中間有一個空檔；如果使用者手滑點兩下
    // （或裝置卡頓），第二次點擊時 currentTutorial 可能已經被 exitTutorial() 設回 null，
    // 這裡先擋掉，避免 currentTutorial.id 對 null 取值直接噴錯。
    if (!currentTutorial) return;
    if (isLast) {
      if (currentTutorial.quiz && currentTutorial.quiz.length > 0) {
        renderQuiz(currentTutorial.quiz, 0);
      } else {
        finishTutorial();
      }
    } else {
      currentStepIndex += 1;
      renderOverlay();
      checkCurrentStep();
    }
  });
  checkCurrentStep();
}

function exitTutorial() {
  currentTutorial = null;
  currentActivity = null;
  revealedHintCount = 0;
  activeActivityScore = 0;
  runView.classList.remove("active");
  listView.style.display = "";
  // 回到列表時重繪一次：剛完成的教學要立刻顯示已完成勾勾＋更新進度數字，
  // 縮圖已經快取過，這次重繪不會重新跑 WebGL render。
  renderTutorialCards();
  renderLearningPath();
  renderLearningHub();
  const url = new URL(location.href);
  url.searchParams.delete("tutorial");
  url.searchParams.delete("activity");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  resetTutorialSeo();
}

function resetTutorialSeo() {
  setPageSeo({
    title: t("meta.tutorials.title"),
    description: t("meta.tutorials.description"),
    path: `tutorials.html${getLang() === "en" ? "?lang=en" : ""}`,
  });
}

window.__bmlTutorial = {
  get editor() {
    return editor;
  },
  get currentTutorial() {
    return currentTutorial;
  },
  get currentActivity() {
    return currentActivity;
  },
  get learningState() {
    return learningState;
  },
  get currentStepIndex() {
    return currentStepIndex;
  },
};

document.getElementById("t-back-to-list").addEventListener("click", exitTutorial);
document.getElementById("t-restart").addEventListener("click", () => {
  if (!currentTutorial && !currentActivity) return;
  if (currentActivity) {
    revealedHintCount = 0;
    activeActivityScore = 0;
    editor.loadGraph(Graph.fromJSON(currentActivity.startGraph));
    editor.clearHistory();
    editor.frameAll();
    renderActivityOverlay();
    return;
  }
  currentStepIndex = 0;
  editor.loadGraph(Graph.fromJSON(currentTutorial.startGraph));
  editor.clearHistory();
  editor.frameAll(); // 同 startTutorial()，重新開始也要把視角拉回起始節點，不然手機窄畫布下又會落在畫面外
  renderOverlay();
});

// 從節點百科點「在教學中學習」跳轉過來時，直接開始對應的教學。網址參數是不可信任的外部
// 輸入（使用者可能手動改網址、或連結指向之後版本已改名/移除的教學 id），找不到就當作
// 沒帶參數，正常顯示教學列表，不讓整支 module script 因此掛掉。
const tutorialParam = new URLSearchParams(location.search).get("tutorial");
const activityParam = new URLSearchParams(location.search).get("activity");
const targetTutorial = tutorialParam ? tutorials.find((t) => t.id === tutorialParam) : null;
const targetActivity = activityParam ? resolvedActivityById.get(activityParam) : null;
if (targetActivity && !new URLSearchParams(location.search).has("view")) {
  applyLearningView(targetActivity.kind === "debug" ? "debug" : "challenges");
}
renderLearningPath();
renderLearningHub();
if (targetActivity) startActivity(targetActivity);
else if (targetTutorial) startTutorial(targetTutorial);
else {
  renderTutorialCards();
  resetTutorialSeo();
}
