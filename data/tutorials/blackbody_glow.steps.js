import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入 Blackbody 節點", en: "Step 1: Add a Blackbody Node" },
      instruction: {
        zh: "從「轉換器 Converter」分類拖入黑體（Blackbody）節點。色溫（Temperature）預設是 5500K（接近正午日光）。",
        en: "Drag in a Blackbody node from the Converter category. Temperature defaults to 5500K (close to midday daylight).",
      },
      check: (graph) => hasNodeOfType(graph, "converter_blackbody"),
    },
    {
      title: { zh: "第二步：加入 Emission 並接到輸出", en: "Step 2: Add Emission and Connect to Output" },
      instruction: {
        zh: "拖入發光（Emission）節點，接到材質輸出（Material Output）的表面（Surface）。",
        en: "Drag in an Emission node and connect it to Material Output's Surface.",
      },
      check: (graph) => nodeHasIncomingFromType(graph, "output_material", "shader_emission"),
    },
    {
      title: { zh: "第三步：把 Blackbody 接到 Emission 的顏色", en: "Step 3: Feed Blackbody Into Emission's Color" },
      instruction: {
        zh: "把黑體（Blackbody）的顏色（Color）輸出接到發光（Emission）的顏色（Color）。",
        en: "Connect Blackbody's Color output to Emission's Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_blackbody", "color", "shader_emission", "color"),
    },
    {
      title: { zh: "第四步：調到燭光的色溫", en: "Step 4: Dial In Candlelight's Temperature" },
      instruction: {
        zh: "把色溫（Temperature）調到 1800-2200K 之間——真實蠟燭火焰的色溫。顏色應該會變成明顯的暖橘色，跟預設的白光完全不同。",
        en: "Set Temperature between 1800-2200K — the color temperature of a real candle flame. The color should shift to an obvious warm orange, very different from the default white.",
      },
      check: (graph) => anyNodeParamMatches(graph, "converter_blackbody", "temperature", (v) => typeof v === "number" && v >= 1500 && v <= 2500),
    },
  ],
};
