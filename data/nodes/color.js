// Color 分類：對顏色做調整/混合的節點。
import { buildCurveExprGLSL } from "../../js/core/curveUtil.js";

export default [
  {
    id: "color_hsv",
    category: "color",
    name: { zh: "色相/飽和度/明度", en: "Hue Saturation Value" },
    summary: { zh: "分別調整顏色的色相、飽和度、明度，比直接調 RGB 更直覺。", en: "Adjusts hue, saturation, and value independently — more intuitive than tweaking RGB directly." },
    docBeginner: {
      zh: "Hue 轉動顏色在色環上的位置（例如把紅色轉成藍色）、Saturation 控制顏色鮮豔程度（0 = 灰階）、Value 控制明暗。三個都預設在「不改變」的中間值（Hue=0.5, Saturation=1, Value=1）。",
      en: "Hue rotates the color around the color wheel (e.g. turning red into blue), Saturation controls vividness (0 = grayscale), Value controls brightness. All three default to a 'no change' midpoint (Hue=0.5, Saturation=1, Value=1).",
    },
    docPro: {
      zh: "內部用標準的 RGB↔HSV 轉換公式實作，跟 Blender 的色彩科學一致；Fac 插槽可以控制這個調整套用的比例（0 = 完全不套用）。",
      en: "Implemented with the standard RGB↔HSV conversion formulas, consistent with Blender's color science. The Fac socket controls how much of the adjustment is applied (0 = no effect).",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "hue", label: { zh: "色相", en: "Hue" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "saturation", label: { zh: "飽和度", en: "Saturation" }, type: "float", default: 1, min: 0, max: 2, step: 0.01 },
      { key: "value", label: { zh: "明度", en: "Value" }, type: "float", default: 1, min: 0, max: 2, step: 0.01 },
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const hsv = ctx.freshVar("hsv");
        ctx.line(`vec3 ${hsv} = bml_rgb2hsv((${ins.color}).rgb);`);
        ctx.line(`${hsv}.x = fract(${hsv}.x + (${ins.hue} - 0.5));`);
        ctx.line(`${hsv}.y = clamp(${hsv}.y * ${ins.saturation}, 0.0, 1.0);`);
        ctx.line(`${hsv}.z = ${hsv}.z * ${ins.value};`);
        const rgb = ctx.freshVar("hsvrgb");
        ctx.line(`vec3 ${rgb} = mix((${ins.color}).rgb, bml_hsv2rgb(${hsv}), clamp(${ins.fac}, 0.0, 1.0));`);
        return { color: `vec4(${rgb}, (${ins.color}).a)` };
      },
    },
  },
  {
    id: "color_invert",
    category: "color",
    name: { zh: "反色", en: "Invert Color" },
    summary: { zh: "把顏色變成互補色，像照片底片一樣。", en: "Flips a color to its complement — like a photo negative." },
    docBeginner: {
      zh: "Invert Color 會把顏色變成 1 減去原本的值（白變黑、紅變青）。Fac 控制反色的比例，Fac=0 完全不變、Fac=1 完全反色。",
      en: "Invert Color computes 1 minus the original value (white becomes black, red becomes cyan). Fac controls how much inversion is applied: 0 = no change, 1 = fully inverted.",
    },
    docPro: {
      zh: "常用來把黑白遮罩反過來用（例如把『哪裡有雜訊』變成『哪裡沒有雜訊』），或是快速做出互補色配色。",
      en: "Commonly used to flip a black-and-white mask (e.g. turning 'where there's noise' into 'where there isn't'), or to quickly get a complementary color scheme.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const col = ctx.freshVar("inv");
        ctx.line(`vec4 ${col} = vec4(mix((${ins.color}).rgb, vec3(1.0) - (${ins.color}).rgb, clamp(${ins.fac}, 0.0, 1.0)), (${ins.color}).a);`);
        return { color: col };
      },
    },
  },
  {
    id: "color_bright_contrast",
    category: "color",
    name: { zh: "亮度/對比度", en: "Brightness/Contrast" },
    summary: { zh: "整體調亮調暗、拉開或縮小明暗差距。", en: "Brightens/darkens overall, and stretches or compresses the light-dark range." },
    docBeginner: {
      zh: "Bright 直接加減亮度、Contrast 拉開（或縮小）明暗之間的差距。跟手機相簿的『亮度/對比』滑桿是同樣的概念。",
      en: "Bright directly adds/subtracts brightness, Contrast stretches (or compresses) the gap between light and dark areas. Same concept as the brightness/contrast sliders in a phone's photo editor.",
    },
    docPro: {
      zh: "公式比照 Blender：先用 Contrast 把顏色相對 0.5 中灰做縮放，再加上 Bright，超出 0-1 的部分會被夾住。",
      en: "The formula mirrors Blender's: Contrast scales the color relative to mid-gray (0.5), then Bright is added, and the result is clamped to 0-1.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "bright", label: { zh: "亮度", en: "Bright" }, type: "float", default: 0, min: -1, max: 1, step: 0.01 },
      { key: "contrast", label: { zh: "對比", en: "Contrast" }, type: "float", default: 0, min: -1, max: 1, step: 0.01 },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const col = ctx.freshVar("bc");
        ctx.line(`float bml_contrastFactor_${col} = (1.0 + clamp(${ins.contrast}, -1.0, 1.0));`);
        ctx.line(`vec3 ${col} = clamp((((${ins.color}).rgb - 0.5) * bml_contrastFactor_${col}) + 0.5 + ${ins.bright}, 0.0, 1.0);`);
        return { color: `vec4(${col}, (${ins.color}).a)` };
      },
    },
  },
  {
    id: "color_gamma",
    category: "color",
    name: { zh: "伽瑪", en: "Gamma" },
    summary: { zh: "用次方曲線調整顏色的中間調亮度。", en: "Adjusts midtone brightness using a power curve." },
    docBeginner: {
      zh: "Gamma 大於 1 會讓畫面變暗（尤其中間調）、小於 1 會讓中間調變亮。常用來校正貼圖或微調材質的整體明暗曲線。",
      en: "A Gamma greater than 1 darkens the image (especially midtones); less than 1 brightens midtones. Often used to correct texture data or fine-tune a material's overall tonal curve.",
    },
    docPro: {
      zh: "運算就是 pow(color, gamma)，對每個顏色頻道分別套用；要注意 gamma 是次方數，不是百分比。",
      en: "The operation is simply pow(color, gamma), applied per channel. Note gamma is an exponent, not a percentage.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "gamma", label: { zh: "伽瑪", en: "Gamma" }, type: "float", default: 1, min: 0.1, max: 5, step: 0.01 },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const col = ctx.freshVar("gamma");
        ctx.line(`vec3 ${col} = pow(max((${ins.color}).rgb, vec3(0.0)), vec3(${ins.gamma}));`);
        return { color: `vec4(${col}, (${ins.color}).a)` };
      },
    },
  },
  {
    id: "color_mix",
    category: "color",
    name: { zh: "混合顏色", en: "Mix Color" },
    summary: { zh: "把兩個顏色依照混合模式（正常/加深/加亮…）與比例混合。", en: "Blends two colors using a mode (Mix/Multiply/Screen/...) and a ratio." },
    docBeginner: {
      zh: "跟 Photoshop 圖層的『混合模式』概念一樣：Mix 是直接淡入淡出、Multiply 讓顏色變暗（適合疊陰影）、Screen 讓顏色變亮（適合疊光暈）、Add 直接相加。",
      en: "Same concept as Photoshop layer blend modes: Mix is a simple crossfade, Multiply darkens (good for shadows), Screen brightens (good for glow), Add sums the colors directly.",
    },
    docPro: {
      zh: "這是新版 Blender 通用 Mix 節點的『顏色』模式，18 種混合模式跟 Blender 完整版一致（分四組：變暗群組——變暗/正片疊底/顏色加深；變亮群組——變亮/濾色/顏色減淡/相加；對比群組——疊加/柔光/線性光；比較群組——差值/相減/相除；分量群組——色相/飽和度/顏色/明度）。色相/飽和度/顏色/明度這 4 種是依 PDF 混合模式規格（跟 CSS、Photoshop 同一套）用亮度（Lum）/飽和度（Sat）的設定—裁切運算實作，不是簡單的極座標色相旋轉。",
      en: "This is the Color mode of Blender's unified Mix node, with all 18 blend modes matching full Blender (grouped: Darken — Darken/Multiply/Color Burn; Lighten — Lighten/Screen/Color Dodge/Add; Contrast — Overlay/Soft Light/Linear Light; Comparative — Difference/Subtract/Divide; Component — Hue/Saturation/Color/Value). Hue/Saturation/Color/Value follow the PDF blend-mode spec (same one CSS and Photoshop use) via Lum/Sat set-and-clip operations, not a simple polar hue rotation.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "a", label: { zh: "A", en: "A" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "b", label: { zh: "B", en: "B" }, type: "color", default: [0.5, 0.5, 0.5, 1] },
    ],
    settings: [
      {
        key: "mode",
        uiType: "select",
        previewBlend: true,
        label: { zh: "混合模式", en: "Blend Mode" },
        default: "mix",
        options: [
          { value: "mix", label: { zh: "正常 Mix", en: "Mix" }, cssBlend: "normal", group: "混合 Mix" },
          { value: "darken", label: { zh: "變暗 Darken", en: "Darken" }, cssBlend: "darken", group: "變暗 Darken" },
          { value: "multiply", label: { zh: "正片疊底 Multiply", en: "Multiply" }, cssBlend: "multiply", group: "變暗 Darken" },
          { value: "burn", label: { zh: "顏色加深 Color Burn", en: "Color Burn" }, cssBlend: "color-burn", group: "變暗 Darken" },
          { value: "lighten", label: { zh: "變亮 Lighten", en: "Lighten" }, cssBlend: "lighten", group: "變亮 Lighten" },
          { value: "screen", label: { zh: "濾色 Screen", en: "Screen" }, cssBlend: "screen", group: "變亮 Lighten" },
          { value: "dodge", label: { zh: "顏色減淡 Color Dodge", en: "Color Dodge" }, cssBlend: "color-dodge", group: "變亮 Lighten" },
          { value: "add", label: { zh: "相加 Add", en: "Add" }, cssBlend: "plus-lighter", group: "變亮 Lighten" },
          { value: "overlay", label: { zh: "疊加 Overlay", en: "Overlay" }, cssBlend: "overlay", group: "對比 Contrast" },
          { value: "soft_light", label: { zh: "柔光 Soft Light", en: "Soft Light" }, cssBlend: "soft-light", group: "對比 Contrast" },
          { value: "linear_light", label: { zh: "線性光 Linear Light", en: "Linear Light" }, cssBlend: null, group: "對比 Contrast" },
          { value: "difference", label: { zh: "差值 Difference", en: "Difference" }, cssBlend: "difference", group: "比較 Comparative" },
          { value: "subtract", label: { zh: "相減 Subtract", en: "Subtract" }, cssBlend: null, group: "比較 Comparative" },
          { value: "divide", label: { zh: "相除 Divide", en: "Divide" }, cssBlend: null, group: "比較 Comparative" },
          { value: "hue", label: { zh: "色相 Hue", en: "Hue" }, cssBlend: "hue", group: "分量 Component" },
          { value: "saturation", label: { zh: "飽和度 Saturation", en: "Saturation" }, cssBlend: "saturation", group: "分量 Component" },
          { value: "color", label: { zh: "顏色 Color", en: "Color" }, cssBlend: "color", group: "分量 Component" },
          { value: "value", label: { zh: "明度 Value", en: "Value" }, cssBlend: "luminosity", group: "分量 Component" },
        ],
      },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins, node) {
        const mode = node.params.mode || "mix";
        const a = `(${ins.a}).rgb`;
        const b = `(${ins.b}).rgb`;
        const blendMap = {
          mix: `${b}`,
          add: `${a} + ${b}`,
          multiply: `${a} * ${b}`,
          screen: `1.0 - (1.0 - ${a}) * (1.0 - ${b})`,
          subtract: `${a} - ${b}`,
          divide: `bml_blendDivide(${a}, ${b})`,
          darken: `min(${a}, ${b})`,
          lighten: `max(${a}, ${b})`,
          overlay: `bml_blendOverlay(${a}, ${b})`,
          dodge: `bml_blendDodge(${a}, ${b})`,
          burn: `bml_blendBurn(${a}, ${b})`,
          soft_light: `bml_blendSoftLight(${a}, ${b})`,
          linear_light: `clamp(${a} + 2.0 * ${b} - 1.0, 0.0, 1.0)`,
          difference: `abs(${a} - ${b})`,
          hue: `bml_blendHue(${a}, ${b})`,
          saturation: `bml_blendSaturation(${a}, ${b})`,
          color: `bml_blendColor(${a}, ${b})`,
          value: `bml_blendValue(${a}, ${b})`,
        };
        const blended = ctx.freshVar("blend");
        ctx.line(`vec3 ${blended} = ${blendMap[mode] || blendMap.mix};`);
        const col = ctx.freshVar("mixcol");
        ctx.line(`vec3 ${col} = clamp(mix(${a}, ${blended}, clamp(${ins.fac}, 0.0, 1.0)), 0.0, 1.0);`);
        return { color: `vec4(${col}, (${ins.a}).a)` };
      },
    },
  },
  {
    id: "color_rgb_curves",
    category: "color",
    name: { zh: "RGB 曲線", en: "RGB Curves" },
    summary: { zh: "用可自由拖拉的曲線調整每個顏色頻道的明暗對應關係。", en: "A freely-draggable curve for remapping each color channel's tonal response." },
    docBeginner: { zh: "比 Brightness/Contrast 更自由：可以只拉暗部、只拉亮部，或做出反轉效果，跟 Photoshop 的曲線工具概念相同。", en: "More flexible than Brightness/Contrast — you can pull just the shadows, just the highlights, or invert sections. Same concept as Photoshop's Curves tool." },
    docPro: { zh: "已補上可拖拉控制點的曲線編輯器，曲線本身用平滑的 Cardinal（Catmull-Rom 風格）多項式逐段穿過每個控制點，跟 Blender 曲線部件的預設平滑手把效果一致（不是逐段直線）。現在也跟 Blender 一樣有 4 條獨立曲線：「C」合成曲線先同時套用在 R/G/B 三個頻道，套用完的結果再各自送進 R/G/B 各自獨立的曲線——順序跟 Blender GPU 著色器原始碼（`gpu_shader_common_curves.glsl` 的 `curves_combined_rgb`）核對過一致。差異：本沙盒沒有 Blender「切換頻道分頁」的介面，4 條曲線直接全部攤開顯示。", en: "Now has a draggable curve editor; the curve itself is a smooth Cardinal (Catmull-Rom-style) polynomial passing through every control point, matching Blender's default smooth handle look (not a piecewise-straight line). It now also has all 4 independent curves like Blender: the 'C' combined curve is applied to R/G/B first, and the result is then fed through each channel's own independent R/G/B curve — this order was verified against Blender's GPU shader source (`curves_combined_rgb` in `gpu_shader_common_curves.glsl`). Difference: this sandbox doesn't have Blender's channel-tab switcher — all 4 curves are shown at once." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 1, min: 0, max: 1 },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
    ],
    settings: [
      {
        key: "points",
        uiType: "curve",
        label: { zh: "C 合成曲線", en: "C (Combined)" },
        domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
        default: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      },
      {
        key: "pointsR",
        uiType: "curve",
        label: { zh: "R 曲線", en: "R Curve" },
        domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
        default: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      },
      {
        key: "pointsG",
        uiType: "curve",
        label: { zh: "G 曲線", en: "G Curve" },
        domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
        default: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      },
      {
        key: "pointsB",
        uiType: "curve",
        label: { zh: "B 曲線", en: "B Curve" },
        domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
        default: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins, node) {
        // 跟 Blender 一致的兩段式管線：C 合成曲線先同時套用到 R/G/B，結果再各自送進
        // R/G/B 各自獨立的曲線。中間結果存成具名變數（不是直接把 expr 字串巢狀塞進下一段
        // buildCurveExprGLSL），避免曲線控制點一多，運算式在兩層巢狀三元運算下重複膨脹。
        const crExpr = buildCurveExprGLSL(node.params.points, `clamp((${ins.color}).r, 0.0, 1.0)`);
        const cgExpr = buildCurveExprGLSL(node.params.points, `clamp((${ins.color}).g, 0.0, 1.0)`);
        const cbExpr = buildCurveExprGLSL(node.params.points, `clamp((${ins.color}).b, 0.0, 1.0)`);
        const cr = ctx.freshVar("cCurveR");
        const cg = ctx.freshVar("cCurveG");
        const cb = ctx.freshVar("cCurveB");
        ctx.line(`float ${cr} = ${crExpr};`);
        ctx.line(`float ${cg} = ${cgExpr};`);
        ctx.line(`float ${cb} = ${cbExpr};`);
        const rrExpr = buildCurveExprGLSL(node.params.pointsR, `clamp(${cr}, 0.0, 1.0)`);
        const ggExpr = buildCurveExprGLSL(node.params.pointsG, `clamp(${cg}, 0.0, 1.0)`);
        const bbExpr = buildCurveExprGLSL(node.params.pointsB, `clamp(${cb}, 0.0, 1.0)`);
        const col = ctx.freshVar("rgbcurve");
        ctx.line(`vec3 ${col} = mix((${ins.color}).rgb, vec3(${rrExpr}, ${ggExpr}, ${bbExpr}), clamp(${ins.fac}, 0.0, 1.0));`);
        return { color: `vec4(${col}, (${ins.color}).a)` };
      },
    },
  },
  {
    id: "color_light_falloff",
    category: "color",
    name: { zh: "光線衰減", en: "Light Falloff" },
    summary: { zh: "調整燈光強度隨距離衰減的方式，只用在燈光材質上。", en: "Adjusts how light intensity falls off with distance — used only on light materials." },
    docBeginner: { zh: "這個節點是接在燈光（Light）的材質上，不是接在一般物體表面上，控制光線隨距離變暗的快慢。", en: "This node connects to a Light's material, not a regular object surface — it controls how quickly light dims with distance." },
    docPro: { zh: "本網站的即時預覽是單一物體材質預覽，沒有可調整的燈光材質圖，此節點先只列文件。", en: "This site's live preview is a single-object material preview without an editable light material graph. Documentation only for now." },
    supported: false,
    inputs: [
      { key: "strength", label: { zh: "強度", en: "Strength" }, type: "float", default: 100, min: 0, max: 1000 },
    ],
    outputs: [
      { key: "quadratic", label: { zh: "二次方", en: "Quadratic" }, type: "float" },
      { key: "linear", label: { zh: "線性", en: "Linear" }, type: "float" },
      { key: "constant", label: { zh: "常數", en: "Constant" }, type: "float" },
    ],
  },
];
