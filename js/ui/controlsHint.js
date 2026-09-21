// 一個可以關閉、關掉後不會再出現的小提示條，說明節點編輯器的操作方式
// （中鍵平移、框選、點選放置節點等），這些手勢沒用過 Blender 的人不會自己猜到。
import { getLang } from "../i18n.js";

const DISMISS_KEY = "bml_controls_hint_dismissed";

const TEXT = {
  zh: "Blender 操作：Shift+A 新增・拖曳插槽接線・中鍵平移・滾輪縮放・A 全選・X/Delete 刪除・Shift+D 複製・Home 全覽・Ctrl+右鍵拖曳剪線",
  en: "Blender controls: Shift+A add · drag sockets to connect · middle-drag pan · wheel zoom · A select all · X/Delete remove · Shift+D duplicate · Home frame all · Ctrl+right-drag cut links",
};

// 觸控裝置沒有中鍵/右鍵/實體鍵盤，上面那組滑鼠慣例的提示文字完全用不上，改用觸控手勢
// 的版本——單指的拖節點/框選/拉線邏輯不變（Pointer Events 本來就跟滑鼠共用），只有
// 平移縮放（改兩指）、剪線/複製/刪除/縮放至全部（改用工具列按鈕，見 sandbox.html 的
// 🗑/⧉/⤢ 按鈕）需要另外講。用 `pointer: coarse` 判斷，跟 CSS 那邊放大 socket 判定區
// 用的是同一個訊號，語意一致。
const TOUCH_TEXT = {
  zh: "操作提示：單指拖曳節點/接線・雙指拖曳＝平移・雙指開合＝縮放・點一下節點/電線再用上方按鈕刪除・複製・縮放至全部",
  en: "Controls: 1-finger drag to move a node or draw a wire · 2-finger drag to pan · pinch to zoom · tap a node/wire then use the Delete/Duplicate/Frame All buttons above",
};

function isTouchDevice() {
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

export function mountControlsHint(container) {
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
  } catch {
    // 存取被封鎖就當作「使用者沒關過」處理，頂多每次都顯示一次提示條，不影響其他功能。
  }
  const bar = document.createElement("div");
  bar.className = "controls-hint";
  const span = document.createElement("span");
  const refreshText = () => {
    const dict = isTouchDevice() ? TOUCH_TEXT : TEXT;
    span.textContent = `💡 ${dict[getLang()] || dict.zh}`;
  };
  refreshText();
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "controls-hint-close";
  closeBtn.textContent = "×";
  const onLangChange = () => refreshText();
  closeBtn.addEventListener("click", () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // 存不進去就算了，這個關閉動作只影響「下次還會不會再看到」這個小提示。
    }
    // 這個提示條沒有其他地方會呼叫 langchange 幫它重繪文字（沙盒/教學頁各自的 langchange
    // 監聽只顧得到節點面板/節點編輯器本身），只能自己訂閱自己更新；使用者關掉之後這個
    // DOM 元素就沒用了，記得把監聽器也一併解掉，不然會一直留著跟著切語言空轉。
    document.removeEventListener("langchange", onLangChange);
    bar.remove();
  });
  document.addEventListener("langchange", onLangChange);
  bar.appendChild(span);
  bar.appendChild(closeBtn);
  container.appendChild(bar);
}
