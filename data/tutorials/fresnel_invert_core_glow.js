import { hasLinkBetweenTypes, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_fresnel_invert_core_glow",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "菲涅爾反轉：核心發光、邊緣透明", en: "Inverting Fresnel: Glowing Core, Glassy Edge" },
  description: {
    zh: "菲涅爾（Fresnel）天生是「側邊掠視角度數值高、正對鏡頭數值低」——這剛好跟「正面看得到核心發光、側邊才露出玻璃反光」的需求完全相反。這篇教一個簡單但好用的技巧：用數學（Math）節點的「相減」算出「1 減菲涅爾」，直接把整條曲線上下反過來，霓虹燈管這種材質就是這樣做出來的。",
    en: "Fresnel is naturally high at grazing angles and low head-on — exactly backwards from what you want when the glowing core should show head-on and the glassy reflection should appear at the edges. This tutorial teaches a simple, reusable trick: use a Math node's Subtract operation to compute '1 minus Fresnel,' flipping the curve upside down. This is exactly how the Neon Glass Tube preset works.",
  },
  startGraph: {
    nodes: [
      { id: "t_ficg_out", typeId: "output_material", x: 600, y: 200, params: {} },
      { id: "t_ficg_glass", typeId: "shader_glass_bsdf", x: 320, y: 200, params: { color: [0.85, 0.95, 1, 1], roughness: 0.02, ior: 1.45 } },
    ],
    links: [{ id: "t_ficg_l1", fromNode: "t_ficg_glass", fromSocket: "bsdf", toNode: "t_ficg_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_ficg_out", typeId: "output_material", x: 1100, y: 260 },
      { id: "te_ficg_fresnel", typeId: "input_fresnel", x: 320, y: 60, params: { ior: 1.45 } },
      { id: "te_ficg_invert", typeId: "converter_math", x: 580, y: 60, params: { value1: 1, operation: "subtract" } },
      { id: "te_ficg_glass", typeId: "shader_glass_bsdf", x: 320, y: 260, params: { color: [0.85, 0.95, 1, 1], roughness: 0.02, ior: 1.45 } },
      { id: "te_ficg_emission", typeId: "shader_emission", x: 320, y: 420, params: { color: [1, 0.2, 0.75, 1], strength: 3 } },
      { id: "te_ficg_mix", typeId: "shader_mix_shader", x: 780, y: 260 },
    ],
    links: [
      { id: "te_ficg_l1", fromNode: "te_ficg_fresnel", fromSocket: "fac", toNode: "te_ficg_invert", toSocket: "value2" },
      { id: "te_ficg_l2", fromNode: "te_ficg_invert", fromSocket: "value", toNode: "te_ficg_mix", toSocket: "fac" },
      { id: "te_ficg_l3", fromNode: "te_ficg_glass", fromSocket: "bsdf", toNode: "te_ficg_mix", toSocket: "shader1" },
      { id: "te_ficg_l4", fromNode: "te_ficg_emission", fromSocket: "bsdf", toNode: "te_ficg_mix", toSocket: "shader2" },
      { id: "te_ficg_l5", fromNode: "te_ficg_mix", fromSocket: "bsdf", toNode: "te_ficg_out", toSocket: "surface" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：疊一層發光，先用固定比例混合", en: "Step 1: Layer in a Glow, Blend at a Fixed Ratio First" },
      instruction: {
        zh: "加入發光（Emission，顏色調成鮮豔的洋紅或青色，強度 3 左右）跟混合著色器（Mix Shader）。把原本的玻璃 BSDF 接到混合著色器的第一個 Shader 輸入、發光接到第二個，混合著色器接到材質輸出（取代原本玻璃直接接輸出的線）。\n\n先不要動 Fac，看看固定 50/50 混合是什麼樣子——整顆球均勻地半透明半發光，沒有「核心」跟「邊緣」的分別。",
        en: "Add an Emission node (bright magenta or cyan, strength around 3) and a Mix Shader. Wire the existing Glass BSDF into Mix Shader's first Shader input, Emission into the second, and Mix Shader into Material Output (replacing Glass's direct connection).\n\nLeave Fac alone for now and see what a fixed 50/50 blend looks like — the whole sphere is uniformly half-transparent, half-glowing, with no distinction between a 'core' and an 'edge.'",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_glass_bsdf", "bsdf", "shader_mix_shader", "shader1") &&
        hasLinkBetweenTypes(graph, "shader_emission", "bsdf", "shader_mix_shader", "shader2") &&
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface"),
    },
    {
      title: { zh: "第二步：接上菲涅爾，先看看方向對不對", en: "Step 2: Wire In Fresnel — See That the Direction Is Backwards" },
      instruction: {
        zh: "加入菲涅爾（Fresnel，IOR 用預設 1.45），把它的係數（Fac）直接接到混合著色器的 Fac。\n\n⚠️ 這一步先不要急著調整——旋轉一下預覽球觀察畫面：正對鏡頭的核心區域反而變成玻璃，側邊掠視角度反而是發光——這跟我們想要的「核心發光、邊緣玻璃」正好相反。原因是菲涅爾本身「正面看數值低、側邊掠視數值高」，而 Fac＝0 選第一個 Shader（玻璃）、Fac＝1 選第二個（發光）。",
        en: "Add a Fresnel node (IOR at its default 1.45) and connect its Fac directly to Mix Shader's Fac.\n\n⚠️ Don't fix anything yet — rotate the preview sphere and notice: the head-on core area shows glass, while the grazing edges glow — the opposite of the 'glowing core, glassy edge' look we want. That's because Fresnel itself is low head-on and high at grazing angles, while Fac=0 picks the first Shader (Glass) and Fac=1 picks the second (Emission).",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第三步：插入數學節點做「1 減去」，把方向反過來", en: "Step 3: Insert a Math Node to Compute '1 Minus' — Flip It" },
      instruction: {
        zh: "在菲涅爾跟混合著色器中間插入一個數學（Math）節點，運算選相減（Subtract），第一個數值填 1，第二個數值接菲涅爾的 Fac；數學節點的輸出改接到混合著色器的 Fac（取代原本菲涅爾直接接過去的線）。\n\n現在「1 減菲涅爾」在正對鏡頭時數值高（選中發光）、側邊掠視時數值低（選中玻璃）——方向正確了。再轉一下預覽球確認：核心穩定發光，邊緣輪廓露出玻璃的反光質感。",
        en: "Insert a Math node between Fresnel and Mix Shader, set to Subtract, with the first value set to 1 and the second value wired from Fresnel's Fac. Reconnect the Math node's output into Mix Shader's Fac (replacing Fresnel's direct connection).\n\nNow '1 minus Fresnel' is high head-on (picking Emission) and low at grazing angles (picking Glass) — the direction is correct. Rotate the preview again to confirm: the core glows steadily, while the silhouette edge shows glassy reflections.",
      },
      check: (graph) => {
        const mathNodes = findNodesOfType(graph, "converter_math");
        return (
          mathNodes.some((n) => n.params.operation === "subtract" && n.params.value1 === 1) &&
          hasLinkBetweenTypes(graph, "input_fresnel", "fac", "converter_math", "value2") &&
          hasLinkBetweenTypes(graph, "converter_math", "value", "shader_mix_shader", "fac")
        );
      },
    },
    {
      title: { zh: "第四步：這個技巧能用在哪裡", en: "Step 4: Where Else This Trick Applies" },
      instruction: {
        zh: "「用數學節點算 1 減某個值」是個通用技巧，不是只能反轉菲涅爾——任何一個 0-1 的遮罩，只要你想要的是它的「相反」（本來該亮的地方變暗、該暗的地方變亮），都可以用同一招，比重新設計一整套遮罩邏輯更簡單直接。",
        en: "'Compute 1 minus a value with a Math node' is a general-purpose trick, not just for inverting Fresnel — any 0-1 mask can be flipped the same way whenever you need its opposite (what was bright should go dark, and vice versa), which is simpler than redesigning the whole masking logic from scratch.",
      },
      check: (graph) => {
        const mathNodes = findNodesOfType(graph, "converter_math");
        return (
          mathNodes.some((n) => n.params.operation === "subtract" && n.params.value1 === 1) &&
          hasLinkBetweenTypes(graph, "converter_math", "value", "shader_mix_shader", "fac")
        );
      },
    },
  ],
  quiz: [
    {
      question: {
        zh: "菲涅爾（Fresnel）節點在「正對鏡頭」（畫面中心）的時候，數值通常是高還是低？",
        en: "When a surface directly faces the camera (the center of the view), is Fresnel's value typically high or low?",
      },
      options: [
        { zh: "高", en: "High" },
        { zh: "低", en: "Low" },
        { zh: "固定 0.5，不會變", en: "Fixed at 0.5, never changes" },
        { zh: "完全隨機", en: "Completely random" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "菲涅爾正對鏡頭時數值低、側邊掠視角度數值高，這正是它天生用來做「邊緣增亮」效果的原因。如果想要相反的效果（核心亮、邊緣暗），就要用 Math 節點算「1 減菲涅爾」把整條曲線反過來。",
        en: "Fresnel is low when facing the camera head-on and high at grazing angles — that's exactly why it's naturally suited to edge-brightening effects. To get the opposite (bright core, dark edges), you flip the curve with a Math node computing '1 minus Fresnel.'",
      },
    },
  ],
};
