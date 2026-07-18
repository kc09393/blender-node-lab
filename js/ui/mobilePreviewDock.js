// 手機版把「即時預覽」的 Three.js canvas 從側邊欄搬到浮在畫布分頁右下角的小視窗，
// 讓使用者在「畫布」分頁接線/調參數的當下，不用切到「預覽/屬性」分頁也能立刻看到結果。
//
// 直接搬移 preview-container 這個 DOM 節點本身（appendChild 到不同父層），不是另外
// 建立第二個 Preview3D／WebGL context——手機 GPU 資源有限，畫兩份即時渲染既浪費效能，
// 兩邊也可能因為渲染時序不同而暫時不同步。WebGL context 掛在 canvas 元素本身，搬移
// 父層不會遺失渲染狀態；Preview3D 建構時用 ResizeObserver 觀察的是這個 container 元素
// 的參照本身（見 js/ui/preview3d.js），跟它目前實際被誰收留無關，搬完之後尺寸一變
// 就會自動觸發 _resize()，這裡不用另外手動呼叫。
const MOBILE_BREAKPOINT = 860; // 需跟 css/sandbox.css 的 @media (max-width: 860px) 斷點一致

export function initMobilePreviewDock(bodyEl, previewContainerEl, miniSlotEl) {
  if (!bodyEl || !previewContainerEl || !miniSlotEl) return;
  const dockedParentEl = previewContainerEl.parentElement;
  if (!dockedParentEl) return;

  function place() {
    const wantMini = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
      && bodyEl.dataset.mobilePanel === "canvas";
    const target = wantMini ? miniSlotEl : dockedParentEl;
    if (previewContainerEl.parentElement !== target) target.appendChild(previewContainerEl);
  }

  place();
  window.addEventListener("resize", place);
  new MutationObserver(place).observe(bodyEl, { attributes: true, attributeFilter: ["data-mobile-panel"] });
}
