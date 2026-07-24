import { hasLinkBetweenTypes, nodeHasIncomingFromType, findNodesOfType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：準備漆面材質跟裸露金屬材質", en: "Step 1: Prepare a Painted Material and a Bare-Metal Material" },
      instruction: {
        zh: "現有的原理化 BSDF（Principled BSDF）就是漆面：金屬度（Metallic）0、粗糙度（Roughness）0.4 左右，維持一般烤漆的樣子。\n\n再拖入一個新的原理化 BSDF，改成裸露金屬的樣子：底色（Base Color）調成淺灰、金屬度調到 1、粗糙度調低（例如 0.2）。先不用接線。",
        en: "The existing Principled BSDF is the paint: Metallic 0, Roughness around 0.4, a normal painted look.\n\nDrag in a new Principled BSDF for bare metal: light gray Base Color, Metallic set to 1, lower Roughness (e.g. 0.2). Don't wire it up yet.",
      },
      check: (graph) => {
        const principled = findNodesOfType(graph, "shader_principled_bsdf");
        return principled.length >= 2 && principled.some((n) => n.params.metallic >= 0.9);
      },
    },
    {
      title: { zh: "第二步：用混合著色器把兩者接在一起", en: "Step 2: Wire Both Together with Mix Shader" },
      instruction: {
        zh: "加入混合著色器（Mix Shader，著色器 Shader 分類），把漆面跟裸露金屬分別接到它的兩個著色器（Shader）輸入，再接到材質輸出（Material Output）的表面（Surface），取代原本的直接連線。",
        en: "Add a Mix Shader (Shader category), connect the painted and bare-metal Principled nodes to its two Shader inputs, then wire it to Material Output's Surface, replacing the original direct connection.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "shader_mix_shader", "bsdf", "output_material", "surface") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf"),
    },
    {
      title: { zh: "第三步：用菲涅爾＋硬邊顏色漸變做出遮罩", en: "Step 3: Build a Hard-Edge Mask with Fresnel + Color Ramp" },
      instruction: {
        zh: "加入菲涅爾（Fresnel，輸入 Input 分類），IOR 調高一點（例如 2.2）讓邊緣範圍更集中。\n\n加入顏色漸變（Color Ramp），把插值方式（Interpolation）切換成常量（Constant），停駐點設成：位置 0 是黑色、位置 0.6 是白色——這樣沒有任何過渡地帶，只有「純黑（完全漆面）」或「純白（完全裸露）」兩種狀態，磨損邊界會很銳利、不會霧霧的。",
        en: "Add a Fresnel node (Input category), raising IOR a bit (e.g. 2.2) to concentrate the edge zone.\n\nAdd a Color Ramp, switch Interpolation to Constant, and set stops: position 0 black, position 0.6 white — no transition zone at all, only pure black (fully painted) or pure white (fully bare) with a razor-sharp wear boundary instead of a soft blend.",
      },
      check: (graph) =>
        hasLinkBetweenTypes(graph, "input_fresnel", "fac", "converter_color_ramp", "fac") &&
        anyNodeParamMatches(graph, "converter_color_ramp", "interpolation", (v) => v === "constant"),
    },
    {
      title: { zh: "第四步：用遮罩驅動混合比例", en: "Step 4: Drive the Blend with the Mask" },
      instruction: {
        zh: "把顏色漸變（Color Ramp）的顏色（Color）輸出接到混合著色器（Mix Shader）的 Fac，取代原本固定的滑桿。\n\n畫面正面（面對鏡頭）應該維持完整漆面，只有側邊/邊緣才會突然切換成金屬色——這就是「邊緣磨損」效果，跟一般漸層式的髒污遮罩不同，切換是硬邊、乾脆的。",
        en: "Connect Color Ramp's Color output to Mix Shader's Fac, replacing the fixed slider.\n\nThe front-facing area should stay fully painted, with only the grazing edges suddenly flipping to bare metal — that's edge wear: a hard, decisive switch rather than a soft gradient like typical dirt masks.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_mix_shader", "fac"),
    },
  ],
};
