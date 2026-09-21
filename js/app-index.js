import { initLangToggle, t } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { initMobileNav } from "./ui/mobileNav.js";

initLangToggle();
initMobileNav();
initGlobalSearch();

// 首頁先顯示已產生的靜態材質圖，避免手機首屏為了裝飾性預覽立刻下載 Three.js、建立 WebGL
// context 並持續耗電。桌面會在閒置時升級成互動 3D；手機與省流量模式則由使用者主動啟用。
const HERO_PRESET_ID = "peacock_feather";
let heroPreview = null;
let heroPreviewPromise = null;
async function initHeroPreview() {
  if (heroPreviewPromise) return heroPreviewPromise;
  const container = document.getElementById("hero-preview-container");
  if (!container) return null;
  const enableButton = document.getElementById("hero-enable-3d");
  enableButton.disabled = true;
  enableButton.textContent = t("landing.loading3d");
  heroPreviewPromise = (async () => {
    try {
      const [{ Preview3D }, compiler, { Graph }, { default: presets }] = await Promise.all([
        import("./ui/preview3d.js"),
        import("./core/compiler.js"),
        import("./core/graphModel.js"),
        import("../data/presets/index.js"),
      ]);
      heroPreview = new Preview3D(container);
      heroPreview.setMaterial(compiler.createPreviewMaterial());
      heroPreview.controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heroPreview.controls.autoRotateSpeed = 2.2;
      heroPreview.controls.enableZoom = false;
      heroPreview.renderer.domElement.style.touchAction = "pan-y";
      const preset = presets.find((item) => item.id === HERO_PRESET_ID) || presets[0];
      const graph = Graph.fromJSON(preset.graph);
      const result = compiler.compileGraph(graph);
      compiler.applyFragmentChunk(heroPreview.getMaterial(), graph, result);
      heroPreview._resize();
      heroPreview.renderer.render(heroPreview.scene, heroPreview.camera);
      container.classList.add("live");
      enableButton.hidden = true;
      return heroPreview;
    } catch (error) {
      console.error("首頁互動 3D 啟用失敗:", error);
      enableButton.disabled = true;
      enableButton.textContent = t("landing.unavailable3d");
      return null;
    }
  })();
  return heroPreviewPromise;
}

document.getElementById("hero-enable-3d")?.addEventListener("click", initHeroPreview);
const desktop = window.matchMedia("(min-width: 769px)").matches;
const saveData = navigator.connection?.saveData === true;
if (desktop && !saveData) {
  if (typeof requestIdleCallback === "function") requestIdleCallback(initHeroPreview, { timeout: 1800 });
  else setTimeout(initHeroPreview, 900);
}
