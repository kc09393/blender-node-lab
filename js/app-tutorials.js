import { initLangToggle, tBi, getLang } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { Preview3D } from "./ui/preview3d.js";
import { NodeEditor } from "./ui/nodeEditor.js";
import { renderPalette } from "./ui/palette.js";
import { renderInspector } from "./ui/inspector.js";
import { compileGraph, applyFragmentChunk, createPreviewMaterial, CompileError } from "./core/compiler.js";
import { Graph } from "./core/graphModel.js";
import tutorials from "../data/tutorials/index.js";
import learningPath from "../data/tutorials/learningPath.js";
import { mountControlsHint } from "./ui/controlsHint.js";

initLangToggle();
initGlobalSearch();

const listView = document.getElementById("tutorial-list-view");
const runView = document.getElementById("tutorial-run-view");
const cardsContainer = document.getElementById("tutorial-cards");
const searchInput = document.getElementById("tutorial-search");
const levelFilterContainer = document.getElementById("tutorial-level-filters");
const progressEl = document.getElementById("tutorial-progress");
const pathBody = document.getElementById("learning-path-body");
const pathToggleBtn = document.getElementById("path-toggle");

// ---------- 已完成教學紀錄（localStorage）----------
// 存教學 id 陣列，不是整個教學物件——教學數量固定不大，直接存 id 清單最簡單，
// 未來教學被移除/改名時舊紀錄裡的孤兒 id 也不會造成任何問題（只是永遠比對不到）。
const COMPLETED_KEY = "bml_tutorials_completed_v1";
function loadCompletedSet() {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set(); // localStorage 被封鎖時退回「這次瀏覽都當作沒完成過」，不影響教學功能本身。
  }
}
function saveCompletedSet(set) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
  } catch {
    // 存不進去就這次瀏覽不記錄，不影響當次操作。
  }
}
const completedSet = loadCompletedSet();

let currentLevelFilter = ""; // "" = 全部，或 "入門"/"中階"/"進階"（用 level.zh 當穩定 key，不受目前顯示語言影響）

// ---------- 建議學習路徑：跟下面的搜尋/篩選清單完全獨立，只是另一種瀏覽方式 ----------
const PATH_COLLAPSED_KEY = "bml_learning_path_collapsed_v1";
function isPathCollapsed() {
  try {
    return localStorage.getItem(PATH_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}
function setPathCollapsed(collapsed) {
  try {
    localStorage.setItem(PATH_COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // 存不進去就這次瀏覽記不住收合狀態，不影響功能本身。
  }
}

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

function renderLearningPath() {
  const collapsed = isPathCollapsed();
  pathToggleBtn.textContent = collapsed
    ? (getLang() === "zh" ? "展開 ▾" : "Expand ▾")
    : (getLang() === "zh" ? "收合 ▴" : "Collapse ▴");
  pathBody.hidden = collapsed;

  // 路徑本身的完成度（跟下面「瀏覽全部教學」的全站進度數字是兩個不同的概念，
  // 分開顯示——使用者跟著路徑走時關心的是「這條路徑走到哪」，不是全站 81 篇裡完成幾篇，
  // 兩個數字混在一起容易誤解。放在收合狀態外面，收合時也看得到目前進度。
  const pathDone = learningPathFlatIds.reduce((n, id) => n + (completedSet.has(id) ? 1 : 0), 0);
  const pathProgressEl = document.getElementById("learning-path-progress");
  if (pathProgressEl) {
    pathProgressEl.textContent =
      getLang() === "zh"
        ? `路徑進度：已完成 ${pathDone} / ${learningPathFlatIds.length}`
        : `Path progress: ${pathDone} / ${learningPathFlatIds.length} completed`;
  }

  if (collapsed) return;

  // 回訪的使用者（關掉瀏覽器隔天回來）沒有「完成教學」那個當下的下一步提示可看，
  // 只能自己在 27 張卡片裡找第一個沒打勾的——標出「從這裡繼續」，跟前面完成教學後
  // 的即時導引互補，涵蓋「當下繼續」跟「回訪繼續」兩種情境。
  const nextUpId = learningPathFlatIds.find((id) => !completedSet.has(id));

  pathBody.innerHTML = "";
  for (const stage of learningPath) {
    const stageEl = document.createElement("div");
    stageEl.className = "path-stage";
    const stageTitle = document.createElement("h3");
    stageTitle.textContent = tBi(stage.title);
    stageEl.appendChild(stageTitle);

    const list = document.createElement("div");
    list.className = "path-steps";
    stage.steps.forEach((step, i) => {
      const tut = tutorials.find((t) => t.id === step.tutorialId);
      if (!tut) return; // 資料打錯字或教學被移除時直接跳過，不讓整條路徑掛掉
      const done = completedSet.has(tut.id);
      const isNextUp = tut.id === nextUpId;
      const item = document.createElement("div");
      item.className = `path-step${done ? " done" : ""}${isNextUp ? " next-up" : ""}`;
      item.innerHTML = `
        <div class="path-step-num">${done ? "✓" : i + 1}</div>
        <div class="path-step-body">
          ${isNextUp ? `<div class="path-step-continue">${getLang() === "zh" ? "▶ 從這裡繼續" : "▶ Continue here"}</div>` : ""}
          <div class="path-step-name">${tBi(tut.name)}</div>
          <div class="path-step-note">${tBi(step.note)}</div>
        </div>
      `;
      item.addEventListener("click", () => startTutorial(tut));
      list.appendChild(item);
    });
    stageEl.appendChild(list);
    pathBody.appendChild(stageEl);
  }
}
pathToggleBtn.addEventListener("click", () => {
  setPathCollapsed(!isPathCollapsed());
  renderLearningPath();
});

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
function renderTutorialThumbnail(tut) {
  const graphData = tut.endGraph || tut.startGraph;
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
    console.error(`縮圖渲染失敗（${tut.id}）:`, err);
    return null;
  }
}

// 縮圖快取：一份材質圖只需要渲染一次，搜尋/篩選/切換語言都只是重新篩過 DOM，不用重畫縮圖
// （縮圖渲染要跑一次完整編譯+WebGL render，71 篇全部重畫會在每次打字時卡頓）。
const thumbCache = new Map();
function ensureThumbnailsGenerated() {
  for (const tut of tutorials) {
    if (!thumbCache.has(tut.id)) thumbCache.set(tut.id, renderTutorialThumbnail(tut));
  }
}

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
  // 縮圖只在第一次呼叫時真的渲染（71 篇跑一輪 WebGL render 有感但可接受），
  // 之後每次重繪（搜尋輸入、切換篩選、切換語言）都直接吃快取，秒級完成。
  ensureThumbnailsGenerated();

  const filtered = getFilteredTutorials();
  cardsContainer.innerHTML = "";
  if (filtered.length === 0) {
    const hint = document.createElement("div");
    hint.className = "empty-hint";
    hint.textContent = getLang() === "zh" ? "沒有符合條件的教學" : "No tutorials match your filters";
    cardsContainer.appendChild(hint);
  }
  for (const tut of filtered) {
    const card = document.createElement("div");
    card.className = "tutorial-card";
    const thumb = document.createElement("img");
    const cached = thumbCache.get(tut.id);
    thumb.className = cached ? "t-thumb" : "t-thumb loading";
    if (cached) thumb.src = cached;
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
    card.addEventListener("click", () => startTutorial(tut));
    cardsContainer.appendChild(card);
  }
  updateProgressLabel();
}
renderTutorialCards();
renderLearningPath();
document.addEventListener("langchange", () => {
  renderTutorialCards();
  renderLearningPath();
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

  const canvasEl = document.getElementById("t-graph-canvas");
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
      checkCurrentStep();
      refreshUndoRedoButtons();
    },
    onSelect: (nodeId) => renderInspector(inspectorBody, editor.graph, nodeId),
  });

  btnUndo.addEventListener("click", () => editor.undo());
  btnRedo.addEventListener("click", () => editor.redo());
  refreshUndoRedoButtons();

  const paletteList = document.getElementById("t-palette-list");
  const paletteSearch = document.getElementById("t-palette-search");
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
  currentTutorial = tut;
  currentStepIndex = 0;
  ensureEditorInitialized();
  editor.loadGraph(Graph.fromJSON(tut.startGraph));
  editor.clearHistory();
  listView.style.display = "none";
  runView.classList.add("active");
  renderOverlay();
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
}

function finishTutorial() {
  if (!currentTutorial) return;
  const finishedId = currentTutorial.id;
  completedSet.add(finishedId);
  saveCompletedSet(completedSet);
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
    <div class="step-actions">
      <button type="button" id="tutorial-next-btn" disabled>${isLast ? (getLang() === "zh" ? "完成教學 🎉" : "Finish 🎉") : getLang() === "zh" ? "下一步" : "Next"}</button>
    </div>
  `;
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
  runView.classList.remove("active");
  listView.style.display = "";
  // 回到列表時重繪一次：剛完成的教學要立刻顯示已完成勾勾＋更新進度數字，
  // 縮圖已經快取過，這次重繪不會重新跑 WebGL render。
  renderTutorialCards();
  renderLearningPath();
}

window.__bmlTutorial = {
  get editor() {
    return editor;
  },
  get currentTutorial() {
    return currentTutorial;
  },
  get currentStepIndex() {
    return currentStepIndex;
  },
};

document.getElementById("t-back-to-list").addEventListener("click", exitTutorial);
document.getElementById("t-restart").addEventListener("click", () => {
  if (!currentTutorial) return;
  currentStepIndex = 0;
  editor.loadGraph(Graph.fromJSON(currentTutorial.startGraph));
  editor.clearHistory();
  renderOverlay();
});

// 從節點百科點「在教學中學習」跳轉過來時，直接開始對應的教學。網址參數是不可信任的外部
// 輸入（使用者可能手動改網址、或連結指向之後版本已改名/移除的教學 id），找不到就當作
// 沒帶參數，正常顯示教學列表，不讓整支 module script 因此掛掉。
const tutorialParam = new URLSearchParams(location.search).get("tutorial");
if (tutorialParam) {
  const target = tutorials.find((t) => t.id === tutorialParam);
  if (target) startTutorial(target);
  history.replaceState(null, "", location.pathname);
}
