import { hasLinkBetweenTypes, anyNodeParamMatches, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_toon_style_banding",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "風格化色階：用硬邊漸變仿卡通分色", en: "Stylized Banding: Faking Cel Shading with Hard-Edge Ramps" },
  description: {
    zh: "本沙盒的卡通 BSDF（Toon BSDF）跟 Shader to RGB 都因為需要『打光完成之後』才能介入而無法支援即時預覽（這兩個節點都需要先算出最終光影、才能把它硬分成幾個色階，但本沙盒的架構是先算好材質參數、再一次交給 Three.js 統一打光，順序反過來了）。這篇教一個不需要那兩個節點也能做到的替代做法：用菲涅爾（Fresnel）＋多停駐點的硬邊顏色漸變（Color Ramp，常量 Constant），做出「隨視角分色」的風格化色塊——不是真正依光照方向分色的卡通渲染，但一樣能做出手繪分色感的視覺效果，這篇會誠實說明兩者的差異在哪。",
    en: "This sandbox's Toon BSDF and Shader to RGB can't support live preview because they need to intervene *after* lighting is resolved (both require the final shading result before banding it into discrete steps — but this sandbox's architecture computes material parameters first, then hands everything to Three.js for lighting in one pass, the opposite order). This tutorial teaches a workaround that doesn't need either node: Fresnel plus a multi-stop hard-edge Color Ramp (Constant) to fake view-angle-based color banding. It's not true light-direction-based cel shading, but it gets a similar hand-painted, banded look — and this tutorial is upfront about exactly where the two differ.",
  },
  startGraph: {
    nodes: [
      { id: "t_tsb_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_tsb_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_tsb_l1", fromNode: "t_tsb_principled", fromSocket: "bsdf", toNode: "t_tsb_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_tsb_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      {
        id: "te_tsb_principled",
        typeId: "shader_principled_bsdf",
        x: 820,
        y: 100,
        params: { roughness: 0.9, metallic: 0 },
      },
      {
        id: "te_tsb_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          interpolation: "constant",
          stops: [
            { position: 0, color: [0.05, 0.1, 0.3, 1] },
            { position: 0.4, color: [0.25, 0.4, 0.75, 1] },
            { position: 0.8, color: [0.85, 0.9, 1, 1] },
          ],
        },
      },
      { id: "te_tsb_fresnel", typeId: "input_fresnel", x: 300, y: 100, params: { ior: 1.5 } },
    ],
    links: [
      { id: "te_tsb_l1", fromNode: "te_tsb_principled", fromSocket: "bsdf", toNode: "te_tsb_out", toSocket: "surface" },
      { id: "te_tsb_l2", fromNode: "te_tsb_ramp", fromSocket: "color", toNode: "te_tsb_principled", toSocket: "baseColor" },
      { id: "te_tsb_l3", fromNode: "te_tsb_fresnel", fromSocket: "fac", toNode: "te_tsb_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入菲涅爾當作分色依據", en: "Step 1: Add Fresnel as the Banding Source" },
      instruction: {
        zh: "加入菲涅爾（Fresnel，輸入 Input 分類），IOR 維持中等（例如 1.5）。它會輸出「越靠近邊緣、數值越高」的漸變係數，等一下用來決定每個位置該落在哪一個色階。",
        en: "Add a Fresnel node (Input category), keeping IOR moderate (e.g. 1.5). It outputs a gradient factor that's higher near the edges — used next to decide which color band each point falls into.",
      },
      check: (graph) => findNodesOfType(graph, "input_fresnel").length >= 1,
    },
    {
      title: { zh: "第二步：加入 3 段式的硬邊顏色漸變", en: "Step 2: Add a 3-Stop Hard-Edge Color Ramp" },
      instruction: {
        zh: "加入顏色漸變（Color Ramp），插值方式（Interpolation）切換成常量（Constant）。新增到 3 個停駐點，由深到淺：位置 0 深藍、位置 0.4 中藍、位置 0.8 接近白——常量插值會讓每個區間內都是單一顏色、沒有漸層，正是卡通上色最典型的「陰影/中間調/高光」三色分色法。",
        en: "Add a Color Ramp, switch Interpolation to Constant. Add up to 3 stops, dark to light: position 0 dark blue, position 0.4 mid blue, position 0.8 near-white — Constant interpolation keeps each zone a single flat color with no gradient, exactly the classic 'shadow / midtone / highlight' three-tone cel-shading split.",
      },
      check: (graph) => {
        const ramps = findNodesOfType(graph, "converter_color_ramp");
        return ramps.some((n) => n.params.interpolation === "constant" && (n.params.stops || []).length >= 3);
      },
    },
    {
      title: { zh: "第三步：接線，讓菲涅爾驅動分色", en: "Step 3: Wire Fresnel to Drive the Bands" },
      instruction: {
        zh: "把菲涅爾的係數（Fac）接到顏色漸變的係數（Fac），再把顏色漸變的顏色（Color）接到原理化 BSDF（Principled BSDF）的底色（Base Color）。粗糙度（Roughness）調高（例如 0.9），讓表面本身的反光盡量弱，色塊才不會被額外的高光蓋過去。",
        en: "Connect Fresnel's Fac to Color Ramp's Fac, then Color Ramp's Color to Principled BSDF's Base Color. Raise Roughness (e.g. 0.9) so the surface's own specular highlight stays weak and doesn't wash out the flat color bands.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_fresnel", "fac", "converter_color_ramp", "fac") &&
        hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor") &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v >= 0.7),
    },
    {
      title: { zh: "第四步：誠實認識這個做法的侷限", en: "Step 4: Know This Technique's Real Limits" },
      instruction: {
        zh: "球體現在應該呈現 3 層清楚的色塊，隨視角分布——但仔細看會發現，本沙盒固定的攝影棚打光仍然會在這些色塊上疊加一層本身的柔和光影（因為打光是最後統一套用的，這套做法沒辦法真的擋掉）。\n\n真正的 Toon BSDF／Shader to RGB 在 Blender 裡是先把光照結果本身分色，色塊會完全鎖住、不受光源角度變化影響；這裡做的是「用視角這個替代依據」分色，效果類似但原理不同——這點要誠實知道，不要誤以為兩者完全等價。",
        en: "The sphere should now show 3 clear color bands arranged by viewing angle — but look closely and you'll notice this sandbox's fixed studio lighting still layers its own soft shading on top of the bands (since lighting is applied uniformly at the end, this technique can't block that out).\n\nReal Toon BSDF/Shader to RGB in Blender bands the *lit* result itself — the bands stay completely locked regardless of light angle. What's done here bands by viewing angle as a stand-in — similar-looking, but a different mechanism under the hood. Worth knowing honestly, rather than assuming the two are equivalent.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_principled_bsdf", "baseColor"),
    },
  ],
};
