// 一個可以關閉、關掉後不會再出現的小提示條，說明節點編輯器的操作方式
// （中鍵平移、框選、點選放置節點等），這些手勢沒用過 Blender 的人不會自己猜到。
import { getLang } from "../i18n.js";

const DISMISS_KEY = "bml_controls_hint_dismissed";

const TEXT = {
  zh: "操作提示：中鍵/空白鍵+左鍵拖曳＝平移・滾輪＝縮放・左鍵拖曳空白處＝框選・右鍵拖曳＝剪斷電線・拖曳已接線的插槽＝斷開重接・Shift+D＝複製選取節點・Home＝縮放至全部可見・數值欄位可左右拖曳調整",
  en: "Controls: middle/space+left-drag to pan · wheel to zoom · left-drag empty space to box-select · right-drag to cut wires · drag a connected socket to detach & rewire · Shift+D to duplicate · Home to frame all · drag a number field to scrub it",
};

export function mountControlsHint(container) {
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
  } catch {
    // 存取被封鎖就當作「使用者沒關過」處理，頂多每次都顯示一次提示條，不影響其他功能。
  }
  const bar = document.createElement("div");
  bar.className = "controls-hint";
  const span = document.createElement("span");
  span.textContent = `💡 ${TEXT[getLang()] || TEXT.zh}`;
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "controls-hint-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // 存不進去就算了，這個關閉動作只影響「下次還會不會再看到」這個小提示。
    }
    bar.remove();
  });
  bar.appendChild(span);
  bar.appendChild(closeBtn);
  container.appendChild(bar);
}
