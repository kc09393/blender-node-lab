// 節點卡片的 DOM 渲染。這裡只做「互動模式」（沙盒用）；百科的唯讀展示卡片
// 在 encyclopedia 頁面用同一份型別資料，但走 renderReadonlyDoc()（見檔案尾端），
// 兩者共用 tBi() 抓雙語文字，避免兩處敘述之後長歪。
import { getNodeType } from "../core/nodeRegistry.js";
import { tBi, t, getLang } from "../i18n.js";
import { getTermHint } from "../core/termHints.js";
import { glossNodeNames } from "../core/glossary.js";
import { segmentPolyCoeffs } from "../core/colorRampUtil.js";
import { openColorPicker } from "./colorPicker.js";

// 幫欄位標籤加一個可以點的「ⓘ」小圖示（例如 IOR 是什麼）。用點擊而不是只靠滑鼠懸停，
// 因為懸停提示很容易被忽略、觸控裝置也用不到，點一下彈出的說明框比較顯眼、容易發現。
let activeHintPopover = null;
function hideHintPopover() {
  if (activeHintPopover) {
    activeHintPopover.remove();
    activeHintPopover = null;
  }
}
function showHintPopover(anchorEl, text) {
  const wasShowingFor = activeHintPopover?.dataset.anchorKey;
  hideHintPopover();
  if (wasShowingFor === text) return; // 再點一次同一個圖示＝關掉
  const pop = document.createElement("div");
  pop.className = "hint-popover";
  pop.textContent = text;
  pop.dataset.anchorKey = text;
  document.body.appendChild(pop);
  const r = anchorEl.getBoundingClientRect();
  pop.style.left = `${Math.min(r.left, window.innerWidth - 280)}px`;
  pop.style.top = `${r.bottom + 6}px`;
  activeHintPopover = pop;
  requestAnimationFrame(() => {
    document.addEventListener("pointerdown", hideHintPopover, { once: true });
  });
}

function applyTermHint(labelEl, key) {
  const hint = getTermHint(key, getLang());
  if (!hint) return;
  labelEl.classList.add("has-hint");
  const icon = document.createElement("span");
  icon.className = "hint-icon";
  icon.textContent = "?";
  icon.setAttribute("role", "button");
  icon.setAttribute("tabindex", "0");
  icon.setAttribute("aria-label", t("a11y.hintIcon"));
  icon.addEventListener("pointerdown", (e) => e.stopPropagation());
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    showHintPopover(icon, hint);
  });
  icon.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    showHintPopover(icon, hint);
  });
  labelEl.appendChild(icon);
}

const SOCKET_TYPE_LABEL = {
  shader: { zh: "著色器", en: "Shader" },
  color: { zh: "顏色", en: "Color" },
  vector: { zh: "向量", en: "Vector" },
  float: { zh: "數值", en: "Float" },
  bool: { zh: "布林值", en: "Boolean" },
};

// 少數節點（例如 Combine/Separate Color 的 RGB/HSV/HSL 模式）的輸入/輸出標籤會隨設定改變
// （R/G/B ↔ H/S/V ↔ H/S/L，跟 Blender 一致），這種 def.label 是 (params) => {zh,en} 的函式；
// 其餘節點 def.label 仍是普通的 {zh,en} 靜態物件。
function resolveLabel(label, params) {
  return typeof label === "function" ? label(params || {}) : label;
}

// 滑鼠移到 socket 圓點上時顯示「名稱＋型別＋輸入或輸出」，方便還不熟悉配色的新手辨認。
function socketTitle(label, type, dir) {
  const typeLabel = tBi(SOCKET_TYPE_LABEL[type] || { zh: type, en: type });
  const dirLabel = dir === "in" ? (getLang() === "zh" ? "輸入" : "input") : getLang() === "zh" ? "輸出" : "output";
  return `${tBi(label)} · ${typeLabel} (${dirLabel})`;
}

function clamp(v, min, max) {
  if (min == null || max == null) return v;
  return Math.min(max, Math.max(min, v));
}

function rgbToHex(rgba) {
  const [r, g, b] = rgba;
  const toHex = (c) => Math.round(clamp(c, 0, 1) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 幫數值輸入框加上「按住拖曳＝滑動調整數值」的手感（比照 Blender 的滑桿數值欄位）。
// 只是單純點擊（沒有拖曳超過幾個像素）還是會像一般輸入框一樣可以打字。
function makeScrubbable(input, { min, max, step, getValue, setValue }) {
  input.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    let moved = false;
    const startX = e.clientX;
    const startValue = getValue();
    try { input.setPointerCapture(e.pointerId); } catch { /* 沒有有效的 pointer session 可以捕獲，忽略即可 */ }

    // pointermove/pointerup 掛在 window、不是掛在 input 自己身上——跟這個檔案另外兩個拖曳手勢
    // （顏色漸變把手、曲線控制點）刻意用同一套做法：部分節點型別（Color Ramp／Combine Color，
    // 判斷條件見 nodeEditor.js 的 _onParamChange 對 hasDynamicLabel／hasConditionalSetting 的
    // 處理）只要參數一變就會同步整個重畫，這個 input 元素當下就會被換成全新的元素、從文件拔掉。
    // 如果 move/up 監聽器掛在 input 自己身上，元素被拔掉的瞬間瀏覽器會依 Pointer Events 規範
    // 自動釋放 pointer capture，之後所有移動事件都不會再送達——拖曳看起來像是「動一下點值就卡住
    // 不動了」。掛在 window 上就不受這個限制，數值一律用 startValue 加累積位移算，不依賴 input
    // 元素本身還活著；`getValue`/`setValue` 兩個外部傳入的存取器已經是跟真正的資料來源
    // （`node.params[key]`）打交道，不是靠這個 DOM 元素本身存值。
    // 多一層 pointerId 比對當第二層防護——這個檔案的曲線控制點拖曳（buildCurveControl）
    // 曾經實測抓到「沒有 pointerId 比對＋沒有成功拿到 capture」會導致放開手指後，任何不相干
    // 的手指/滑鼠移動都被誤認成「還在拖這個欄位」；這裡雖然已經有 setPointerCapture，
    // 但補這層比對幾乎零成本，統一套用同一套防護、不用去記哪個拖曳手勢有補、哪個沒補。
    const pointerId = e.pointerId;
    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      if (!moved && Math.abs(dx) < 3) return;
      if (!moved) {
        moved = true;
        input.blur();
      }
      const unit = step || 0.01;
      const sensitivity = unit * (ev.shiftKey ? 0.1 : 1); // 比照 Blender：按住 Shift 做精細調整
      const next = clamp(startValue + dx * sensitivity, min, max);
      input.value = Number(next.toFixed(4));
      setValue(next);
    };
    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (moved) ev.preventDefault(); // 剛拖曳完，別再讓瀏覽器把這次放開當成一般點擊去進入編輯模式
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}

function buildFloatControl(node, def, onParamChange) {
  const input = document.createElement("input");
  input.type = "number";
  input.value = node.params[def.key];
  if (def.step != null) input.step = def.step;
  if (def.min != null) input.min = def.min;
  if (def.max != null) input.max = def.max;
  input.addEventListener("change", () => {
    const v = clamp(parseFloat(input.value) || 0, def.min, def.max);
    input.value = v;
    onParamChange(node.id, def.key, v);
  });
  makeScrubbable(input, {
    min: def.min,
    max: def.max,
    step: def.step,
    getValue: () => parseFloat(input.value) || 0,
    setValue: (v) => onParamChange(node.id, def.key, v),
  });
  return input;
}

function buildColorControl(node, def, onParamChange) {
  const swatch = document.createElement("button");
  swatch.type = "button";
  swatch.className = "color-swatch";
  swatch.setAttribute("aria-label", `${t("a11y.colorSwatch")}${def.label ? `：${tBi(def.label)}` : ""}`);
  const current = node.params[def.key];
  swatch.style.background = `rgb(${Math.round(current[0] * 255)},${Math.round(current[1] * 255)},${Math.round(current[2] * 255)})`;
  swatch.addEventListener("pointerdown", (e) => e.stopPropagation());
  swatch.addEventListener("click", (e) => {
    e.stopPropagation();
    openColorPicker(swatch, node.params[def.key], (rgb) => {
      swatch.style.background = `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;
      const alpha = node.params[def.key][3] ?? 1;
      onParamChange(node.id, def.key, [rgb[0], rgb[1], rgb[2], alpha]);
    });
  });
  return swatch;
}

function buildVectorControl(node, def, onParamChange) {
  const wrap = document.createElement("div");
  wrap.className = "vector-control";
  const current = node.params[def.key];
  ["x", "y", "z"].forEach((axis, i) => {
    const input = document.createElement("input");
    input.type = "number";
    input.step = def.step ?? 0.1;
    input.value = current[i] ?? 0;
    input.style.width = "36px";
    input.addEventListener("change", () => {
      const next = [...node.params[def.key]];
      next[i] = parseFloat(input.value) || 0;
      onParamChange(node.id, def.key, next);
    });
    makeScrubbable(input, {
      min: def.min,
      max: def.max,
      step: def.step ?? 0.1,
      getValue: () => parseFloat(input.value) || 0,
      setValue: (v) => {
        const next = [...node.params[def.key]];
        next[i] = v;
        onParamChange(node.id, def.key, next);
      },
    });
    wrap.appendChild(input);
  });
  return wrap;
}

function buildImageSetting(node, def, onParamChange) {
  const wrap = document.createElement("div");
  wrap.className = "image-control";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = node.params[def.key] ? "更換圖片" : "選擇圖片";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  fileInput.addEventListener("pointerdown", (e) => e.stopPropagation());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onParamChange(node.id, def.key, reader.result);
    reader.readAsDataURL(file);
  });
  btn.addEventListener("pointerdown", (e) => e.stopPropagation());
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  wrap.appendChild(btn);
  wrap.appendChild(fileInput);
  if (node.params[def.key]) {
    const thumb = document.createElement("img");
    thumb.src = node.params[def.key];
    thumb.className = "image-thumb";
    wrap.appendChild(thumb);
  }
  return wrap;
}

function buildSelectSetting(node, def, onParamChange) {
  const select = document.createElement("select");
  // 選項數量比較多時（例如 Math 節點的 30+ 種運算），用 group 屬性分組成 <optgroup>，
  // 比照 Blender 下拉選單本身就有分區（Functions/Comparison/Rounding...）的樣子，比較好找。
  const groups = new Map();
  for (const opt of def.options) {
    const groupName = opt.group || "";
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push(opt);
  }
  const useGroups = groups.size > 1;
  for (const [groupName, opts] of groups) {
    const parent = useGroups ? document.createElement("optgroup") : select;
    if (useGroups) {
      parent.label = groupName;
      select.appendChild(parent);
    }
    for (const opt of opts) {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = tBi(opt.label);
      parent.appendChild(o);
    }
  }
  select.value = node.params[def.key];
  select.addEventListener("pointerdown", (e) => e.stopPropagation());
  select.addEventListener("change", () => onParamChange(node.id, def.key, select.value));
  return select;
}

// 混合模式的「直觀示意圖」：借用瀏覽器原生 CSS `mix-blend-mode`——它本來就是照抄
// Photoshop 的混合模式規格設計的，multiply/screen/darken 等名稱、算法都直接對得上，
// 不需要自己刻一份預覽渲染器。兩個色塊疊在一起，上面那塊套用目前選到的混合模式即時更新。
// 沒有原生瀏覽器對應效果的模式（例如本節點的 Subtract）就顯示文字說明，不硬套一個不準的近似。
function buildBlendPreview(node, def) {
  const wrap = document.createElement("div");
  wrap.className = "blend-preview";
  const stage = document.createElement("div");
  stage.className = "blend-preview-stage";
  const bg = document.createElement("div");
  bg.className = "blend-preview-bg";
  const fg = document.createElement("div");
  fg.className = "blend-preview-fg";
  stage.append(bg, fg);
  const note = document.createElement("div");
  note.className = "blend-preview-note";
  wrap.append(stage, note);

  function update() {
    const opt = def.options.find((o) => o.value === node.params[def.key]);
    if (opt && opt.cssBlend) {
      fg.style.mixBlendMode = opt.cssBlend;
      stage.style.display = "";
      note.hidden = true;
    } else {
      stage.style.display = "none";
      note.hidden = false;
      note.textContent =
        getLang() === "zh"
          ? "這個模式瀏覽器沒有原生對應效果可以示意，實際結果請直接看右側的 3D 預覽。"
          : "This mode has no native browser equivalent to preview here — check the 3D preview on the right for the real result.";
    }
  }
  update();
  wrap.__updateBlendPreview = update;
  return wrap;
}

// 通用的「形狀/圖樣直觀示意圖」：給任何下拉選單設定用，只要每個選項有 cssPattern（一段 CSS
// background 語法），就會畫一個小方塊即時預覽。目前給漸變紋理（Gradient Texture）的類型用——
// 「線性」「球狀」這種名字對還在學習的人來說很抽象，一眼看到示意圖比自己腦補快很多。
// 教學導向優先於精確：多停駐點漸層（二次方/緩動）是取樣曲線公式幾個點位做出來的近似，
// 重點是讓使用者看得出「這種類型大概長什麼樣子」，不是像素級還原 3D 渲染結果。
function buildShapePreview(node, def) {
  const box = document.createElement("div");
  box.className = "shape-preview";
  function update() {
    const opt = def.options.find((o) => o.value === node.params[def.key]);
    box.style.background = (opt && opt.cssPattern) || "none";
  }
  update();
  box.__updateShapePreview = update;
  return box;
}

function buildBoolControl(node, def, onParamChange) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = !!node.params[def.key];
  input.addEventListener("pointerdown", (e) => e.stopPropagation());
  input.addEventListener("change", () => onParamChange(node.id, def.key, input.checked));
  return input;
}

// Color Ramp 用：可以自由新增/刪除任意多個顏色停駐點，比照 Blender（固定 2 個停駐點是本站
// 前一版的簡化，這裡補成跟 Blender 一致的「任意多個」）。
function buildColorRampControl(node, def, onParamChange) {
  const wrap = document.createElement("div");
  wrap.className = "colorramp-control";

  const gradientWrap = document.createElement("div");
  gradientWrap.className = "colorramp-gradient-wrap";
  const gradientBar = document.createElement("div");
  gradientBar.className = "colorramp-gradient";
  const handleLayer = document.createElement("div");
  handleLayer.className = "colorramp-handle-layer";
  const stopList = document.createElement("div");
  stopList.className = "colorramp-stops";
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "colorramp-add-btn";
  addBtn.textContent = "+";
  addBtn.title = t("sandbox.addStop");
  addBtn.setAttribute("aria-label", t("sandbox.addStop"));

  function commit(nextStops) {
    const sorted = [...nextStops].sort((a, b) => a.position - b.position);
    onParamChange(node.id, def.key, sorted);
    render();
  }

  // 依目前的停駐點，算出漸層在某個 0-1 位置的顏色（線性內插，跟色彩帶預設的 RGB/線性模式一致）。
  // 拖曳把手、點漸層條新增停駐點時，都需要「這個位置現在大概是什麼顏色」來決定新停駐點的初始顏色。
  function sampleGradientColor(stops, pos) {
    if (stops.length === 0) return [0.5, 0.5, 0.5, 1];
    if (pos <= stops[0].position) return stops[0].color;
    if (pos >= stops[stops.length - 1].position) return stops[stops.length - 1].color;
    for (let i = 0; i < stops.length - 1; i++) {
      const s0 = stops[i];
      const s1 = stops[i + 1];
      if (pos >= s0.position && pos <= s1.position) {
        const span = Math.max(s1.position - s0.position, 0.0001);
        const t = (pos - s0.position) / span;
        return s0.color.map((c, ci) => c + (s1.color[ci] - c) * t);
      }
    }
    return stops[0].color;
  }

  function render() {
    const stops = [...(node.params[def.key] || [])].sort((a, b) => a.position - b.position);
    const stopsCss = stops.map((s) => `${rgbToHex(s.color)} ${(clamp(s.position, 0, 1) * 100).toFixed(1)}%`).join(", ");
    gradientBar.style.background = stops.length ? `linear-gradient(to right, ${stopsCss})` : "none";

    handleLayer.innerHTML = "";
    stops.forEach((stop, idx) => {
      // 可見的三角形把手（12x11px）本身太小，真實滑鼠很容易點歪 1-2px 落到底下的漸層條上
      // （漸層條空白處點下去＝新增停駐點），造成「想拖曳卻意外多出一個幾乎重疊的新停駐點」
      // 的錯覺 bug。修法：可互動的判定區（.colorramp-handle）明顯比看得到的三角形
      // （.colorramp-handle-visual）大一圈，且往上跨進漸層條的下緣一點點，讓「抓已存在的
      // 把手」在判定上贏過「在空白處新增」，行為更接近 Blender 手感。
      const handle = document.createElement("div");
      handle.className = "colorramp-handle";
      handle.style.left = `${clamp(stop.position, 0, 1) * 100}%`;
      handle.title = `${(stop.position * 100).toFixed(1)}%`;

      const visual = document.createElement("div");
      visual.className = "colorramp-handle-visual";
      visual.style.background = rgbToHex(stop.color);
      handle.appendChild(visual);

      handle.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        handle.classList.add("dragging");
        // setPointerCapture 極少數情況會直接 throw（例如這個 pointer session 已經不存在）；
        // 沒包 try/catch 的話這行以下（含 onMove/onUp 的事件監聽器註冊）整段都不會執行，
        // 使用者會覺得「按住把手完全拖不動」，而且畫面上不會有任何錯誤提示。
        try { handle.setPointerCapture(e.pointerId); } catch { /* 沒有有效的 pointer session 可以捕獲，忽略即可 */ }
        const pointerId = e.pointerId;
        let stopRef = stop; // 拖曳期間用物件參照鎖定同一個停駐點，不受排序影響
        const barRect = gradientBar.getBoundingClientRect();

        // 多一層 pointerId 比對當第二層防護——正常情況下 setPointerCapture 已經能保證
        // onUp 收得到事件、不會洩漏，但萬一 capture 意外失敗（極少數情況會直接 throw，
        // 上面已經包了 try/catch 但沒有真的捕獲成功），這裡至少不會誤把其他手指/滑鼠的
        // 移動事件當成「還在拖這個把手」處理（曲線控制點那邊已經抓到這個真的會發生的
        // 洩漏情境，這裡沒實測到、但是同一套機制、補起來風險是零）。
        const onMove = (ev) => {
          if (ev.pointerId !== pointerId) return;
          const rel = clamp((ev.clientX - barRect.left) / barRect.width, 0, 1);
          const current = node.params[def.key] || [];
          const matchIdx = current.indexOf(stopRef);
          if (matchIdx === -1) return; // 理論上不會發生，防禦性檢查
          const updated = { ...current[matchIdx], position: rel };
          const next = current.slice();
          next[matchIdx] = updated;
          stopRef = updated; // onParamChange 換了一份新陣列＋新物件，下一次 onMove 要認得的是這個新物件
          onParamChange(node.id, def.key, next);
          handle.style.left = `${rel * 100}%`;
          gradientBar.style.background = `linear-gradient(to right, ${next
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((s) => `${rgbToHex(s.color)} ${(clamp(s.position, 0, 1) * 100).toFixed(1)}%`)
            .join(", ")})`;
        };
        const onUp = (ev) => {
          if (ev.pointerId !== pointerId) return;
          try { handle.releasePointerCapture(ev.pointerId); } catch { /* 沒有捕獲成功過，忽略即可 */ }
          handle.classList.remove("dragging");
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          render(); // 拖曳結束才重新排序＋重畫，避免拖曳途中把手因排序變動被整個換掉、手勢中斷
        };
        // pointercancel（瀏覽器把這次手勢判成別的用途搶走，觸控裝置常見，例如被判定成系統手勢）
        // 沒有另外接住的話，這個 window 監聽器會停留到下一次任何地方的 pointerup 才被清掉——
        // 拿 onUp 同一個收尾邏輯處理即可，不需要額外分辨兩者的差異。
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      });
      handleLayer.appendChild(handle);
    });

    stopList.innerHTML = "";
    stops.forEach((stop, idx) => {
      const row = document.createElement("div");
      row.className = "colorramp-stop-row";

      const posInput = document.createElement("input");
      posInput.type = "number";
      posInput.min = 0;
      posInput.max = 1;
      posInput.step = 0.01;
      posInput.value = stop.position;
      posInput.addEventListener("pointerdown", (e) => e.stopPropagation());
      posInput.addEventListener("change", () => {
        const next = stops.map((s, i) => (i === idx ? { ...s, position: clamp(parseFloat(posInput.value) || 0, 0, 1) } : s));
        commit(next);
      });

      const colorSwatch = document.createElement("button");
      colorSwatch.type = "button";
      colorSwatch.className = "color-swatch colorramp-stop-swatch";
      colorSwatch.setAttribute("aria-label", t("a11y.colorSwatch"));
      colorSwatch.style.background = `rgb(${Math.round(stop.color[0] * 255)},${Math.round(stop.color[1] * 255)},${Math.round(stop.color[2] * 255)})`;
      colorSwatch.addEventListener("pointerdown", (e) => e.stopPropagation());
      colorSwatch.addEventListener("click", (e) => {
        e.stopPropagation();
        openColorPicker(colorSwatch, stop.color, (rgb) => {
          colorSwatch.style.background = `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;
          const next = stops.map((s, i) => (i === idx ? { ...s, color: [rgb[0], rgb[1], rgb[2], s.color[3] ?? 1] } : s));
          commit(next);
        });
      });

      // Alpha 獨立於 RGB 之外，另外輸出成 Color Ramp 的 Alpha 插槽（跟 Blender 的 Color Ramp 一致）。
      // 沒有這個輸入框的話，每個停駐點的 alpha 只能永遠停在建立時的預設值 1，Alpha 輸出永遠是常數，
      // 接到任何地方都不會有效果——這個控制項本身就是「Alpha 插槽有沒有用」的關鍵。
      const alphaInput = document.createElement("input");
      alphaInput.type = "number";
      alphaInput.min = 0;
      alphaInput.max = 1;
      alphaInput.step = 0.05;
      alphaInput.title = "Alpha";
      alphaInput.value = stop.color[3] ?? 1;
      alphaInput.addEventListener("pointerdown", (e) => e.stopPropagation());
      alphaInput.addEventListener("change", () => {
        const a = clamp(parseFloat(alphaInput.value), 0, 1);
        const next = stops.map((s, i) => (i === idx ? { ...s, color: [s.color[0], s.color[1], s.color[2], Number.isNaN(a) ? 1 : a] } : s));
        commit(next);
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "×";
      delBtn.className = "colorramp-del-btn";
      delBtn.setAttribute("aria-label", t("a11y.deleteStop"));
      delBtn.disabled = stops.length <= 2;
      delBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (stops.length <= 2) return;
        commit(stops.filter((_, i) => i !== idx));
      });

      row.append(posInput, colorSwatch, alphaInput, delBtn);
      stopList.appendChild(row);
    });
  }

  addBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const stops = [...(node.params[def.key] || [])].sort((a, b) => a.position - b.position);
    // 插在目前最大間隙的中間，顏色用該區間內插，新停駐點不會突兀地變成純白/純黑。
    let bestGap = -1;
    let insertAt = 0.5;
    let insertColor = [0.5, 0.5, 0.5, 1];
    for (let i = 0; i < stops.length - 1; i++) {
      const gap = stops[i + 1].position - stops[i].position;
      if (gap > bestGap) {
        bestGap = gap;
        insertAt = (stops[i].position + stops[i + 1].position) / 2;
        insertColor = stops[i].color.map((c, ci) => (c + stops[i + 1].color[ci]) / 2);
      }
    }
    commit([...stops, { position: insertAt, color: insertColor }]);
  });

  // 比照 Blender：直接點漸層條空白處＝在那個位置新增一個停駐點，顏色取當下漸層在那個位置的顏色，
  // 不用每次都跑去點下面的「+」（那個是插在最大間隙中間，位置不受滑鼠控制）。
  gradientBar.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    const stops = [...(node.params[def.key] || [])].sort((a, b) => a.position - b.position);
    const barRect = gradientBar.getBoundingClientRect();
    const pos = clamp((e.clientX - barRect.left) / barRect.width, 0, 1);
    commit([...stops, { position: pos, color: sampleGradientColor(stops, pos) }]);
  });

  render();
  gradientWrap.append(gradientBar, handleLayer);
  wrap.append(gradientWrap, stopList, addBtn);
  return wrap;
}

// Float/Vector/RGB Curves 共用：一個可拖拉控制點的迷你曲線圖，旁邊搭配數值輸入列表
// （比照 Color Ramp 的做法：視覺化拖拉 + 精確數值輸入雙管齊下）。
function buildCurveControl(node, def, onParamChange) {
  const domain = def.domain || { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  const svgNS = "http://www.w3.org/2000/svg";

  const wrap = document.createElement("div");
  wrap.className = "curve-control";

  const graph = document.createElement("div");
  graph.className = "curve-graph";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.classList.add("curve-svg");
  const grid = document.createElementNS(svgNS, "line");
  grid.setAttribute("class", "curve-zero-line");
  const zeroY = 100 - ((0 - domain.yMin) / (domain.yMax - domain.yMin)) * 100;
  if (zeroY > 0 && zeroY < 100) {
    grid.setAttribute("x1", "0");
    grid.setAttribute("x2", "100");
    grid.setAttribute("y1", String(zeroY));
    grid.setAttribute("y2", String(zeroY));
    svg.appendChild(grid);
  }
  const path = document.createElementNS(svgNS, "polyline");
  path.setAttribute("class", "curve-path");
  svg.appendChild(path);

  const pointList = document.createElement("div");
  pointList.className = "curve-points";
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "curve-add-btn";
  addBtn.textContent = "+";
  addBtn.title = t("sandbox.addControlPoint");
  addBtn.setAttribute("aria-label", t("sandbox.addControlPoint"));

  const toSvg = (p) => ({
    sx: ((p.x - domain.xMin) / (domain.xMax - domain.xMin)) * 100,
    sy: 100 - ((p.y - domain.yMin) / (domain.yMax - domain.yMin)) * 100,
  });
  const fromSvg = (sx, sy) => ({
    x: domain.xMin + (sx / 100) * (domain.xMax - domain.xMin),
    y: domain.yMin + ((100 - sy) / 100) * (domain.yMax - domain.yMin),
  });

  function commit(nextPoints) {
    const sorted = [...nextPoints].sort((a, b) => a.x - b.x);
    onParamChange(node.id, def.key, sorted);
    render();
  }

  // 曲線示意圖：重用跟 GLSL 端完全同一套 Cardinal（Catmull-Rom）多項式係數公式
  // （segmentPolyCoeffs，見 curveUtil.js/colorRampUtil.js），逐段密集取樣連成折線畫出來，
  // 不是另外手繪近似形狀——這樣拖曳時看到的曲線形狀（含 overshoot）才會跟實際材質算出來的一致。
  function buildSmoothPolylinePoints(points) {
    if (points.length === 0) return "";
    if (points.length === 1) return `${toSvg(points[0]).sx},${toSvg(points[0]).sy}`;
    const stepsPerSeg = 20;
    const coords = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const yPrev = points[Math.max(i - 1, 0)].y;
      const yNext = points[Math.min(i + 2, points.length - 1)].y;
      const [a, b, c, d] = segmentPolyCoeffs("cardinal", yPrev, p0.y, p1.y, yNext);
      const startStep = i === 0 ? 0 : 1; // 跳過跟上一段共用的邊界點，避免重複
      for (let s = startStep; s <= stepsPerSeg; s++) {
        const t = s / stepsPerSeg;
        const y = ((a * t + b) * t + c) * t + d;
        const x = p0.x + (p1.x - p0.x) * t;
        const sp = toSvg({ x, y });
        coords.push(`${sp.sx},${sp.sy}`);
      }
    }
    return coords.join(" ");
  }

  function render() {
    const points = [...(node.params[def.key] || [])].sort((a, b) => a.x - b.x);
    path.setAttribute("points", buildSmoothPolylinePoints(points));

    svg.querySelectorAll(".curve-dot").forEach((d) => d.remove());
    points.forEach((p, idx) => {
      const s = toSvg(p);
      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("class", "curve-dot");
      dot.setAttribute("cx", s.sx);
      dot.setAttribute("cy", s.sy);
      dot.setAttribute("r", "3");
      dot.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        const rect = svg.getBoundingClientRect();
        const pointerId = e.pointerId;
        // 這個 dot 本身沒有設 setPointerCapture 過，之前拖曳到一半、手指剛好放開在某個
        // 會 e.stopPropagation() 的元素上（例如任何 socket——不管是拖過去接線還是純粹路過）
        // 時，這裡的 pointerup 監聽器永遠收不到事件、清不掉，onMove/onUp 這兩個監聽器就會
        // 永遠留在 window 上——之後任何地方、任何一根手指/滑鼠的移動都會被誤認成「還在拖這個
        // 控制點」，畫面上的曲線會跟著使用者完全無關的游標移動亂跳（實測抓到的真 bug，
        // 不是預防性寫法：合成一次「拖曳→放開在 socket 上→之後隨便送一個不相干的
        // pointermove」的序列，曲線點真的被那個不相干的事件動了）。
        // 修法比照顏色漸變把手（上面 handle 的 pointerdown 處理）：補 setPointerCapture
        // 讓事件確實從這個 dot 冒泡（不會被路過的其他元素攔截），加上 pointerId 比對當
        // 第二層防護——就算哪天 capture 意外失敗（極少數情況會直接 throw，見下面 try/catch），
        // onMove/onUp 也不會誤認其他手指/滑鼠的事件。
        try { dot.setPointerCapture(pointerId); } catch { /* 沒有有效的 pointer session 可以捕獲，忽略即可 */ }
        const onMove = (ev) => {
          if (ev.pointerId !== pointerId) return;
          const relX = clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100);
          const relY = clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100);
          const next = fromSvg(relX, relY);
          // 拖曳中：直接改第 idx 個點的位置，不重新排序（避免拖過鄰居時陣列順序跳動、拖曳中斷）；
          // 放開滑鼠後 render() 會重新排序一次。
          const current = [...(node.params[def.key] || [])];
          current[idx] = next;
          onParamChange(node.id, def.key, current);
        };
        const onUp = (ev) => {
          if (ev.pointerId !== pointerId) return;
          try { dot.releasePointerCapture(pointerId); } catch { /* 沒有捕獲成功過，忽略即可 */ }
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          render();
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      });
      svg.appendChild(dot);
    });

    pointList.innerHTML = "";
    points.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = "curve-point-row";

      const xInput = document.createElement("input");
      xInput.type = "number";
      xInput.step = 0.01;
      xInput.value = Number(p.x.toFixed(3));
      xInput.addEventListener("pointerdown", (e) => e.stopPropagation());
      xInput.addEventListener("change", () => {
        const next = points.map((pt, i) => (i === idx ? { ...pt, x: clamp(parseFloat(xInput.value) || 0, domain.xMin, domain.xMax) } : pt));
        commit(next);
      });

      const yInput = document.createElement("input");
      yInput.type = "number";
      yInput.step = 0.01;
      yInput.value = Number(p.y.toFixed(3));
      yInput.addEventListener("pointerdown", (e) => e.stopPropagation());
      yInput.addEventListener("change", () => {
        const next = points.map((pt, i) => (i === idx ? { ...pt, y: clamp(parseFloat(yInput.value) || 0, domain.yMin, domain.yMax) } : pt));
        commit(next);
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "×";
      delBtn.className = "curve-del-btn";
      delBtn.setAttribute("aria-label", t("a11y.deleteCurvePoint"));
      delBtn.disabled = points.length <= 2;
      delBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (points.length <= 2) return;
        commit(points.filter((_, i) => i !== idx));
      });

      row.append(xInput, yInput, delBtn);
      pointList.appendChild(row);
    });
  }

  svg.addEventListener("pointerdown", (e) => {
    if (e.target !== svg) return; // 點到的是控制點（圓點）而不是空白處，交給圓點自己的 pointerdown 處理
    e.stopPropagation();
    const rect = svg.getBoundingClientRect();
    const relX = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const relY = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    const p = fromSvg(relX, relY);
    commit([...(node.params[def.key] || []), p]);
  });

  addBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const points = [...(node.params[def.key] || [])].sort((a, b) => a.x - b.x);
    let bestGap = -1;
    let insertX = (domain.xMin + domain.xMax) / 2;
    let insertY = (domain.yMin + domain.yMax) / 2;
    for (let i = 0; i < points.length - 1; i++) {
      const gap = points[i + 1].x - points[i].x;
      if (gap > bestGap) {
        bestGap = gap;
        insertX = (points[i].x + points[i + 1].x) / 2;
        insertY = (points[i].y + points[i + 1].y) / 2;
      }
    }
    commit([...points, { x: insertX, y: insertY }]);
  });

  render();
  graph.appendChild(svg);
  wrap.append(graph, pointList, addBtn);
  return wrap;
}

export function createNodeElement(node, opts) {
  const { onHeaderPointerDown, onSocketPointerDown, onSocketPointerUp, onParamChange, onDelete, connectedInputKeys, selected } = opts;
  const typeDef = getNodeType(node.typeId);

  const el = document.createElement("div");
  el.className = `node-card cat-${typeDef.category}${selected ? " selected" : ""}`;
  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;
  el.dataset.nodeId = node.id;

  const header = document.createElement("div");
  header.className = "node-header";
  const title = document.createElement("span");
  title.textContent = tBi(typeDef.name);
  header.appendChild(title);
  if (typeDef.category !== "output") {
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "node-delete-btn";
    delBtn.textContent = "×";
    delBtn.setAttribute("aria-label", `${t("a11y.deleteNode")}：${tBi(typeDef.name)}`);
    delBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onDelete(node.id);
    });
    header.appendChild(delBtn);
  }
  header.addEventListener("pointerdown", (e) => onHeaderPointerDown(e, node.id));
  el.appendChild(header);

  const body = document.createElement("div");
  body.className = "node-body";

  for (const def of typeDef.settings || []) {
    // 部分設定只在其他設定是特定值時才有意義（例如色相過渡只在色彩空間非 RGB 時有用）——
    // 比照 Blender 直接把用不到的欄位藏起來，而不是留著一個怎麼調都沒效果的下拉選單。
    if (def.showIf && !def.showIf(node.params)) continue;
    // Color Ramp 這種可變長度的控制項需要整排寬度（漸層預覽條 + 停駐點清單），
    // 不適合塞進標準的「標籤＋控制項」單行版面，獨立處理。
    if (def.uiType === "colorramp") {
      const block = document.createElement("div");
      block.className = "node-row colorramp-row";
      const label = document.createElement("span");
      label.className = "row-label";
      label.textContent = tBi(def.label);
      applyTermHint(label, def.key);
      block.appendChild(label);
      block.appendChild(buildColorRampControl(node, def, onParamChange));
      body.appendChild(block);
      continue;
    }
    if (def.uiType === "curve") {
      const block = document.createElement("div");
      block.className = "node-row colorramp-row";
      const label = document.createElement("span");
      label.className = "row-label";
      label.textContent = tBi(def.label);
      applyTermHint(label, def.key);
      block.appendChild(label);
      block.appendChild(buildCurveControl(node, def, onParamChange));
      body.appendChild(block);
      continue;
    }
    const row = document.createElement("div");
    row.className = "node-row setting-row";
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = tBi(def.label);
    applyTermHint(label, def.key);
    row.appendChild(label);
    if (def.uiType === "select") row.appendChild(buildSelectSetting(node, def, onParamChange));
    else if (def.uiType === "color") row.appendChild(buildColorControl(node, def, onParamChange));
    else if (def.uiType === "image") row.appendChild(buildImageSetting(node, def, onParamChange));
    else if (def.uiType === "float") row.appendChild(buildFloatControl(node, def, onParamChange));
    else if (def.uiType === "bool") row.appendChild(buildBoolControl(node, def, onParamChange));
    body.appendChild(row);

    // 混合模式的直觀示意圖：獨立一整排放在下拉選單正下方，選單一改就同步更新。
    if (def.uiType === "select" && def.previewBlend) {
      const preview = buildBlendPreview(node, def);
      const select = row.querySelector("select");
      select.addEventListener("change", () => preview.__updateBlendPreview());
      body.appendChild(preview);
    }
    // 形狀/圖樣的直觀示意圖（例如漸變紋理的類型），用法跟上面混合模式示意圖一致。
    if (def.uiType === "select" && def.previewShape) {
      const preview = buildShapePreview(node, def);
      const select = row.querySelector("select");
      select.addEventListener("change", () => preview.__updateShapePreview());
      body.appendChild(preview);
    }
  }

  for (const def of typeDef.inputs) {
    const row = document.createElement("div");
    row.className = "node-row input-row";
    const socket = document.createElement("div");
    socket.className = `socket socket-in type-${def.type}${connectedInputKeys.has(def.key) ? " connected" : ""}`;
    socket.dataset.nodeId = node.id;
    socket.dataset.socketKey = def.key;
    socket.dataset.dir = "in";
    socket.dataset.type = def.type;
    socket.title = socketTitle(resolveLabel(def.label, node.params), def.type, "in");
    socket.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      onSocketPointerDown(e, node.id, def.key, "in", def.type);
    });
    socket.addEventListener("pointerup", (e) => {
      e.stopPropagation();
      onSocketPointerUp(e, node.id, def.key, "in");
    });
    row.appendChild(socket);
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = tBi(resolveLabel(def.label, node.params));
    applyTermHint(label, def.key);
    row.appendChild(label);

    if (!connectedInputKeys.has(def.key)) {
      if (def.type === "float") row.appendChild(buildFloatControl(node, def, onParamChange));
      else if (def.type === "color") row.appendChild(buildColorControl(node, def, onParamChange));
      else if (def.type === "vector" && (def.default === "UV" || def.default === "NORMAL")) {
        // "UV"/"NORMAL" 是特殊字串常數（見 socketTypes.js 的 literalExpr），代表「沒接線時用畫面 UV／
        // 目前的著色法線」，不是真的 [x,y,z] 陣列——絕對不能丟進 buildVectorControl，
        // 那邊會直接對字串做索引（"NORMAL"[0] === "N"）、存回 params 後把陣列弄壞成
        // 數字/字元混雜的垃圾值（例如 [0.5, "O", "R", "M", "A", "L"]），下游的 glslFloat()
        // 又會把非數字字元靜默 fallback 成 0，不會噴錯，但材質會悄悄跑出錯誤的方向。
        // 只在這裡顯示一個唯讀提示文字，不給輸入框。
        const hint = document.createElement("span");
        hint.className = "row-hint";
        hint.textContent = def.default;
        row.appendChild(hint);
      } else if (def.type === "vector") {
        row.appendChild(buildVectorControl(node, def, onParamChange));
      }
    }
    body.appendChild(row);
  }

  for (const def of typeDef.outputs) {
    const row = document.createElement("div");
    row.className = "node-row output-row";
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = tBi(resolveLabel(def.label, node.params));
    applyTermHint(label, def.key);
    row.appendChild(label);
    const socket = document.createElement("div");
    socket.className = `socket socket-out type-${def.type}`;
    socket.dataset.nodeId = node.id;
    socket.dataset.socketKey = def.key;
    socket.dataset.dir = "out";
    socket.dataset.type = def.type;
    socket.title = socketTitle(resolveLabel(def.label, node.params), def.type, "out");
    socket.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      onSocketPointerDown(e, node.id, def.key, "out", def.type);
    });
    socket.addEventListener("pointerup", (e) => {
      e.stopPropagation();
      onSocketPointerUp(e, node.id, def.key, "out");
    });
    row.appendChild(socket);
    body.appendChild(row);
  }

  el.appendChild(body);
  return el;
}

// 節點百科用的唯讀說明卡片（任務 #5 會再擴充樣式，這裡先提供基本可用版本）。
export function renderNodeDoc(typeDef, lang, container) {
  container.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = tBi(typeDef.name);
  container.appendChild(title);

  const summary = document.createElement("p");
  summary.textContent = glossNodeNames(tBi(typeDef.summary), lang);
  container.appendChild(summary);

  if (!typeDef.supported) {
    const badge = document.createElement("div");
    badge.className = "badge-unsupported";
    badge.textContent = t("encyclopedia.notSupportedYet") || "沙盒中尚未支援即時預覽";
    container.appendChild(badge);
  }

  // 百科頁是靜態文件、沒有實際的節點實例可讀 params，用各設定項的預設值
  // 組一份「預設狀態」的假 params，讓標籤會隨模式變化的節點（如 Combine/Separate Color）
  // 至少顯示預設模式（RGB）下該有的名稱，而不是空白。
  const defaultParams = {};
  for (const s of typeDef.settings || []) defaultParams[s.key] = s.default;

  const ioTitle = document.createElement("h4");
  ioTitle.textContent = lang === "zh" ? "插槽 Sockets" : "Sockets";
  container.appendChild(ioTitle);
  const table = document.createElement("table");
  table.className = "io-table";
  for (const def of typeDef.inputs) {
    table.appendChild(ioRow("IN", def));
  }
  for (const def of typeDef.outputs) {
    table.appendChild(ioRow("OUT", def));
  }
  container.appendChild(table);

  const beginnerTip = document.createElement("div");
  beginnerTip.className = "tip-beginner";
  beginnerTip.textContent = glossNodeNames(tBi(typeDef.docBeginner), lang);
  container.appendChild(beginnerTip);

  const proTip = document.createElement("div");
  proTip.className = "tip-pro";
  proTip.textContent = glossNodeNames(tBi(typeDef.docPro), lang);
  container.appendChild(proTip);

  function ioRow(dir, def) {
    const tr = document.createElement("tr");
    const tdDir = document.createElement("td");
    tdDir.textContent = dir;
    const tdDot = document.createElement("td");
    tdDot.innerHTML = `<span class="dot" style="background:var(--sock-${def.type})"></span>`;
    const tdName = document.createElement("td");
    tdName.textContent = tBi(resolveLabel(def.label, defaultParams));
    tr.append(tdDir, tdDot, tdName);
    return tr;
  }
}
