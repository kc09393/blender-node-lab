// 建議學習路徑：全站教學平常用搜尋/篩選瀏覽是一個「參考庫」，但完全沒有「先學哪個、
// 再學哪個」的順序——初學者不知道從哪裡開始，也可能在還沒學過菲涅爾/混合著色器之前
// 就先點進「邊緣磨損」這種組合技法教學而看不懂。這個檔案定義一條精選的主線路徑
// （不是全部教學都收錄，只挑最適合照順序學的一條主線），每個階段循序漸進：
// 材質圖基礎 → 顏色操作 → 程序化紋理 → 混合遮罩邏輯 → 表面細節 → 進階光線 → 綜合實戰。
// 跟 categories.js／nodeIndex.js 一樣獨立成檔案維護，之後要調整順序只改這裡。
export default [
  {
    id: "first-graph",
    title: { zh: "第一階段：材質圖的第一堂課", en: "Stage 1: Your First Material Graph" },
    steps: [
      {
        tutorialId: "tutorial_principled_bsdf_tour",
        note: { zh: "先認識這個節點——90% 的材質都從它開始。", en: "Start here — 90% of materials begin with this one node." },
      },
      {
        tutorialId: "tutorial_pbr_metal_vs_dielectric",
        note: { zh: "搞懂 Metallic 背後的物理原因，不是只會轉滑桿。", en: "Understand the physics behind Metallic, not just which way to turn the slider." },
      },
      {
        tutorialId: "tutorial_glass",
        note: { zh: "最簡單的「加節點→接線→完成」完整範例，練習基本操作。", en: "The simplest complete 'add node → wire it → done' example." },
      },
      {
        tutorialId: "tutorial_uv_mapping",
        note: { zh: "貼圖怎麼貼、貼幾次，是後面所有紋理節點的基礎。", en: "How textures wrap and tile — the foundation for every texture node that follows." },
      },
      {
        tutorialId: "tutorial_checker_texture_tour",
        note: { zh: "用棋盤格具體看懂座標系統，不然後面紋理節點會一直霧裡看花。", en: "Checker makes the coordinate system visible — skip this and texture nodes stay abstract." },
      },
    ],
  },
  {
    id: "color-basics",
    title: { zh: "第二階段：顏色的基本操作", en: "Stage 2: Color Fundamentals" },
    steps: [
      { tutorialId: "tutorial_hsv_shift", note: { zh: "轉色相比直接調 RGB 直覺得多。", en: "Rotating hue is far more intuitive than tweaking RGB directly." } },
      { tutorialId: "tutorial_bright_contrast", note: { zh: "手機修圖同款滑桿，最好上手的調色概念。", en: "The same sliders as your phone's photo editor — the easiest color concept to grasp." } },
      { tutorialId: "tutorial_gamma_correction", note: { zh: "認識「次方曲線調中間調」跟線性調整的差異。", en: "Learn how a power-curve midtone adjustment differs from a linear one." } },
      { tutorialId: "tutorial_color_ramp_tour", note: { zh: "把 0-1 的數值換成任意配色，之後幾乎每篇教學都會用到。", en: "Turns any 0-1 value into a custom color scheme — used in nearly every tutorial from here on." } },
    ],
  },
  {
    id: "procedural-textures",
    title: { zh: "第三階段：程序化紋理", en: "Stage 3: Procedural Textures" },
    steps: [
      { tutorialId: "tutorial_noise_texture_tour", note: { zh: "最常用的隨機紋理來源，5 種類型的差異一次搞懂。", en: "The most-used random texture source — see all 5 types compared." } },
      { tutorialId: "tutorial_gradient_texture", note: { zh: "沒有任何參數的最簡單紋理，理解「紋理其實就是一個數值」。", en: "The simplest texture with zero parameters — see that a texture is really just a value." } },
      { tutorialId: "tutorial_voronoi_distance_metrics", note: { zh: "細胞圖案的萬用工具，裂縫/鱗片/石紋都靠它。", en: "The cell-pattern workhorse behind cracks, scales, and stone veining." } },
      { tutorialId: "tutorial_wave_texture_tour", note: { zh: "條紋跟環狀波紋，木紋/水波/年輪的共同起點。", en: "Bands and rings — the shared starting point for wood grain, water ripples, tree rings." } },
    ],
  },
  {
    id: "mixing-masking",
    title: { zh: "第四階段：混合與遮罩的邏輯", en: "Stage 4: Mixing & Masking Logic" },
    steps: [
      { tutorialId: "tutorial_math_operations_tour", note: { zh: "數值運算是所有「遮罩」技巧的底層邏輯。", en: "Math operations are the underlying logic behind every masking trick." } },
      { tutorialId: "tutorial_mix_color_blend_modes_tour", note: { zh: "正片疊底/濾色/疊加，18 種混合模式先抓 3 個最常用的。", en: "Multiply/Screen/Overlay — the 3 most-used of 18 blend modes." } },
      { tutorialId: "tutorial_fresnel_tour", note: { zh: "「側面比正面更反光」是最常拿來驅動遮罩的效果。", en: "'Edges reflect more than the front' — the most common mask driver." } },
      { tutorialId: "tutorial_add_shader_tour", note: { zh: "搞懂 Add 跟 Mix Shader 的根本差異（相加 vs 平均）。", en: "The fundamental difference between Add and Mix Shader (summing vs. averaging)." } },
      { tutorialId: "tutorial_edge_wear_mask", note: { zh: "綜合演練：菲涅爾＋硬邊遮罩＋混合著色器，做出真的邊緣磨損。", en: "Put it together: Fresnel + hard-edge mask + Mix Shader for real edge wear." } },
    ],
  },
  {
    id: "surface-detail",
    title: { zh: "第五階段：表面細節——假的凹凸 vs 真的變形", en: "Stage 5: Surface Detail — Fake Bumps vs. Real Deformation" },
    steps: [
      { tutorialId: "tutorial_bump_tour", note: { zh: "最常用的「光影騙術」，幾乎每個材質都會用到。", en: "The most common 'lighting trick' — used in almost every material." } },
      { tutorialId: "tutorial_bump_vs_displacement_compared", note: { zh: "同一份資料直接比較，親眼看到兩者的根本差異。", en: "Direct comparison with the same data — see the fundamental difference firsthand." } },
      { tutorialId: "tutorial_displacement_terrain", note: { zh: "真正推動頂點的位移，代價是效能，但輪廓真的會變。", en: "Real vertex-pushing displacement — costs performance, but the silhouette genuinely changes." } },
    ],
  },
  {
    id: "advanced-light",
    title: { zh: "第六階段：進階光線互動", en: "Stage 6: Advanced Light Interaction" },
    steps: [
      { tutorialId: "tutorial_skin_sss", note: { zh: "次表面散射：皮膚、蠟、牛奶這類「光會鑽進去再出來」的材質。", en: "Subsurface Scattering: skin, wax, milk — materials where light enters and re-emerges." } },
      { tutorialId: "tutorial_transmission_shaders_compared", note: { zh: "玻璃／折射／半透射三種穿透效果的關鍵差異。", en: "The key differences between Glass, Refraction, and Translucent." } },
      { tutorialId: "tutorial_layer_weight_facing_vs_fresnel", note: { zh: "疊清漆層的兩種驅動方式，還有為什麼要選哪一種。", en: "Two ways to drive a clearcoat layer, and why you'd pick one over the other." } },
    ],
  },
  {
    id: "put-together",
    title: { zh: "第七階段：綜合實戰", en: "Stage 7: Putting It All Together" },
    steps: [
      { tutorialId: "tutorial_metal", note: { zh: "第一個「不只是接一個節點」的完整材質：雜訊驅動粗糙度。", en: "Your first material with more than one node doing real work: noise-driven roughness." } },
      { tutorialId: "tutorial_wood", note: { zh: "波浪紋理＋顏色漸變＋粗糙度連動，程序化木紋的標準做法。", en: "Wave + Color Ramp + linked roughness — the standard recipe for procedural wood." } },
      { tutorialId: "tutorial_mix_carpaint", note: { zh: "壓軸：底漆＋清漆層＋菲涅爾驅動混合，前六階段學的東西這裡全部用上。", en: "The finale: base coat + clearcoat + Fresnel-driven mix — everything from the first six stages comes together here." } },
    ],
  },
];
