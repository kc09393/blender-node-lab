export function nodeFidelity(node, lang = "zh") {
  const english = lang === "en";
  if (node.supported === false) {
    return english
      ? "Documentation only · requires Blender scene/render data"
      : "僅文件參考 · 需要 Blender 場景／渲染資料";
  }
  if (node.id === "output_material") {
    return english
      ? "Socket layout exact · Thickness is EEVEE-only · volume preview unsupported"
      : "插槽結構一致 · Thickness 僅 EEVEE · 體積預覽不支援";
  }
  if (["converter", "color"].includes(node.category)) {
    return english
      ? "Formula-aligned · final pixels still depend on color management"
      : "公式對齊 · 最終像素仍受色彩管理影響";
  }
  if (["texture", "vector"].includes(node.category)) {
    return english
      ? "Formula-aligned where documented · live raster preview"
      : "已記錄範圍內公式對齊 · 即時光柵預覽";
  }
  if (node.category === "shader") {
    return english
      ? "Blender sockets/defaults aligned · lighting is a Three.js approximation"
      : "Blender 插槽／預設值對齊 · 光照為 Three.js 近似";
  }
  return english
    ? "Blender structure aligned · scene-dependent behavior may differ"
    : "Blender 結構對齊 · 場景相依效果可能不同";
}
