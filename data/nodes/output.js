// Output 分類：材質圖的終點。目前實作 Material Output 的 Surface／Displacement／Thickness，
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
      zh: "插槽順序與 Blender 5.2.2 一致：Surface、Volume、Displacement、Thickness。即時預覽支援 Surface、Displacement 與 Thickness；Volume 需要體積光線步進，目前只顯示插槽並在接線時提出警告。Displacement 在頂點著色器運算，不能接 Bump／Normal Map／Wireframe／Fresnel 等只適用片段著色器的節點。",
      en: "Socket order matches Blender 5.2.2: Surface, Volume, Displacement, and Thickness. The live preview supports Surface, Displacement, and Thickness; Volume needs volumetric ray marching, so its socket is shown but a connected graph receives a warning. Displacement runs in the vertex shader and cannot use fragment-only nodes such as Bump, Normal Map, Wireframe, or Fresnel.",
    },
    supported: true,
    inputs: [
      { key: "surface", label: { zh: "表面", en: "Surface" }, type: "shader" },
      { key: "volume", label: { zh: "體積", en: "Volume" }, type: "shader" },
      { key: "displacement", label: { zh: "位移", en: "Displacement" }, type: "vector", default: [0, 0, 0] },
      { key: "thickness", label: { zh: "厚度", en: "Thickness" }, type: "float", default: 0, min: 0, step: 0.01 },
    ],
    outputs: [],
  },
];
