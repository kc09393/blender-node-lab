import {
  hasNodeOfType,
  hasLinkBetweenTypes,
  nodeHasIncomingFromType,
  anyNodeParamMatches,
} from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_rust_weathering",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "程序化風化：生鏽金屬", en: "Procedural Weathering: Rusted Metal" },
  description: {
    zh: "用雜訊紋理（Noise Texture）產生的雜訊、經過顏色漸變（Color Ramp）轉成黑白遮罩，驅動混合著色器（Mix Shader）在同一個表面上混合「乾淨金屬」跟「鏽蝕」兩種材質——這是遊戲/影視資產最常用的程序化風化技巧。",
    en: "Use Noise Texture's output, remapped by a Color Ramp into a black/white mask, to drive Mix Shader blending 'clean metal' and 'rust' on the same surface — the classic procedural weathering technique used throughout games and VFX.",
  },
  startGraph: {
    nodes: [
      { id: "t_rust_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "t_rust_clean", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.75, 0.76, 0.78, 1], roughness: 0.25, metallic: 1 } },
      { id: "t_rust_rusty", typeId: "shader_principled_bsdf", x: 500, y: 300, params: { baseColor: [0.42, 0.18, 0.08, 1], roughness: 0.85, metallic: 0 } },
    ],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_rust_out", typeId: "output_material", x: 1400, y: 220, params: {} },
      { id: "te_rust_mix", typeId: "shader_mix_shader", x: 1100, y: 160, params: {} },
      { id: "te_rust_clean", typeId: "shader_principled_bsdf", x: 800, y: 20, params: { baseColor: [0.75, 0.76, 0.78, 1], roughness: 0.25, metallic: 1 } },
      { id: "te_rust_rusty", typeId: "shader_principled_bsdf", x: 800, y: 280, params: { baseColor: [0.42, 0.18, 0.08, 1], roughness: 0.85, metallic: 0 } },
      {
        id: "te_rust_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 400,
        params: { stops: [{ position: 0.45, color: [0, 0, 0, 0] }, { position: 0.55, color: [1, 1, 1, 1] }] },
      },
      { id: "te_rust_noise", typeId: "texture_noise", x: 320, y: 400, params: { scale: 4 } },
      { id: "te_rust_texcoord", typeId: "input_texture_coordinate", x: 80, y: 400, params: {} },
    ],
    links: [
      { id: "te_rust_l1", fromNode: "te_rust_mix", fromSocket: "bsdf", toNode: "te_rust_out", toSocket: "surface" },
      { id: "te_rust_l2", fromNode: "te_rust_clean", fromSocket: "bsdf", toNode: "te_rust_mix", toSocket: "shader1" },
      { id: "te_rust_l3", fromNode: "te_rust_rusty", fromSocket: "bsdf", toNode: "te_rust_mix", toSocket: "shader2" },
      { id: "te_rust_l4", fromNode: "te_rust_ramp", fromSocket: "alpha", toNode: "te_rust_mix", toSocket: "fac" },
      { id: "te_rust_l5", fromNode: "te_rust_noise", fromSocket: "fac", toNode: "te_rust_ramp", toSocket: "fac" },
      { id: "te_rust_l6", fromNode: "te_rust_texcoord", fromSocket: "generated", toNode: "te_rust_noise", toSocket: "vector" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：用 Mix Shader 混合兩種金屬材質", en: "Step 1: Blend the Two Materials with Mix Shader" },
      instruction: {
        zh: "拖入混合著色器（Mix Shader）。\n\n把乾淨金屬（上面那個）接到它的第一個著色器（Shader）插槽，鏽蝕材質（下面那個）接到第二個。\n\n再把混合著色器的輸出，接到材質輸出（Material Output）。\n\n目前 Fac 還是固定滑桿，整個表面會是均勻混合的顏色，還看不出鏽斑的形狀，這是正常的，下一步才會處理形狀。",
        en: "Drag in a Mix Shader, connect the clean metal (top) and rusty material (bottom) to its two Shader sockets, then wire it to Material Output. With a fixed Fac slider, the surface blends uniformly — no rust shape yet.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader"),
    },
    {
      title: { zh: "第二步：加入 Noise Texture 當作風化來源", en: "Step 2: Add Noise Texture as the Weathering Source" },
      instruction: {
        zh: "加入紋理座標（Texture Coordinate，在「輸入 Input」分類裡）。\n\n加入雜訊紋理（Noise Texture，在「紋理 Texture」分類裡）。\n\n把紋理座標的 Generated 輸出，接到雜訊紋理的向量（Vector）輸入。\n\n把雜訊紋理的縮放（Scale）調到 3～6 之間，斑塊大小會比較適中。",
        en: "Add a Texture Coordinate (Input category) and a Noise Texture (Texture category), and connect Texture Coordinate's Generated to Noise Texture's Vector. Set Noise Texture's Scale between 3-6 for medium-sized patches.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_noise", "vector") &&
        anyNodeParamMatches(graph, "texture_noise", "scale", (v) => typeof v === "number" && v >= 3 && v <= 6),
    },
    {
      title: { zh: "第三步：用 Color Ramp 把雜訊變成黑白遮罩", en: "Step 3: Turn Noise into a Black/White Mask with Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp，在「轉換器 Converter」分類裡）。\n\n把雜訊紋理的係數（Fac）輸出，接到顏色漸變的係數（Fac）輸入。\n\n把兩個停駐點的位置調得很接近，例如 0.45 跟 0.55。左邊停駐點設成黑色、右邊設成白色。這樣雜訊會變成邊界清楚的黑白色塊，不是模糊的灰階漸層。\n\n⚠️ 重要：把左邊（黑色）停駐點的 Alpha 數值欄位調成 0，右邊（白色）維持 1。下一步要用 Alpha 輸出當作混合遮罩——如果兩個停駐點的 Alpha 一樣，Alpha 輸出就會是全圖固定的一個數字，完全沒有遮罩效果。",
        en: "Add a Color Ramp (Converter category) and connect Noise Texture's Fac to its Fac. Move the two stops close together (e.g. 0.45 and 0.55), with the left stop black and the right stop white — this turns the noise into sharp-edged black/white patches instead of a blurry gray gradient. Also set the left (black) stop's Alpha number field to 0, keeping the right (white) stop at 1 — the next step uses the Alpha output as a blend mask, and if both stops have the same Alpha, the output would be a constant value everywhere with no masking effect.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac"),
    },
    {
      title: { zh: "第四步：用遮罩驅動 Mix Shader 的 Fac", en: "Step 4: Drive Mix Shader's Fac with the Mask" },
      instruction: {
        zh: "把顏色漸變的 Alpha 輸出，接到混合著色器的 Fac 輸入，取代原本固定的滑桿。\n\n現在球體表面應該會變成「大部分是乾淨金屬、局部隨機冒出鏽斑」的效果——這就是遊戲資產常見的風化材質做法。",
        en: "Connect Color Ramp's Alpha output to Mix Shader's Fac, replacing the fixed slider. The sphere should now show mostly clean metal with random rust patches breaking through — the same technique used for weathered game assets.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "alpha", "shader_mix_shader", "fac"),
    },
  ],
};
