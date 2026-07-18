// 依 data/presets/searchIndex.js 裡的 { id, file } 動態載入單一預設材質的完整節點圖，
// 讓「只需要少數幾個/使用者選到才需要」完整節點圖的頁面（首頁畫廊、沙盒）不用像
// data/presets/index.js 那樣一次靜態 import 全部 62 個檔案。file 欄位不能用 `${id}.js`
// 假設（少數檔名跟 id 對不上，例如 metal.js 匯出的 id 是 "brushed_metal"），是
// scripts/generate-search-index.mjs 從 data/presets/index.js 的 import 語句解析出來的。
const graphCache = new Map();

export async function loadPresetGraph(preset) {
  if (graphCache.has(preset.id)) return graphCache.get(preset.id);
  const mod = await import(`../../data/presets/${preset.file}`);
  const graph = mod.default.graph;
  graphCache.set(preset.id, graph);
  return graph;
}
