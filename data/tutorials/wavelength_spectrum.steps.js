import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
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
