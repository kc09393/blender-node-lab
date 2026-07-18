// Output 分類：材質圖的終點。目前只實作 Material Output（Surface 插槽），
// AOV Output 之後可以用同樣的分類再加一筆。
export default [
  {
    id: "output_material",
    category: "output",
    name: { zh: "材質輸出", en: "Material Output" },
    summary: { zh: "整張材質圖的最終出口，決定球體實際顯示的材質。", en: "The final destination of the material graph." },
    docBeginner: {
      zh: "每張材質圖都需要一個「材質輸出」節點。把任何 Shader（BSDF）類型的節點接到它的 Surface 插槽，畫面就會套用該材質。沒有接東西的話，看到的會是預設灰色。",
      en: "Every material graph needs a Material Output node. Connect any Shader (BSDF) node to its Surface socket to apply that material. Without a connection, you'll see a default gray.",
    },
    docPro: {
      zh: "本教學網站的即時預覽現在支援 Surface 與 Displacement 兩個插槽（Displacement 接 Vector 型別，通常來自 Displacement／Vector Displacement 節點）；Volume 插槽（體積材質）目前仍不支援即時渲染，僅在百科中列出說明。Displacement 是在頂點著色器裡運算的，能接的節點種類比 Surface 少（不能用 Bump／Normal Map／Wireframe／Fresnel 等需要 Fragment 端資料的節點），接了不支援的節點會有清楚的錯誤訊息。",
      en: "This site's live preview now wires up both Surface and Displacement (Displacement takes a Vector, typically from a Displacement/Vector Displacement node); Volume is still documented but not rendered live. Displacement runs in the vertex shader, so it accepts fewer node types than Surface (no Bump/Normal Map/Wireframe/Fresnel, which need fragment-only data) — connecting an unsupported node produces a clear error message.",
    },
    supported: true,
    inputs: [
      { key: "surface", label: { zh: "表面", en: "Surface" }, type: "shader" },
      { key: "displacement", label: { zh: "位移", en: "Displacement" }, type: "vector", default: [0, 0, 0] },
    ],
    outputs: [],
  },
];
