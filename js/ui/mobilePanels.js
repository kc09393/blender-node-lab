// 手機/窄螢幕的面板切換：沙盒跟教學頁共用同一套三面板版面（節點面板／畫布／預覽+屬性），
// 桌面寬度時三個面板並排顯示，但窄螢幕塞不下，改成一次只顯示一個面板、用分頁按鈕切換。
// 分頁按鈕本身平常也存在於 DOM 裡（不是 JS 動態插入），只靠 CSS 的 @media (max-width) 決定
// 要不要顯示，跟這個網站其他地方「窄螢幕才出現的 UI」同一套做法。
export function initMobilePanelTabs(bodyEl) {
  const tabs = bodyEl.querySelectorAll(".mobile-panel-tab");
  if (tabs.length === 0) return;
  function setActive(panel) {
    bodyEl.dataset.mobilePanel = panel;
    for (const tab of tabs) tab.classList.toggle("active", tab.dataset.panel === panel);
  }
  for (const tab of tabs) {
    tab.addEventListener("click", () => setActive(tab.dataset.panel));
  }
  setActive(bodyEl.dataset.mobilePanel || "canvas");
}
