export default {
  id: "tutorial_wavelength_spectrum",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "波長節點：雷射光譜色", en: "Wavelength Node: Laser Spectrum Colors" },
  description: {
    zh: "波長（Wavelength）節點把可見光的物理波長（奈米）直接轉成對應的 RGB 顏色，常用來模擬雷射光或稜鏡色散這種需要物理精確光色的場合。",
    en: "The Wavelength node converts a visible-light wavelength (in nanometers) directly into the corresponding RGB color — useful for simulating lasers or prism dispersion where physically accurate coloring matters.",
  },
  startGraph: {
    nodes: [{ id: "t_wl_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_wl_out", typeId: "output_material", x: 700, y: 160, params: {} },
      { id: "te_wl_emission", typeId: "shader_emission", x: 400, y: 100, params: { strength: 4 } },
      { id: "te_wl_wavelength", typeId: "converter_wavelength", x: 100, y: 100, params: { wavelength: 650 } },
    ],
    links: [
      { id: "te_wl_l1", fromNode: "te_wl_emission", fromSocket: "bsdf", toNode: "te_wl_out", toSocket: "surface" },
      { id: "te_wl_l2", fromNode: "te_wl_wavelength", fromSocket: "color", toNode: "te_wl_emission", toSocket: "color" },
    ],
  },
  loadSteps: () => import("./wavelength_spectrum.steps.js").then((m) => m.default),
};
