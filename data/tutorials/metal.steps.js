import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches, hasAnyLinkInto } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：把 Metallic 調到 1", en: "Step 1: Set Metallic to 1" },
      instruction: {
        zh: "在原理化 BSDF（Principled BSDF）上把金屬度（Metallic）拉到最大（1），這樣才會有金屬的反射方式，而不是塑膠感。",
        en: "On the Principled BSDF, push Metallic to maximum (1) so it reflects like metal instead of plastic.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v >= 0.95),
    },
    {
      title: { zh: "第二步：加入 Texture Coordinate 與 Noise Texture", en: "Step 2: Add Texture Coordinate and Noise Texture" },
      instruction: {
        zh: "從「輸入 Input」分類拖入紋理座標（Texture Coordinate），從「紋理 Texture」分類拖入雜訊紋理（Noise Texture），並把紋理座標的 Generated 接到雜訊紋理的向量（Vector）。",
        en: "Drag in a Texture Coordinate (Input category) and a Noise Texture (Texture category), then connect Texture Coordinate's Generated output to Noise Texture's Vector input.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "input_texture_coordinate") &&
        hasNodeOfType(graph, "texture_noise") &&
        hasLinkBetweenTypes(graph, "input_texture_coordinate", "generated", "texture_noise", "vector"),
    },
    {
      title: { zh: "第三步：用 Map Range 調整範圍", en: "Step 3: Rescale with Map Range" },
      instruction: {
        zh: "雜訊紋理（Noise Texture）的係數（Fac）是 0-1，直接接粗糙度（Roughness）會太誇張。\n\n加入一個映射範圍（Map Range，轉換器 Converter 分類），把雜訊的係數接進去，再把映射範圍的輸出接到原理化 BSDF（Principled BSDF）的粗糙度。",
        en: "Noise Texture's Fac output is 0-1 — too extreme for Roughness directly.\n\nAdd a Map Range (Converter category), feed Noise's Fac into it, and connect its output to Principled BSDF's Roughness.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "converter_map_range") &&
        hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_map_range", "value") &&
        hasLinkBetweenTypes(graph, "converter_map_range", "value", "shader_principled_bsdf", "roughness"),
    },
    {
      title: { zh: "第四步：確認完成", en: "Step 4: Confirm It Works" },
      instruction: {
        zh: "看看右側的即時預覽，球體表面的反光應該有明暗不均的拉絲質感，而不是均勻的鏡面。",
        en: "Check the live preview — the sphere's highlights should look uneven and brushed, not a perfectly uniform mirror.",
      },
      check: (graph) => hasAnyLinkInto(graph, "shader_principled_bsdf", "roughness"),
    },
  ],
};
