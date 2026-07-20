import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

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
  steps: [
    {
      title: { zh: "第一步：加入波長節點", en: "Step 1: Add a Wavelength Node" },
      instruction: {
        zh: "從「轉換器 Converter」分類拖入波長（Wavelength）節點。預設 500nm 大約是綠光。",
        en: "Drag in a Wavelength node from the Converter category. The default 500nm is roughly green light.",
      },
      check: (graph) => hasNodeOfType(graph, "converter_wavelength"),
    },
    {
      title: { zh: "第二步：加入發光並接到輸出", en: "Step 2: Add Emission and Connect to Output" },
      instruction: {
        zh: "拖入發光（Emission）節點，接到材質輸出（Material Output）的表面（Surface）。",
        en: "Drag in an Emission node and connect it to Material Output's Surface.",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_emission"),
    },
    {
      title: { zh: "第三步：把波長接到發光顏色", en: "Step 3: Feed Wavelength Into Emission's Color" },
      instruction: {
        zh: "把波長節點的顏色（Color）輸出接到發光的顏色（Color）。",
        en: "Connect the Wavelength node's Color output to Emission's Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_wavelength", "color", "shader_emission", "color"),
    },
    {
      title: { zh: "第四步：調到紅色雷射的波長", en: "Step 4: Dial In a Red Laser's Wavelength" },
      instruction: {
        zh: "把波長（Wavelength）調到 630-700nm 之間——常見紅光雷射筆的波長範圍。顏色應該會變成飽和的紅色。\n\n試著調到 450nm 看看藍光、580nm 看看黃光。",
        en: "Set Wavelength between 630-700nm — the range of a common red laser pointer. The color should turn a saturated red.\n\nTry 450nm for blue or 580nm for yellow.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_wavelength", "wavelength", (v) => typeof v === "number" && v >= 620 && v <= 700),
    },
  ],
};
