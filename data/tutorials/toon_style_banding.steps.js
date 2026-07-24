import { hasLinkBetweenTypes, anyNodeParamMatches, findNodesOfType } from "../../js/core/tutorialChecks.js";

export default {
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
  quiz: [
    {
      question: {
        zh: "這篇教學用「菲涅爾＋硬邊顏色漸變」仿卡通分色，教學最後誠實指出這個做法跟真正的 Toon BSDF 有什麼關鍵差異？",
        en: "This tutorial fakes cel shading with Fresnel + a hard-edge Color Ramp. What key difference does the tutorial honestly point out compared to a real Toon BSDF?",
      },
      options: [
        {
          zh: "這裡的色塊是依「視角」分布，攝影機一轉色塊就跟著換；真正的 Toon BSDF 是依「光照結果」分色，色塊固定不受攝影機角度影響",
          en: "Here the bands are arranged by viewing angle and shift as the camera orbits; a real Toon BSDF bands the actual lit result, so the bands stay fixed regardless of camera angle",
        },
        { zh: "這裡的做法完全等同真正的 Toon BSDF，沒有任何差異", en: "This approach is fully equivalent to a real Toon BSDF, with no difference at all" },
        { zh: "色塊的顏色數量這裡固定只能有 2 種，Toon BSDF 可以無限多種", en: "The number of color bands here is capped at 2, while Toon BSDF supports unlimited bands" },
        { zh: "這個做法只能用在球體上，Toon BSDF 可以用在任何形狀", en: "This technique only works on spheres, while Toon BSDF works on any shape" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "菲涅爾本質上是「攝影機角度」的函式，所以這個替代做法的色塊分布會隨攝影機旋轉而跟著移動；真正的 Toon BSDF／Shader to RGB 是在光照計算「之後」才把已經算好的明暗結果分色，色塊完全鎖定在光源方向上，不受攝影機怎麼看影響。兩者視覺上可能相似，但物理機制完全不同，這篇教學特別在最後一步誠實點出這個差異，不宣稱是等價的替代方案。",
        en: "Fresnel is fundamentally a function of camera angle, so this workaround's bands shift as the camera orbits. A real Toon BSDF / Shader to RGB bands the already-lit result *after* lighting is computed, so the bands stay locked to the light direction regardless of camera view. The two can look visually similar, but the underlying mechanism is completely different — this tutorial's final step is upfront about that distinction rather than claiming equivalence.",
      },
    },
  ],
};
