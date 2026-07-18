// 自訂顏色選取器：取代瀏覽器原生 <input type="color">。原生選取器的彈出視窗完全由瀏覽器/
// 作業系統決定樣式與版面，網站沒有任何控制權——這正是「節點內容要跟 Blender 一致」這個持續
// 反饋的其中一個真實缺口：原生選取器（Chromium 版本長得像滴管+色相圓+RGB 數字方塊）跟
// Blender 自己的 HSV 方塊+色相滑桿+Hex+RGB 介面完全是兩回事。這裡自己畫一個 SV 方塊
// （飽和度/明度）+ 色相滑桿 + Hex + RGB 欄位，風格比照本站深色主題，同時支援滑鼠跟觸控拖曳
// （沿用 nodeEditor.js 觸控手勢那批改動同一套 Pointer Events 邏輯）。

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (((i % 6) + 6) % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function rgbToHex(r, g, b) {
  const to = (c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0");
  return `${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function hexToRgbArr(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "").padEnd(6, "0").slice(0, 6);
  const n = parseInt(clean, 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let activePicker = null;
let outsideHandler = null;
let keyHandler = null;
let returnFocusTo = null;

export function closeColorPicker() {
  if (!activePicker) return;
  activePicker.remove();
  activePicker = null;
  if (outsideHandler) document.removeEventListener("pointerdown", outsideHandler, true);
  if (keyHandler) document.removeEventListener("keydown", keyHandler, true);
  outsideHandler = null;
  keyHandler = null;
  // 彈出視窗掛在 document.body 底下、跟觸發它的色塊在 DOM 順序上完全不相鄰，關閉時如果不主動把
  // focus 還給色塊按鈕，鍵盤使用者的焦點會直接掉到 <body>，等於瞬間失去目前所在位置的追蹤。
  if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
  returnFocusTo = null;
}

// anchorEl：觸發的色塊本身，用來定位彈出視窗；rgb：目前顏色 [r,g,b]（0-1，不處理 alpha——
// alpha 沿用各節點原本各自獨立的欄位/邏輯，例如 Color Ramp 停駐點自己的 Alpha 數字欄，
// 這個元件只負責 RGB，不要把兩件事混在一起）；onChange(rgbArray) 在每次拖曳/打字當下即時呼叫。
export function openColorPicker(anchorEl, rgb, onChange) {
  closeColorPicker();
  returnFocusTo = anchorEl;
  // 定位用的錨點座標一定要在這裡、現在就抓下來——往下 updateOutputs() 會在視窗都還沒定位前就
  // 先同步呼叫一次 onChange()（單純為了把目前顏色回報給呼叫端，不是使用者真的動了什麼），
  // 而顏色漸變的停駐點呼叫端（nodeCard.js 的 commit()）收到後會同步整個重畫停駐點列表，
  // 原本傳進來的 anchorEl（那顆色塊按鈕）當下就被換成一顆全新的 DOM 元素、從文件裡拔掉了。
  // 如果 positionPopover 到時候才去查 anchorEl.getBoundingClientRect()，量到的會是「已經不在
  // 文件裡的元素」永遠回傳全 0 的矩形，視窗就會被夾到左上角 (8,8)——這裡先把當下還沒被替換掉、
  // 貨真價實貼著色塊的座標存起來，之後定位只認這份快照，不管錨點後來有沒有被換掉。
  const anchorRect = anchorEl.getBoundingClientRect();
  let [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);

  const pop = document.createElement("div");
  pop.className = "color-picker-popover";
  pop.addEventListener("pointerdown", (e) => e.stopPropagation());

  const svWrap = document.createElement("div");
  svWrap.className = "cp-sv-wrap";
  const svCanvas = document.createElement("canvas");
  svCanvas.className = "cp-sv";
  svCanvas.width = 180;
  svCanvas.height = 130;
  const svCtx = svCanvas.getContext("2d");
  const svCursor = document.createElement("div");
  svCursor.className = "cp-sv-cursor";
  svWrap.append(svCanvas, svCursor);

  const hueSlider = document.createElement("div");
  hueSlider.className = "cp-hue";
  const hueCursor = document.createElement("div");
  hueCursor.className = "cp-hue-cursor";
  hueSlider.appendChild(hueCursor);

  const previewRow = document.createElement("div");
  previewRow.className = "cp-preview-row";
  const preview = document.createElement("div");
  preview.className = "cp-preview";
  const hexRow = document.createElement("div");
  hexRow.className = "cp-hex-row";
  const hexHash = document.createElement("span");
  hexHash.className = "cp-hex-hash";
  hexHash.textContent = "#";
  const hexInput = document.createElement("input");
  hexInput.type = "text";
  hexInput.className = "cp-hex-input";
  hexInput.maxLength = 6;
  hexInput.spellcheck = false;
  hexRow.append(hexHash, hexInput);
  previewRow.append(preview, hexRow);

  if (window.EyeDropper) {
    const eyedropBtn = document.createElement("button");
    eyedropBtn.type = "button";
    eyedropBtn.className = "cp-eyedrop";
    eyedropBtn.title = "從螢幕取色 / Pick color from screen";
    eyedropBtn.textContent = "✛";
    eyedropBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    eyedropBtn.addEventListener("click", async () => {
      try {
        const ed = new window.EyeDropper();
        const result = await ed.open();
        const [r2, g2, b2] = hexToRgbArr(result.sRGBHex);
        [h, s, v] = rgbToHsv(r2, g2, b2);
        redrawSV();
        redrawHue();
        updateOutputs();
      } catch {
        // 使用者按 Escape 取消取色，或瀏覽器拒絕（非安全環境）——當作沒事發生，不用特別處理。
      }
    });
    previewRow.appendChild(eyedropBtn);
  }

  const rgbRow = document.createElement("div");
  rgbRow.className = "cp-rgb-row";
  const rWrap = document.createElement("div");
  const gWrap = document.createElement("div");
  const bWrap = document.createElement("div");
  const rInput = document.createElement("input");
  const gInput = document.createElement("input");
  const bInput = document.createElement("input");
  [
    [rWrap, rInput, "R"],
    [gWrap, gInput, "G"],
    [bWrap, bInput, "B"],
  ].forEach(([wrap, inp, label]) => {
    inp.type = "number";
    inp.min = 0;
    inp.max = 255;
    inp.step = 1;
    inp.className = "cp-rgb-input";
    const lab = document.createElement("label");
    lab.textContent = label;
    wrap.className = "cp-rgb-field";
    wrap.append(inp, lab);
    rgbRow.appendChild(wrap);
  });

  pop.append(svWrap, hueSlider, previewRow, rgbRow);
  document.body.appendChild(pop);
  activePicker = pop;

  function positionPopover() {
    const rect = anchorRect;
    const popRect = pop.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + popRect.width > window.innerWidth - 8) left = window.innerWidth - popRect.width - 8;
    if (top + popRect.height > window.innerHeight - 8) top = rect.top - popRect.height - 6;
    pop.style.left = `${Math.max(8, left)}px`;
    pop.style.top = `${Math.max(8, top)}px`;
  }

  function redrawSV() {
    const [hr, hg, hb] = hsvToRgb(h, 1, 1);
    svCtx.fillStyle = `rgb(${Math.round(hr * 255)},${Math.round(hg * 255)},${Math.round(hb * 255)})`;
    svCtx.fillRect(0, 0, svCanvas.width, svCanvas.height);
    const whiteGrad = svCtx.createLinearGradient(0, 0, svCanvas.width, 0);
    whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
    whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
    svCtx.fillStyle = whiteGrad;
    svCtx.fillRect(0, 0, svCanvas.width, svCanvas.height);
    const blackGrad = svCtx.createLinearGradient(0, 0, 0, svCanvas.height);
    blackGrad.addColorStop(0, "rgba(0,0,0,0)");
    blackGrad.addColorStop(1, "rgba(0,0,0,1)");
    svCtx.fillStyle = blackGrad;
    svCtx.fillRect(0, 0, svCanvas.width, svCanvas.height);
    svCursor.style.left = `${s * svCanvas.width}px`;
    svCursor.style.top = `${(1 - v) * svCanvas.height}px`;
  }

  function redrawHue() {
    hueCursor.style.left = `${h * 100}%`;
  }

  function updateOutputs(skip) {
    const [r, g, b] = hsvToRgb(h, s, v);
    preview.style.background = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    if (skip !== "hex") hexInput.value = rgbToHex(r, g, b);
    if (skip !== "rgb") {
      rInput.value = Math.round(r * 255);
      gInput.value = Math.round(g * 255);
      bInput.value = Math.round(b * 255);
    }
    onChange([r, g, b]);
  }

  redrawSV();
  redrawHue();
  updateOutputs();
  requestAnimationFrame(positionPopover);
  // SV 方塊／色相滑桿是純滑鼠/觸控拖曳的 div，沒有鍵盤操作方式，所以鍵盤使用者的入口是
  // Hex 欄位——開啟當下就把 focus 移進去，不然 focus 會停在觸發用的色塊按鈕上，
  // 而彈出視窗是掛在 document.body 最後面、跟色塊在 DOM 順序上不相鄰，
  // 按 Tab 只會跳到色塊之後的下一個節點欄位，彈出視窗形同鍵盤完全打不開。
  requestAnimationFrame(() => hexInput.focus());

  let draggingSV = false;
  function setSVFromEvent(e) {
    const rect = svCanvas.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = clamp01((e.clientY - rect.top) / rect.height);
    s = x;
    v = 1 - y;
    svCursor.style.left = `${s * svCanvas.width}px`;
    svCursor.style.top = `${(1 - v) * svCanvas.height}px`;
    updateOutputs();
  }
  svWrap.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    draggingSV = true;
    // setPointerCapture 在少數情況（例如這根手指/游標的 pointer session 已經結束）會直接
    // throw，沒包 try/catch 的話這行以下（包含真正更新顏色的 setSVFromEvent）整段都不會
    // 執行——使用者會覺得「點了但完全沒反應」，而且不會有任何看得到的錯誤訊息。跟下面
    // pointerup 的 releasePointerCapture 用同一套防呆。
    try { svWrap.setPointerCapture(e.pointerId); } catch { /* 沒有有效的 pointer session 可以捕獲，忽略即可 */ }
    setSVFromEvent(e);
  });
  svWrap.addEventListener("pointermove", (e) => {
    if (draggingSV) setSVFromEvent(e);
  });
  svWrap.addEventListener("pointerup", (e) => {
    draggingSV = false;
    try { svWrap.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  });

  let draggingHue = false;
  function setHueFromEvent(e) {
    const rect = hueSlider.getBoundingClientRect();
    h = clamp01((e.clientX - rect.left) / rect.width);
    redrawHue();
    redrawSV();
    updateOutputs();
  }
  hueSlider.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    draggingHue = true;
    try { hueSlider.setPointerCapture(e.pointerId); } catch { /* 沒有有效的 pointer session 可以捕獲，忽略即可 */ }
    setHueFromEvent(e);
  });
  hueSlider.addEventListener("pointermove", (e) => {
    if (draggingHue) setHueFromEvent(e);
  });
  hueSlider.addEventListener("pointerup", (e) => {
    draggingHue = false;
    try { hueSlider.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  });

  hexInput.addEventListener("pointerdown", (e) => e.stopPropagation());
  hexInput.addEventListener("change", () => {
    const [r2, g2, b2] = hexToRgbArr(hexInput.value);
    [h, s, v] = rgbToHsv(r2, g2, b2);
    redrawSV();
    redrawHue();
    updateOutputs("hex");
  });

  [rInput, gInput, bInput].forEach((inp) => {
    inp.addEventListener("pointerdown", (e) => e.stopPropagation());
    inp.addEventListener("change", () => {
      const r2 = clamp01((parseInt(rInput.value, 10) || 0) / 255);
      const g2 = clamp01((parseInt(gInput.value, 10) || 0) / 255);
      const b2 = clamp01((parseInt(bInput.value, 10) || 0) / 255);
      [h, s, v] = rgbToHsv(r2, g2, b2);
      redrawSV();
      redrawHue();
      updateOutputs("rgb");
    });
  });

  // 用 setTimeout(0) 才掛外部關閉監聽：避免觸發這次 openColorPicker() 的那個 click/pointerdown
  // 事件（例如點色塊本身）在冒泡完成前就被這個新掛上的監聽器立刻判定成「點在外面」而秒關。
  setTimeout(() => {
    outsideHandler = (e) => {
      if (activePicker && !activePicker.contains(e.target)) closeColorPicker();
    };
    keyHandler = (e) => {
      if (e.key === "Escape") {
        closeColorPicker();
        return;
      }
      if (e.key !== "Tab") return;
      // 把 Tab 循環鎖在彈出視窗內（跟色塊按鈕不相鄰、掛在 body 最後面，放任瀏覽器預設 Tab
      // 順序會直接跳出視窗、跑到頁面其他地方去）。焦點目前不在視窗內時（例如使用者用滑鼠
      // 點了視窗外但還沒觸發 outsideHandler 的極短暫窗口）就不攔截，避免意外把焦點搶走。
      if (!activePicker || !activePicker.contains(document.activeElement)) return;
      const focusables = [...activePicker.querySelectorAll("input, button")].filter(
        (el) => !el.disabled && el.tabIndex !== -1
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("pointerdown", outsideHandler, true);
    document.addEventListener("keydown", keyHandler, true);
  }, 0);
}
