import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_scene_time_pulse",
  level: { zh: "入門", en: "Beginner" },
  name: { zh: "Blender 5.2 場景時間：會呼吸的發光材質", en: "Blender 5.2 Scene Time: A Pulsing Emissive Material" },
  description: {
    zh: "用 Blender 5.2 LTS 新增的場景時間節點，把持續增加的時間轉成往復變化，做出有節奏的發光動畫。",
    en: "Use Blender 5.2 LTS's new Scene Time shader node to turn continuously increasing time into a repeating pulse for an animated emissive material.",
  },
  startGraph: {
    nodes: [
      { id: "t_st_out", typeId: "output_material", x: 900, y: 180, params: {} },
      { id: "t_st_emission", typeId: "shader_emission", x: 620, y: 140, params: { color: [0.05, 0.45, 1, 1], strength: 1 } },
    ],
    links: [{ id: "t_st_l1", fromNode: "t_st_emission", fromSocket: "bsdf", toNode: "t_st_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_st_out", typeId: "output_material", x: 1180, y: 180, params: {} },
      { id: "te_st_emission", typeId: "shader_emission", x: 900, y: 140, params: { color: [0.05, 0.45, 1, 1], strength: 1 } },
      { id: "te_st_range", typeId: "converter_map_range", x: 630, y: 260, params: { value: 0, fromMin: -1, fromMax: 1, toMin: 0.25, toMax: 5, steps: 4, interpolationType: "linear", clamp: true } },
      { id: "te_st_sine", typeId: "converter_math", x: 370, y: 260, params: { value1: 0, value2: 0, value3: 0, operation: "sine", clamp: false } },
      { id: "te_st_time", typeId: "input_scene_time", x: 120, y: 260, params: {} },
    ],
    links: [
      { id: "te_st_l1", fromNode: "te_st_emission", fromSocket: "bsdf", toNode: "te_st_out", toSocket: "surface" },
      { id: "te_st_l2", fromNode: "te_st_time", fromSocket: "seconds", toNode: "te_st_sine", toSocket: "value1" },
      { id: "te_st_l3", fromNode: "te_st_sine", fromSocket: "value", toNode: "te_st_range", toSocket: "value" },
      { id: "te_st_l4", fromNode: "te_st_range", fromSocket: "value", toNode: "te_st_emission", toSocket: "strength" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入場景時間", en: "Step 1: Add Scene Time" },
      instruction: {
        zh: "從「輸入 Input」拖入場景時間（Scene Time）。\n\n把秒數（Seconds）接到發光（Emission）的強度（Strength）。\n\n預覽會隨時間越來越亮，但還不會循環。",
        en: "Drag Scene Time from the Input category.\n\nConnect Seconds to Emission's Strength.\n\nThe preview gets brighter over time, but it does not loop yet.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_scene_time", "seconds", "shader_emission", "strength"),
    },
    {
      title: { zh: "第二步：用正弦做循環", en: "Step 2: Make It Loop with Sine" },
      instruction: {
        zh: "在中間加入數學（Math）節點，運算改成正弦（Sine）。\n\n改接成：秒數 → Sine → 發光強度。\n\nSine 會在 -1 到 1 之間往復，所以亮度開始呼吸式循環。",
        en: "Insert a Math node and set Operation to Sine.\n\nReconnect the chain as Seconds → Sine → Emission Strength.\n\nSine oscillates from -1 to 1, so the brightness starts pulsing.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_scene_time", "seconds", "converter_math", "value1") &&
        anyNodeParamMatches(graph, "converter_math", "operation", (v) => v === "sine"),
    },
    {
      title: { zh: "第三步：把亮度控制在合理範圍", en: "Step 3: Keep Brightness in a Useful Range" },
      instruction: {
        zh: "加入映射範圍（Map Range），放在 Sine 與發光強度之間。\n\n把來源範圍設為 -1 到 1，目標範圍設為 0.25 到 5，並開啟夾值（Clamp）。\n\n這樣就不會出現負亮度，發光會在可控的強弱之間循環。",
        en: "Insert Map Range between Sine and Emission Strength.\n\nSet From to -1..1, To to 0.25..5, and enable Clamp.\n\nThis removes negative brightness and keeps the pulse within a useful range.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "converter_math", "value", "converter_map_range", "value") &&
        hasLinkBetweenTypes(graph, "converter_map_range", "value", "shader_emission", "strength") &&
        anyNodeParamMatches(graph, "converter_map_range", "clamp", (v) => v === true),
    },
  ],
  quiz: [
    {
      question: { zh: "為什麼要在 Scene Time 後面加 Sine？", en: "Why add Sine after Scene Time?" },
      options: [
        { zh: "把一直增加的時間轉成往復循環", en: "To turn ever-increasing time into a repeating oscillation" },
        { zh: "把秒數轉成顏色", en: "To convert seconds directly into color" },
        { zh: "停止材質更新", en: "To stop the material from updating" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "Scene Time 持續增加；Sine 把它壓成 -1 到 1 間的週期波，再用 Map Range 轉成需要的數值範圍。",
        en: "Scene Time keeps increasing. Sine turns it into a periodic -1..1 wave, then Map Range converts that wave into the values the material needs.",
      },
    },
  ],
};
