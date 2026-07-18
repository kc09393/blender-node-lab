import { buildCurveExprGLSL } from "../../js/core/curveUtil.js";
import { buildColorRampExprGLSL, buildInterpolationPreviewCSS } from "../../js/core/colorRampUtil.js";

// Converter 分類：對數值/顏色做轉換與運算的節點。
export default [
  {
    id: "converter_math",
    category: "converter",
    name: { zh: "數學", en: "Math" },
    summary: { zh: "對兩個數值做加減乘除等運算，是最基礎的數值調整工具。", en: "Performs arithmetic on two float values — the most basic numeric utility node." },
    docBeginner: {
      zh: "Math 節點就是計算機：選擇一種運算（Add/Subtract/Multiply...），輸入數值，輸出結果。常用來把某個節點的輸出「乘一個倍率」或「加一點偏移」後再接到下一個節點。",
      en: "The Math node is a calculator: pick an operation (Add/Subtract/Multiply...), feed in values, get the result. Commonly used to scale or offset another node's output before feeding it downstream.",
    },
    docPro: {
      zh: "運算清單盡量對齊 Blender 完整版（含三角函數、Round/Modulo/Wrap/Ping-Pong 等）。跟 Blender 不同的地方：Blender 會依選的運算方式動態隱藏用不到的插槽（例如 Sine 只顯示 1 個），本沙盒為了架構簡單，固定顯示 3 個數值輸入，用不到的插槽直接忽略即可，不影響結果。Clamp 開關會把最終結果夾在 0-1 之間。",
      en: "The operation list closely mirrors full Blender (including trig functions, Round/Modulo/Wrap/Ping-Pong, etc). Difference from Blender: Blender dynamically hides sockets you don't need based on the chosen operation (e.g. Sine shows only 1); this sandbox always shows 3 value inputs for architectural simplicity — unused ones are simply ignored. The Clamp toggle clamps the final result to 0-1.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "value1", label: { zh: "數值", en: "Value" }, type: "float", default: 0.5, min: -10, max: 10, step: 0.01 },
      { key: "value2", label: { zh: "數值", en: "Value" }, type: "float", default: 0.5, min: -10, max: 10, step: 0.01 },
      { key: "value3", label: { zh: "數值", en: "Value" }, type: "float", default: 0, min: -10, max: 10, step: 0.01 },
    ],
    settings: [
      {
        key: "operation",
        uiType: "select",
        label: { zh: "運算", en: "Operation" },
        default: "add",
        options: [
          { value: "add", label: { zh: "相加 Add", en: "Add" }, group: "函式 Functions" },
          { value: "subtract", label: { zh: "相減 Subtract", en: "Subtract" }, group: "函式 Functions" },
          { value: "multiply", label: { zh: "相乘 Multiply", en: "Multiply" }, group: "函式 Functions" },
          { value: "multiply_add", label: { zh: "乘加 Multiply Add", en: "Multiply Add" }, group: "函式 Functions" },
          { value: "divide", label: { zh: "相除 Divide", en: "Divide" }, group: "函式 Functions" },
          { value: "power", label: { zh: "次方 Power", en: "Power" }, group: "函式 Functions" },
          { value: "logarithm", label: { zh: "對數 Logarithm", en: "Logarithm" }, group: "函式 Functions" },
          { value: "sqrt", label: { zh: "平方根 Square Root", en: "Square Root" }, group: "函式 Functions" },
          { value: "inverse_sqrt", label: { zh: "倒數平方根 Inverse Sqrt", en: "Inverse Square Root" }, group: "函式 Functions" },
          { value: "absolute", label: { zh: "絕對值 Absolute", en: "Absolute" }, group: "函式 Functions" },
          { value: "exponent", label: { zh: "指數 Exponent", en: "Exponent" }, group: "函式 Functions" },
          { value: "minimum", label: { zh: "取最小 Minimum", en: "Minimum" }, group: "比較 Comparison" },
          { value: "maximum", label: { zh: "取最大 Maximum", en: "Maximum" }, group: "比較 Comparison" },
          { value: "less_than", label: { zh: "小於 Less Than", en: "Less Than" }, group: "比較 Comparison" },
          { value: "greater_than", label: { zh: "大於 Greater Than", en: "Greater Than" }, group: "比較 Comparison" },
          { value: "sign", label: { zh: "正負號 Sign", en: "Sign" }, group: "比較 Comparison" },
          { value: "compare", label: { zh: "比較 Compare", en: "Compare" }, group: "比較 Comparison" },
          { value: "smooth_min", label: { zh: "平滑最小 Smooth Min", en: "Smooth Min" }, group: "比較 Comparison" },
          { value: "smooth_max", label: { zh: "平滑最大 Smooth Max", en: "Smooth Max" }, group: "比較 Comparison" },
          { value: "round", label: { zh: "四捨五入 Round", en: "Round" }, group: "捨入 Rounding" },
          { value: "floor", label: { zh: "無條件捨去 Floor", en: "Floor" }, group: "捨入 Rounding" },
          { value: "ceil", label: { zh: "無條件進位 Ceil", en: "Ceil" }, group: "捨入 Rounding" },
          { value: "truncate", label: { zh: "截斷 Truncate", en: "Truncate" }, group: "捨入 Rounding" },
          { value: "fraction", label: { zh: "小數部分 Fraction", en: "Fraction" }, group: "捨入 Rounding" },
          { value: "modulo", label: { zh: "取餘 Modulo", en: "Modulo" }, group: "捨入 Rounding" },
          { value: "floored_modulo", label: { zh: "向下取餘 Floored Modulo", en: "Floored Modulo" }, group: "捨入 Rounding" },
          { value: "wrap", label: { zh: "環繞 Wrap", en: "Wrap" }, group: "捨入 Rounding" },
          { value: "snap", label: { zh: "吸附 Snap", en: "Snap" }, group: "捨入 Rounding" },
          { value: "ping_pong", label: { zh: "來回 Ping-Pong", en: "Ping-Pong" }, group: "捨入 Rounding" },
          { value: "sine", label: { zh: "正弦 Sine", en: "Sine" }, group: "三角函數 Trigonometric" },
          { value: "cosine", label: { zh: "餘弦 Cosine", en: "Cosine" }, group: "三角函數 Trigonometric" },
          { value: "tangent", label: { zh: "正切 Tangent", en: "Tangent" }, group: "三角函數 Trigonometric" },
          { value: "arcsine", label: { zh: "反正弦 Arcsine", en: "Arcsine" }, group: "三角函數 Trigonometric" },
          { value: "arccosine", label: { zh: "反餘弦 Arccosine", en: "Arccosine" }, group: "三角函數 Trigonometric" },
          { value: "arctangent", label: { zh: "反正切 Arctangent", en: "Arctangent" }, group: "三角函數 Trigonometric" },
          { value: "arctan2", label: { zh: "反正切2 Arctan2", en: "Arctan2" }, group: "三角函數 Trigonometric" },
          { value: "hyperbolic_sine", label: { zh: "雙曲正弦 Hyperbolic Sine", en: "Hyperbolic Sine" }, group: "三角函數 Trigonometric" },
          { value: "hyperbolic_cosine", label: { zh: "雙曲餘弦 Hyperbolic Cosine", en: "Hyperbolic Cosine" }, group: "三角函數 Trigonometric" },
          { value: "hyperbolic_tangent", label: { zh: "雙曲正切 Hyperbolic Tangent", en: "Hyperbolic Tangent" }, group: "三角函數 Trigonometric" },
          { value: "to_radians", label: { zh: "轉弧度 To Radians", en: "To Radians" }, group: "轉換 Conversion" },
          { value: "to_degrees", label: { zh: "轉角度 To Degrees", en: "To Degrees" }, group: "轉換 Conversion" },
        ],
      },
      { key: "clamp", uiType: "bool", label: { zh: "夾值 Clamp", en: "Clamp" }, default: false },
    ],
    outputs: [{ key: "value", label: { zh: "數值", en: "Value" }, type: "float" }],
    glsl: {
      emit(ctx, ins, node) {
        const op = node.params.operation || "add";
        const a = `(${ins.value1})`;
        const b = `(${ins.value2})`;
        const c = `(${ins.value3})`;
        const exprMap = {
          add: `${a} + ${b}`,
          subtract: `${a} - ${b}`,
          multiply: `${a} * ${b}`,
          multiply_add: `${a} * ${b} + ${c}`,
          divide: `(abs(${b}) > 0.0001 ? ${a} / ${b} : 0.0)`,
          power: `pow(max(${a}, 0.0001), ${b})`,
          logarithm: `(log(max(${a}, 0.0001)) / log(max(${b}, 0.0001)))`,
          sqrt: `sqrt(max(${a}, 0.0))`,
          inverse_sqrt: `inversesqrt(max(${a}, 0.0001))`,
          absolute: `abs(${a})`,
          exponent: `exp(${a})`,
          minimum: `min(${a}, ${b})`,
          maximum: `max(${a}, ${b})`,
          less_than: `(${a} < ${b} ? 1.0 : 0.0)`,
          greater_than: `(${a} > ${b} ? 1.0 : 0.0)`,
          sign: `sign(${a})`,
          compare: `(abs(${a} - ${b}) <= max(${c}, 0.00001) ? 1.0 : 0.0)`,
          smooth_min: `bml_smoothMin(${a}, ${b}, ${c})`,
          smooth_max: `(-bml_smoothMin(-${a}, -${b}, ${c}))`,
          round: `(sign(${a}) * floor(abs(${a}) + 0.5))`,
          floor: `floor(${a})`,
          ceil: `ceil(${a})`,
          truncate: `(sign(${a}) * floor(abs(${a})))`,
          fraction: `fract(${a})`,
          modulo: `(abs(${b}) > 0.0001 ? (${a} - ${b} * floor(${a} / ${b})) : 0.0)`,
          floored_modulo: `(abs(${b}) > 0.0001 ? mod(${a}, ${b}) : 0.0)`,
          wrap: `bml_wrap(${a}, ${b}, ${c})`,
          snap: `(abs(${b}) > 0.0001 ? floor(${a} / ${b}) * ${b} : 0.0)`,
          ping_pong: `(abs(${b}) > 0.0001 ? (${b} - abs(mod(${a}, 2.0 * ${b}) - ${b})) : 0.0)`,
          sine: `sin(${a})`,
          cosine: `cos(${a})`,
          tangent: `tan(${a})`,
          arcsine: `asin(clamp(${a}, -1.0, 1.0))`,
          arccosine: `acos(clamp(${a}, -1.0, 1.0))`,
          arctangent: `atan(${a})`,
          arctan2: `atan(${a}, ${b})`,
          hyperbolic_sine: `sinh(${a})`,
          hyperbolic_cosine: `cosh(${a})`,
          hyperbolic_tangent: `tanh(${a})`,
          to_radians: `radians(${a})`,
          to_degrees: `degrees(${a})`,
        };
        const v = ctx.freshVar("f");
        const raw = exprMap[op] || exprMap.add;
        ctx.line(`float ${v} = ${node.params.clamp ? `clamp(${raw}, 0.0, 1.0)` : raw};`);
        return { value: v };
      },
    },
  },
  {
    id: "converter_color_ramp",
    category: "converter",
    name: { zh: "顏色漸變", en: "Color Ramp" },
    summary: { zh: "把一個 0-1 的數值對應成漸層顏色，很適合接在 Noise/Fresnel 後面上色。", en: "Maps a 0-1 value to a color gradient — great after Noise or Fresnel for coloring." },
    docBeginner: {
      zh: "Color Ramp 接收一個數值（Fac），依它的大小在幾個顏色停駐點（stop）之間做漸層混合：數值落在哪兩個停駐點之間，就在那兩個顏色間過渡。點漸層條下方的「+」可以新增停駐點、拖曳位置數字調整它在漸層上的位置、點 × 可以刪除（至少要留 2 個）。常接在 Noise Texture 後面把黑白雜訊變成想要的配色。",
      en: "Color Ramp takes a value (Fac) and blends between color stops based on it: wherever the value falls between two stops, it transitions between those two colors. Use the '+' below the gradient bar to add a stop, the position number to move it, and '×' to delete one (at least 2 must remain). Often placed after Noise Texture to recolor black-and-white noise.",
    },
    docPro: {
      zh: "色彩空間（Color Mode）：RGB／HSV／HSL，決定在哪個色彩空間裡做插值再轉回 RGB——HSV/HSL 在跨色相過渡時比較不會像 RGB 一樣中間掉飽和度變灰。插值方式（Interpolation）：線性（Linear）、緩動（Ease，比線性更平滑）、原始（Cardinal）、B－樣條（B-Spline，最平滑但不會剛好經過停駐點本身的顏色）、常量（Constant，硬邊、不過渡）——都跟 Blender 一致。色彩空間選 HSV/HSL 時會多出「色相過渡（Hue Interpolation）」選單，4 種都跟 Blender 一致：近端（Near，走最短路徑）、遠端（Far，故意繞遠路）、順時針／逆時針（CW／CCW，固定往同一個方向繞，不管哪邊比較短）。",
      en: "Color Mode: RGB/HSV/HSL determines which color space the interpolation happens in before converting back to RGB — HSV/HSL avoid the gray desaturation RGB blending causes across hues. Interpolation: Linear, Ease (smoother than linear), Cardinal, B-Spline (smoothest, but doesn't pass exactly through stop colors), and Constant (hard edges, no blending) — all matching Blender. When Color Mode is HSV/HSL, a 'Hue Interpolation' menu appears with 4 options matching Blender: Near (shortest path), Far (deliberately the long way), and Clockwise/Counter-Clockwise (always the same rotation direction, regardless of which is shorter).",
    },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "fac", label: { zh: "係數", en: "Fac" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 }],
    settings: [
      {
        key: "colorMode",
        uiType: "select",
        label: { zh: "色彩空間", en: "Color Mode" },
        default: "rgb",
        options: [
          { value: "rgb", label: { zh: "RGB", en: "RGB" } },
          { value: "hsv", label: { zh: "HSV", en: "HSV" } },
          { value: "hsl", label: { zh: "HSL", en: "HSL" } },
        ],
      },
      {
        key: "hueInterp",
        uiType: "select",
        label: { zh: "色相過渡", en: "Hue Interpolation" },
        // 跟 Blender 一致：色彩空間選 RGB 時完全沒有「色相」這個概念，這個設定不會有
        // 任何效果，Blender 會直接把這個下拉選單藏起來；HSV／HSL 都有 H 分量，兩者都要顯示。
        showIf: (params) => params.colorMode !== "rgb",
        default: "near",
        options: [
          { value: "near", label: { zh: "近端 Near", en: "Near" } },
          { value: "far", label: { zh: "遠端 Far", en: "Far" } },
          { value: "ccw", label: { zh: "逆時針 CCW", en: "Counter-Clockwise" } },
          { value: "cw", label: { zh: "順時針 CW", en: "Clockwise" } },
        ],
      },
      {
        key: "interpolation",
        uiType: "select",
        previewShape: true,
        label: { zh: "插值方式", en: "Interpolation" },
        default: "linear",
        options: [
          { value: "linear", label: { zh: "線性 Linear", en: "Linear" }, cssPattern: buildInterpolationPreviewCSS("linear") },
          { value: "ease", label: { zh: "緩動 Ease", en: "Ease" }, cssPattern: buildInterpolationPreviewCSS("ease") },
          { value: "cardinal", label: { zh: "原始 Cardinal", en: "Cardinal" }, cssPattern: buildInterpolationPreviewCSS("cardinal") },
          { value: "bspline", label: { zh: "B－樣條 B-Spline", en: "B-Spline" }, cssPattern: buildInterpolationPreviewCSS("bspline") },
          { value: "constant", label: { zh: "常量 Constant", en: "Constant" }, cssPattern: buildInterpolationPreviewCSS("constant") },
        ],
      },
      {
        key: "stops",
        uiType: "colorramp",
        label: { zh: "顏色漸變", en: "Color Ramp" },
        default: [
          { position: 0, color: [0, 0, 0, 1] },
          { position: 1, color: [1, 1, 1, 1] },
        ],
      },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "alpha", label: { zh: "透明度", en: "Alpha" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        let stops = [...(node.params.stops || [])].sort((a, b) => a.position - b.position);
        if (stops.length === 0) stops = [{ position: 0, color: [0, 0, 0, 1] }, { position: 1, color: [1, 1, 1, 1] }];
        if (stops.length === 1) stops = [stops[0], stops[0]];

        const fac = `(${ins.fac})`;
        const expr = buildColorRampExprGLSL(stops, node.params.colorMode, node.params.interpolation, fac, node.params.hueInterp);

        const col = ctx.freshVar("ramp");
        ctx.line(`vec4 ${col} = ${expr};`);
        return { color: col, alpha: `${col}.a` };
      },
    },
  },
  {
    id: "converter_clamp",
    category: "converter",
    name: { zh: "夾值", en: "Clamp" },
    summary: { zh: "把數值限制在指定的最小/最大範圍內，避免數值跑出合理區間。", en: "Restricts a value to a min/max range, keeping it inside a sensible bound." },
    docBeginner: {
      zh: "很多插槽（例如 Roughness）本來就只接受 0-1，但接上其他運算後可能超出範圍。Clamp 可以強制把數值夾回你要的範圍內。",
      en: "Many sockets (like Roughness) expect 0-1, but math upstream can push values outside that range. Clamp forces the value back into the range you specify.",
    },
    docPro: { zh: "模式（Type）有 2 種，跟 Blender 一致：最小最大（Min Max，預設，直接把數值夾在 Min 跟 Max 之間，假設 Min ≤ Max）、範圍（Range，如果 Min 比 Max 大會自動把兩者對調再夾值，適合 Min/Max 由上游節點動態算出來、不保證誰大誰小的情況）。公式對照 Blender GPU 著色器原始碼（`gpu_shader_material_clamp.glsl`）核對過一致。", en: "Type has 2 options matching Blender: Min Max (default — clamps directly between Min and Max, assuming Min ≤ Max) and Range (automatically swaps the two before clamping if Min exceeds Max — useful when Min/Max come from upstream nodes and their order isn't guaranteed). Formulas verified against Blender's GPU shader source (`gpu_shader_material_clamp.glsl`)." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "value", label: { zh: "數值", en: "Value" }, type: "float", default: 0.5, min: -10, max: 10, step: 0.01 },
      { key: "min", label: { zh: "最小", en: "Min" }, type: "float", default: 0, min: -10, max: 10, step: 0.01 },
      { key: "max", label: { zh: "最大", en: "Max" }, type: "float", default: 1, min: -10, max: 10, step: 0.01 },
    ],
    settings: [
      {
        key: "clampType",
        uiType: "select",
        label: { zh: "模式", en: "Type" },
        default: "minmax",
        options: [
          { value: "minmax", label: { zh: "最小最大 Min Max", en: "Min Max" } },
          { value: "range", label: { zh: "範圍 Range", en: "Range" } },
        ],
      },
    ],
    outputs: [{ key: "value", label: { zh: "數值", en: "Value" }, type: "float" }],
    glsl: {
      emit(ctx, ins, node) {
        const v = ctx.freshVar("clamp");
        if ((node.params.clampType || "minmax") === "range") {
          ctx.line(`float ${v} = (${ins.max} > ${ins.min}) ? clamp(${ins.value}, ${ins.min}, ${ins.max}) : clamp(${ins.value}, ${ins.max}, ${ins.min});`);
        } else {
          ctx.line(`float ${v} = clamp(${ins.value}, ${ins.min}, ${ins.max});`);
        }
        return { value: v };
      },
    },
  },
  {
    id: "converter_map_range",
    category: "converter",
    name: { zh: "映射範圍", en: "Map Range" },
    summary: { zh: "把數值從一個範圍等比例換算到另一個範圍。", en: "Rescales a value from one range into another." },
    docBeginner: {
      zh: "例如 Noise Texture 輸出通常在 0-1 之間，如果你想要它變成 -1 到 1，就可以用 Map Range 把 From 0-1、To -1-1 設好，數值就會自動等比例換算。",
      en: "For example, Noise Texture usually outputs 0-1. If you want -1 to 1 instead, set From to 0-1 and To to -1 to 1 in Map Range, and the value rescales automatically.",
    },
    docPro: { zh: "插值方式（Interpolation）有 4 種，跟 Blender 一致：線性（Linear，預設）、階梯（Stepped，用 Steps 插槽控制把換算結果量化成幾個階層，公式 `floor(t*(steps+1))/steps` 對照 Blender GPU 著色器原始碼一致）、平滑（Smoothstep，經典的 3t²-2t³ 緩動曲線，兩端速度為零）、更平滑（Smootherstep，Perlin 的 6t⁵-15t⁴+10t³，連二階導數都為零、過渡更柔）。夾值（Clamp）開關把最終結果夾在 To Min 與 To Max 之間（兩者顛倒時自動對調）。跟 Blender 的差異：Blender 的 Clamp 預設開啟，本沙盒為了跟既有存檔的行為 100% 相容，預設關閉。", en: "Interpolation has 4 options matching Blender: Linear (default), Stepped (the Steps socket quantizes the result into discrete levels; the formula `floor(t*(steps+1))/steps` matches Blender's GPU shader source), Smoothstep (the classic 3t²-2t³ ease with zero velocity at both ends), and Smootherstep (Perlin's 6t⁵-15t⁴+10t³, with zero second derivative too — an even softer transition). The Clamp toggle clamps the final result between To Min and To Max (auto-swapping if reversed). Difference from Blender: Blender defaults Clamp to on; this sandbox defaults it off to stay 100% compatible with existing saves." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "value", label: { zh: "數值", en: "Value" }, type: "float", default: 0.5, min: -10, max: 10, step: 0.01 },
      { key: "fromMin", label: { zh: "來源最小", en: "From Min" }, type: "float", default: 0, min: -10, max: 10, step: 0.01 },
      { key: "fromMax", label: { zh: "來源最大", en: "From Max" }, type: "float", default: 1, min: -10, max: 10, step: 0.01 },
      { key: "toMin", label: { zh: "目標最小", en: "To Min" }, type: "float", default: 0, min: -10, max: 10, step: 0.01 },
      { key: "toMax", label: { zh: "目標最大", en: "To Max" }, type: "float", default: 1, min: -10, max: 10, step: 0.01 },
      { key: "steps", label: { zh: "階數 Steps", en: "Steps" }, type: "float", default: 4, min: 0, max: 100, step: 1 },
    ],
    settings: [
      {
        key: "interpolationType",
        uiType: "select",
        label: { zh: "插值方式", en: "Interpolation" },
        default: "linear",
        options: [
          { value: "linear", label: { zh: "線性 Linear", en: "Linear" } },
          { value: "stepped", label: { zh: "階梯 Stepped", en: "Stepped Linear" } },
          { value: "smoothstep", label: { zh: "平滑 Smoothstep", en: "Smooth Step" } },
          { value: "smootherstep", label: { zh: "更平滑 Smootherstep", en: "Smoother Step" } },
        ],
      },
      { key: "clamp", uiType: "bool", label: { zh: "夾值 Clamp", en: "Clamp" }, default: false },
    ],
    outputs: [{ key: "value", label: { zh: "數值", en: "Value" }, type: "float" }],
    glsl: {
      emit(ctx, ins, node) {
        const interp = node.params.interpolationType || "linear";
        const v = ctx.freshVar("maprange");
        const t = ctx.freshVar("mrT");
        ctx.line(`float ${t} = (abs(${ins.fromMax} - ${ins.fromMin}) > 0.0001) ? (${ins.value} - ${ins.fromMin}) / (${ins.fromMax} - ${ins.fromMin}) : 0.0;`);
        if (interp === "stepped") {
          ctx.line(`${t} = ((${ins.steps}) > 0.0) ? floor(${t} * ((${ins.steps}) + 1.0)) / (${ins.steps}) : 0.0;`);
        } else if (interp === "smoothstep") {
          // 先正規化再套 Hermite 多項式：因為 hermite(1-x)=1-hermite(x) 的對稱性，
          // From Min > From Max（反向範圍）時自動等價於 Blender 的 1-smoothstep(max,min,v) 分支。
          ctx.line(`${t} = clamp(${t}, 0.0, 1.0);`);
          ctx.line(`${t} = ${t} * ${t} * (3.0 - 2.0 * ${t});`);
        } else if (interp === "smootherstep") {
          ctx.line(`${t} = clamp(${t}, 0.0, 1.0);`);
          ctx.line(`${t} = ${t} * ${t} * ${t} * (${t} * (${t} * 6.0 - 15.0) + 10.0);`);
        }
        ctx.line(`float ${v} = mix(${ins.toMin}, ${ins.toMax}, ${t});`);
        if (node.params.clamp) {
          ctx.line(`${v} = ((${ins.toMax}) > (${ins.toMin})) ? clamp(${v}, ${ins.toMin}, ${ins.toMax}) : clamp(${v}, ${ins.toMax}, ${ins.toMin});`);
        }
        return { value: v };
      },
    },
  },
  {
    id: "converter_combine_xyz",
    category: "converter",
    name: { zh: "合併 XYZ", en: "Combine XYZ" },
    summary: { zh: "把三個獨立的數值合併成一個向量。", en: "Combines three separate values into a single vector." },
    docBeginner: { zh: "當你需要用三個 Math 節點分別算出 X、Y、Z 再組成一個座標/方向時，就用這個節點把它們接在一起。", en: "When you've computed X, Y, Z separately (e.g. via Math nodes) and need to combine them into one coordinate/direction, this node joins them." },
    docPro: { zh: "跟 Separate XYZ 互為反向操作。", en: "The inverse operation of Separate XYZ." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "x", label: { zh: "X", en: "X" }, type: "float", default: 0, step: 0.01 },
      { key: "y", label: { zh: "Y", en: "Y" }, type: "float", default: 0, step: 0.01 },
      { key: "z", label: { zh: "Z", en: "Z" }, type: "float", default: 0, step: 0.01 },
    ],
    outputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("cxyz");
        ctx.line(`vec3 ${v} = vec3(${ins.x}, ${ins.y}, ${ins.z});`);
        return { vector: v };
      },
    },
  },
  {
    id: "converter_separate_xyz",
    category: "converter",
    name: { zh: "分離 XYZ", en: "Separate XYZ" },
    summary: { zh: "把一個向量拆成三個獨立的數值。", en: "Splits a vector into three separate values." },
    docBeginner: { zh: "想單獨對某個座標軸做運算（例如只放大 Y 軸）時，先用這個節點把 X/Y/Z 拆開。", en: "When you want to operate on just one axis (e.g. scale only Y), use this node to split X/Y/Z apart first." },
    docPro: { zh: "跟 Combine XYZ 互為反向操作。", en: "The inverse operation of Combine XYZ." },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] }],
    outputs: [
      { key: "x", label: { zh: "X", en: "X" }, type: "float" },
      { key: "y", label: { zh: "Y", en: "Y" }, type: "float" },
      { key: "z", label: { zh: "Z", en: "Z" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("sxyz");
        ctx.line(`vec3 ${v} = (${ins.vector});`);
        return { x: `${v}.x`, y: `${v}.y`, z: `${v}.z` };
      },
    },
  },
  {
    id: "converter_combine_color",
    category: "converter",
    name: { zh: "合併顏色", en: "Combine Color" },
    summary: { zh: "把三個（或四個）數值依指定色彩空間合併成一個顏色。", en: "Combines three (or four) values into a single color, interpreted in the chosen color space." },
    docBeginner: { zh: "跟 Combine XYZ 概念一樣，只是合併出來的是顏色而不是座標。模式選 RGB 就是直接給紅/綠/藍；選 HSV/HSL 則是給色相/飽和度/明度（或亮度），節點會自動幫你轉成最終顏色。", en: "Same concept as Combine XYZ, but the result is a color instead of a coordinate. Pick RGB to feed red/green/blue directly, or HSV/HSL to feed hue/saturation/value(or lightness) — the node converts it to a final color for you." },
    docPro: { zh: "模式（Mode）有 3 種，跟 Blender 一致：RGB（直接組出紅/綠/藍）、HSV、HSL。切換模式時前三個輸入的意義會跟著變（R/G/B ↔ H/S/V ↔ H/S/L），對應 Blender 節點本身的行為；HSV/HSL 轉 RGB 的公式跟 Color Ramp（`js/core/colorRampUtil.js`）用同一套定義。", en: "Mode has 3 options matching Blender: RGB (compose red/green/blue directly), HSV, and HSL. Switching mode changes what the first three inputs mean (R/G/B ↔ H/S/V ↔ H/S/L), matching Blender's own node behavior; the HSV/HSL-to-RGB formulas are the same ones used by Color Ramp (`js/core/colorRampUtil.js`)." },
    supported: true,
    vertexSafe: true,
    settings: [
      {
        key: "mode",
        uiType: "select",
        label: { zh: "模式", en: "Mode" },
        default: "rgb",
        options: [
          { value: "rgb", label: { zh: "RGB", en: "RGB" } },
          { value: "hsv", label: { zh: "HSV", en: "HSV" } },
          { value: "hsl", label: { zh: "HSL", en: "HSL" } },
        ],
      },
    ],
    inputs: [
      {
        key: "r",
        label: (p) => (p.mode === "hsv" || p.mode === "hsl" ? { zh: "色相 H", en: "Hue (H)" } : { zh: "R", en: "R" }),
        type: "float",
        default: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "g",
        label: (p) => (p.mode === "hsv" || p.mode === "hsl" ? { zh: "飽和度 S", en: "Saturation (S)" } : { zh: "G", en: "G" }),
        type: "float",
        default: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "b",
        label: (p) =>
          p.mode === "hsv"
            ? { zh: "明度 V", en: "Value (V)" }
            : p.mode === "hsl"
              ? { zh: "亮度 L", en: "Lightness (L)" }
              : { zh: "B", en: "B" },
        type: "float",
        default: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
      { key: "a", label: { zh: "A", en: "A" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
    ],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins, node) {
        const mode = node.params.mode || "rgb";
        const v = ctx.freshVar("ccol");
        if (mode === "hsv") {
          const rgb = ctx.freshVar("ccolRgb");
          ctx.line(`vec3 ${rgb} = bml_hsv2rgb(vec3(${ins.r}, ${ins.g}, ${ins.b}));`);
          ctx.line(`vec4 ${v} = vec4(${rgb}, ${ins.a});`);
        } else if (mode === "hsl") {
          const rgb = ctx.freshVar("ccolRgb");
          ctx.line(`vec3 ${rgb} = bml_hsl2rgb(vec3(${ins.r}, ${ins.g}, ${ins.b}));`);
          ctx.line(`vec4 ${v} = vec4(${rgb}, ${ins.a});`);
        } else {
          ctx.line(`vec4 ${v} = vec4(${ins.r}, ${ins.g}, ${ins.b}, ${ins.a});`);
        }
        return { color: v };
      },
    },
  },
  {
    id: "converter_separate_color",
    category: "converter",
    name: { zh: "分離顏色", en: "Separate Color" },
    summary: { zh: "把一個顏色依指定色彩空間拆成三個（或四個）獨立的數值。", en: "Splits a color into three (or four) separate values, in the chosen color space." },
    docBeginner: { zh: "想單獨處理某個色版（例如只提高紅色）時，先用這個節點拆開再各自調整、最後可以用 Combine Color 接回去。模式選 HSV/HSL 則會拆成色相/飽和度/明度（或亮度），適合只想調整彩度或明暗但不改變色相的情況。", en: "When you want to process a single channel (e.g. boost only red), split it apart with this node, adjust, and rejoin with Combine Color. Choosing HSV/HSL instead splits into hue/saturation/value(or lightness) — handy when you want to adjust brightness or saturation without touching hue." },
    docPro: { zh: "模式（Mode）有 3 種，跟 Blender 一致：RGB、HSV、HSL。切換模式時前三個輸出的意義會跟著變（R/G/B ↔ H/S/V ↔ H/S/L）；RGB 轉 HSV/HSL 的公式跟 Color Ramp（`js/core/colorRampUtil.js`）用同一套定義（互相校對過一致）。", en: "Mode has 3 options matching Blender: RGB, HSV, HSL. Switching mode changes what the first three outputs mean (R/G/B ↔ H/S/V ↔ H/S/L); the RGB-to-HSV/HSL formulas are the same ones used by Color Ramp (`js/core/colorRampUtil.js`), cross-checked for consistency." },
    supported: true,
    vertexSafe: true,
    settings: [
      {
        key: "mode",
        uiType: "select",
        label: { zh: "模式", en: "Mode" },
        default: "rgb",
        options: [
          { value: "rgb", label: { zh: "RGB", en: "RGB" } },
          { value: "hsv", label: { zh: "HSV", en: "HSV" } },
          { value: "hsl", label: { zh: "HSL", en: "HSL" } },
        ],
      },
    ],
    inputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] }],
    outputs: [
      {
        key: "r",
        label: (p) => (p.mode === "hsv" || p.mode === "hsl" ? { zh: "色相 H", en: "Hue (H)" } : { zh: "R", en: "R" }),
        type: "float",
      },
      {
        key: "g",
        label: (p) => (p.mode === "hsv" || p.mode === "hsl" ? { zh: "飽和度 S", en: "Saturation (S)" } : { zh: "G", en: "G" }),
        type: "float",
      },
      {
        key: "b",
        label: (p) =>
          p.mode === "hsv"
            ? { zh: "明度 V", en: "Value (V)" }
            : p.mode === "hsl"
              ? { zh: "亮度 L", en: "Lightness (L)" }
              : { zh: "B", en: "B" },
        type: "float",
      },
      { key: "a", label: { zh: "A", en: "A" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const mode = node.params.mode || "rgb";
        const v = ctx.freshVar("scol");
        ctx.line(`vec4 ${v} = (${ins.color});`);
        if (mode === "hsv") {
          const hsv = ctx.freshVar("scolHsv");
          ctx.line(`vec3 ${hsv} = bml_rgb2hsv(${v}.rgb);`);
          return { r: `${hsv}.x`, g: `${hsv}.y`, b: `${hsv}.z`, a: `${v}.a` };
        }
        if (mode === "hsl") {
          const hsl = ctx.freshVar("scolHsl");
          ctx.line(`vec3 ${hsl} = bml_rgb2hsl(${v}.rgb);`);
          return { r: `${hsl}.x`, g: `${hsl}.y`, b: `${hsl}.z`, a: `${v}.a` };
        }
        return { r: `${v}.r`, g: `${v}.g`, b: `${v}.b`, a: `${v}.a` };
      },
    },
  },
  {
    id: "converter_rgb_to_bw",
    category: "converter",
    name: { zh: "RGB 轉黑白", en: "RGB to BW" },
    summary: { zh: "把彩色依人眼感知的亮度公式轉成一個灰階數值。", en: "Converts a color to a single grayscale value using a perceptual luminance formula." },
    docBeginner: { zh: "跟直接把三色平均不同，這裡用的是符合人眼感知的加權公式（綠色感覺比較亮，佔比較高）。", en: "Unlike simply averaging the three channels, this uses a perceptually-weighted formula (green feels brighter to the eye, so it's weighted more)." },
    docPro: { zh: "公式為 dot(rgb, vec3(0.2126, 0.7152, 0.0722))，跟本網站型別系統裡 color→float 的隱式轉換公式完全一致。", en: "Uses dot(rgb, vec3(0.2126, 0.7152, 0.0722)) — identical to this site's color→float implicit conversion formula." },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] }],
    outputs: [{ key: "value", label: { zh: "數值", en: "Val" }, type: "float" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bw");
        ctx.line(`float ${v} = dot((${ins.color}).rgb, vec3(0.2126, 0.7152, 0.0722));`);
        return { value: v };
      },
    },
  },
  {
    id: "converter_wavelength",
    category: "converter",
    name: { zh: "波長", en: "Wavelength" },
    summary: { zh: "把可見光波長（奈米）轉換成對應的 RGB 顏色。", en: "Converts a visible-light wavelength (nanometers) into the corresponding RGB color." },
    docBeginner: { zh: "常跟 Blackbody 一起用在需要物理精確光色的場合，例如模擬雷射光或稜鏡色散。", en: "Often used with Blackbody for physically accurate light coloring, e.g. simulating laser light or prism dispersion." },
    docPro: { zh: "完整的 CIE 色彩匹配函數需要查表積分，本沙盒改用 Dan Bruton 提出的公開領域可見光波長轉 RGB 分段近似公式，數值走向（380nm 紫→780nm 紅）正確，但不是逐波長精確的色度學計算。", en: "The full CIE color matching functions need a table-based integral. This sandbox uses Dan Bruton's public-domain piecewise approximation for wavelength-to-RGB instead — the direction (380nm violet → 780nm red) is correct, but it isn't a precise per-wavelength colorimetric calculation." },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "wavelength", label: { zh: "波長(nm)", en: "Wavelength (nm)" }, type: "float", default: 500, min: 380, max: 780 }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("wavelen");
        ctx.line(`vec4 ${v} = vec4(bml_wavelengthToRGB(${ins.wavelength}), 1.0);`);
        return { color: v };
      },
    },
  },
  {
    id: "converter_blackbody",
    category: "converter",
    name: { zh: "黑體", en: "Blackbody" },
    summary: { zh: "輸入色溫（K），輸出對應的真實光色（暖橘 ↔ 冷藍）。", en: "Input a color temperature (K) and get the corresponding real-world light color (warm orange ↔ cool blue)." },
    docBeginner: { zh: "攝影棚燈光通常標示色溫，例如日光燈約 5500K、燭光約 1900K。這個節點能把色溫數字直接轉成材質可用的顏色。", en: "Studio lights are often labeled by color temperature — daylight ≈5500K, candlelight ≈1900K. This node converts that number directly into a usable material color." },
    docPro: { zh: "本沙盒用 Tanner Helland 提出的色溫轉 RGB 多項式擬合公式，跟真正逐波長積分普朗克輻射定律的結果非常接近（攝影/燈光軟體的色溫滑桿也常用同一套近似），有效範圍約 800K-12000K。", en: "This sandbox uses Tanner Helland's polynomial fit for color-temperature-to-RGB, which closely matches integrating Planck's law per wavelength (the same approximation many photography/lighting tools use for their color-temperature sliders). Valid range is roughly 800K-12000K." },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "temperature", label: { zh: "色溫(K)", en: "Temperature (K)" }, type: "float", default: 5500, min: 800, max: 12000 }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("blackbody");
        ctx.line(`vec4 ${v} = vec4(bml_blackbody(${ins.temperature}), 1.0);`);
        return { color: v };
      },
    },
  },
  {
    id: "converter_float_curve",
    category: "converter",
    name: { zh: "數值曲線", en: "Float Curve" },
    summary: { zh: "用可拖拉的曲線把一個數值重新對應成另一個數值。", en: "Uses a draggable curve to remap one value into another." },
    docBeginner: { zh: "比 Map Range 更自由：可以做出非線性、S 型、甚至來回震盪的對應關係。", en: "More flexible than Map Range — it can create nonlinear, S-curve, or even oscillating mappings." },
    docPro: { zh: "已補上可拖拉控制點的曲線編輯器（節點卡片上直接拖拉，或用旁邊的數值輸入精確調整）。曲線本身用平滑的 Cardinal（Catmull-Rom 風格）三次多項式逐段穿過每個控制點，跟 Blender 曲線部件的預設平滑手把（Auto Handle）效果一致，不是生硬的逐段直線；跟 Blender 一樣，控制點之間可能會輕微 overshoot 出範圍外，這是平滑曲線正常的行為。差異：本沙盒沒有 Blender「每個控制點可以個別切成 Vector（尖角）手把」的功能，全部控制點都套用同一種平滑演算法。", en: "Now has a draggable curve editor (drag control points directly on the node card, or use the adjacent numeric inputs for precision). The curve itself is a smooth Cardinal (Catmull-Rom-style) cubic that passes through every control point, matching Blender's default smooth (Auto Handle) look rather than a stiff piecewise-straight line; like Blender, it may slightly overshoot the range between points — that's normal smooth-curve behavior. Difference: this sandbox doesn't support Blender's per-point 'Vector' (sharp corner) handle type — every control point uses the same smoothing." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 1, min: 0, max: 1 },
      { key: "value", label: { zh: "數值", en: "Value" }, type: "float", default: 0.5, min: 0, max: 1 },
    ],
    settings: [
      {
        key: "points",
        uiType: "curve",
        label: { zh: "曲線", en: "Curve" },
        domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
        default: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      },
    ],
    outputs: [{ key: "value", label: { zh: "數值", en: "Value" }, type: "float" }],
    glsl: {
      emit(ctx, ins, node) {
        const curveExpr = buildCurveExprGLSL(node.params.points, `clamp(${ins.value}, 0.0, 1.0)`);
        const v = ctx.freshVar("fcurve");
        ctx.line(`float ${v} = mix(${ins.value}, ${curveExpr}, clamp(${ins.fac}, 0.0, 1.0));`);
        return { value: v };
      },
    },
  },
  {
    id: "converter_shader_to_rgb",
    category: "converter",
    name: { zh: "著色器轉 RGB", en: "Shader to RGB" },
    summary: { zh: "把一個已經算好光影的著色器結果「烘」成一般顏色，方便再拿去做卡通量化等後製。", en: "Bakes an already-lit shader result into a plain color, so it can be post-processed (e.g. toon quantization)." },
    docBeginner: { zh: "常見用法：接在 Diffuse BSDF 後面，把光影結果轉成顏色，再用 Color Ramp 量化成卡通風格的幾個色階。", en: "Common use: place after a Diffuse BSDF to convert its lit result into a color, then quantize it into a few tones with Color Ramp for a toon look." },
    docPro: { zh: "這需要在完整光照計算「之後」介入，跟本沙盒目前『先算材質參數、交給 Three.js 統一打光』的架構相反，是之後才能支援的進階節點。", en: "This requires hooking in *after* full lighting is computed — the opposite of this sandbox's current 'compute material params, then let Three.js light it' architecture. A planned future upgrade." },
    supported: false,
    inputs: [{ key: "shader", label: { zh: "著色器", en: "Shader" }, type: "shader", default: null }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
  },
];
