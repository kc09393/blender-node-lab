// 手機版導覽列漢堡選單。窄螢幕下「首頁/節點百科/自由沙盒/引導教學/參考表/疑難排解」六個
// 連結＋搜尋＋語言切換塞不進一行，原本的做法是讓 nav 本身橫向捲動（overflow-x:auto），
// 但沒有任何提示告訴使用者「還可以往右滑」，大部分連結因此形同看不到、點不到
// （使用者截圖回報「上面那部份很難操作」，實測就是這個問題）。改成常見的漢堡選單：
// 點開變成從上往下展開的選單，六個連結都攤開來，不用猜有沒有更多內容。
export function initMobileNav() {
  const header = document.querySelector(".site-nav");
  const nav = header ? header.querySelector("nav") : null;
  if (!header || !nav) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "nav-toggle";
  toggle.setAttribute("aria-label", "選單 / Menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "☰";
  header.insertBefore(toggle, nav);

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  }
  function toggleNav() {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "✕" : "☰";
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNav();
  });
  // 點了選單裡的連結（通常會直接跳轉頁面）先把選單收起來，避免跳轉動畫/轉場過程中
  // 選單還攤開著很奇怪；就算是點到目前頁面本身的連結（不會真的跳轉），收起來也是對的。
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNav();
  });
  // 點選單外面任何地方＝收起來，是這類下拉選單的標準手感。
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && e.target !== toggle) closeNav();
  });
  // 從窄螢幕轉回寬螢幕（例如手機轉橫向、或平板分割畫面調整）時，桌面版 CSS 會讓 nav
  // 變回本來的橫排樣式，但如果選單當下是「展開」狀態，.open 這個 class 沒清掉的話，
  // 下次切回窄螢幕會顯示成已經展開的樣子，不是預期的「每次都從收起狀態開始」。
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNav();
  });
}
