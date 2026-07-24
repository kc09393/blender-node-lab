import { hasNodeOfType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：加入棋盤格紋理", en: "Step 1: Add a Checker Texture" },
      instruction: {
        zh: "從「紋理 Texture」分類拖入棋盤格紋理（Checker Texture），接到原理化 BSDF（Principled BSDF）的底色（Base Color）。",
        en: "Drag in a Checker Texture from the Texture category and connect it to Principled BSDF's Base Color.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_checker", "color", "shader_principled_bsdf", "baseColor"),
    },
    {
      title: { zh: "第二步：加入向量旋轉", en: "Step 2: Add a Vector Rotate" },
      instruction: {
        zh: "從「向量 Vector」分類拖入向量旋轉（Vector Rotate），把它的向量（Vector）輸出接到棋盤格紋理的向量輸入。",
        en: "Drag in a Vector Rotate from the Vector category and connect its Vector output to Checker Texture's Vector input.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "vector_rotate", "vector", "texture_checker", "vector"),
    },
    {
      title: { zh: "第三步：調整角度", en: "Step 3: Adjust the Angle" },
      instruction: {
        zh: "把角度（Angle）調成 45 度左右。格紋應該會整個斜轉過來，變成菱形而不是正方格。",
        en: "Set the Angle to around 45 degrees — the checker pattern should tilt into diamonds instead of straight squares.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_rotate", "angle", (v) => Math.abs(v) >= 20),
    },
    {
      title: { zh: "第四步：換一個旋轉軸試試看", en: "Step 4: Try a Different Rotation Axis" },
      instruction: {
        zh: "把軸（Axis）從預設的 (0,0,1) 改成 (1,0,0) 或 (0,1,0)，觀察格紋扭曲的方式有什麼不同——因為球體是彎曲表面，繞不同軸旋轉座標，視覺效果差異會很明顯。",
        en: "Change Axis from the default (0,0,1) to (1,0,0) or (0,1,0) and notice how the pattern distorts differently — since the sphere is a curved surface, rotating the coordinate around a different axis has a visibly different effect.",
      },
      check: (graph) => anyNodeParamMatches(graph, "vector_rotate", "axis", (v) => Array.isArray(v) && (v[0] !== 0 || v[1] !== 0)),
    },
  ],
};
