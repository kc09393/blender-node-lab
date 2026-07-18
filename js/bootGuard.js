// 刻意寫成「傳統 script」而不是 ES module，用 <script src="..."> (不加 type="module") 載入，
// 放在所有 <script type="module"> 之前。這樣即使之後的 ES module（例如從 CDN 載入 Three.js 失敗）
// 整組掛掉，這支 script 還是會先執行，watchdog 跟全域錯誤監聽才攔得到後續的失敗。
(function () {
  var shown = false;

  function showBanner(detail) {
    if (shown) return;
    shown = true;
    var el = document.createElement("div");
    el.id = "bml-boot-error";
    el.setAttribute(
      "style",
      "position:fixed;inset:0;z-index:99999;background:rgba(27,27,30,0.96);color:#f0f0f2;" +
        "display:flex;align-items:center;justify-content:center;padding:24px;" +
        "font-family:system-ui,-apple-system,'Segoe UI',sans-serif;text-align:center;"
    );
    var safeDetail = detail ? String(detail).replace(/</g, "&lt;").slice(0, 300) : "";
    el.innerHTML =
      '<div style="max-width:480px;">' +
      '<h2 style="margin:0 0 12px;font-size:20px;">網站載入時發生問題</h2>' +
      '<p style="margin:0 0 10px;line-height:1.7;color:#c7c7cf;font-size:14px;">' +
      "可能是網路連線不穩定（本站需要從 CDN 載入 Three.js），或瀏覽器不支援必要功能（WebGL2）。" +
      "請檢查網路連線後重新整理頁面；若持續發生，請改用最新版 Chrome / Edge / Firefox 再試一次。</p>" +
      '<p style="margin:0 0 16px;line-height:1.6;color:#8d8d97;font-size:12px;">' +
      "Something went wrong loading the page — possibly a network issue (this site loads Three.js from a CDN) " +
      "or missing WebGL2 support. Check your connection and reload, or try the latest Chrome / Edge / Firefox.</p>" +
      (safeDetail ? '<p style="font-size:11px;color:#6a6a72;word-break:break-all;">' + safeDetail + "</p>" : "") +
      '<button onclick="location.reload()" style="margin-top:8px;padding:8px 20px;border-radius:6px;border:1px solid #44444c;background:#35353c;color:#f0f0f2;cursor:pointer;font-size:13px;">重新整理頁面 / Reload</button>' +
      "</div>";
    document.body.appendChild(el);
  }

  window.__bmlShowBootError = showBanner;

  // 這裡用 capture（第三個參數 true）而不是預設的 bubble 階段：
  // 像「從 CDN 載入 three.js 失敗」這種資源載入錯誤，是發生在個別 <script> 元素上、
  // 不會冒泡到 window，只有在 capture 階段才攔得到；一般的程式執行期錯誤兩種階段都攔得到。
  window.addEventListener(
    "error",
    function (e) {
      var detail = e.message || (e.error && e.error.message) || (e.target && e.target.src ? "resource failed: " + e.target.src : "");
      showBanner(detail);
    },
    true
  );
  window.addEventListener("unhandledrejection", function (e) {
    var reason = e.reason;
    showBanner((reason && reason.message) || String(reason || ""));
  });

  window.__bmlHasWebGL2 = (function () {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && c.getContext("webgl2"));
    } catch (err) {
      return false;
    }
  })();
})();
