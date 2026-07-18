// Color Ramp 的插值/色彩空間 codegen 工具。比照 Blender 的 Color Ramp 部件：
// - 色彩空間（Color Mode）：RGB / HSV / HSL，決定「在哪個色彩空間裡做插值」再轉回 RGB。
// - 插值方式（Interpolation）：線性 / 緩動 / 原始（Cardinal）/ B－樣條 / 常量。
// 五種插值方式全部可以化簡成「每個色版獨立、逐段三次多項式 a*t³+b*t²+c*t+d」，
// 係數在編譯期（JS）算好、烘進 GLSL 常數運算式，執行期只需要算一次 Horner 形式的多項式。

function rgbToHsv([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function rgbToHsl([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

// 把 RGBA 停駐點顏色轉成工作色彩空間的 4 元素向量 [c0, c1, c2, a]。
function toWorkingSpace(rgba, colorMode) {
  const [r, g, b, a] = rgba;
  if (colorMode === "hsv") {
    const [h, s, v] = rgbToHsv([r, g, b]);
    return [h, s, v, a ?? 1];
  }
  if (colorMode === "hsl") {
    const [h, s, l] = rgbToHsl([r, g, b]);
    return [h, s, l, a ?? 1];
  }
  return [r, g, b, a ?? 1];
}

// HSV/HSL 模式下，色相（Hue）是環狀的（0 跟 1 是同一個角度）。相鄰停駐點的色相如果直接內插，
// 可能會繞遠路（例如從 0.9 到 0.1，直接內插會經過 0.5 的位置，等於繞了半圈）。
// 這裡把每個停駐點的色相「攤平」成連續數值（不 mod 1），依 Hue Interpolation 選項決定往哪個
// 方向繞，這樣色相這個色版就能跟其他色版一樣，直接套用同一套逐段多項式機制，最後再 mod 1 轉回合法角度。
// 跟 Blender 一致的 4 種模式：
// - near（近端）：走最短路徑（預設，也是這個沙盒過去唯一支援的行為）。
// - far（遠端）：near 的反向，故意繞遠路（兩色相同時，任取一個方向繞整整一圈）。
// - ccw（逆時針）：色相一律遞增，不管哪個方向比較短。
// - cw（順時針）：色相一律遞減，不管哪個方向比較短。
// （CW/CCW 在「H 是抽象 0-1 數值、非實際色輪角度」的前提下取「遞增＝一個方向」的慣例定義，
// 兩者互為相反、行為明確一致，跟 Blender 的「固定往同一個方向繞」精神一致。）
function unwrapHueChannel(values, hueInterp) {
  const mode = hueInterp || "near";
  const out = [values[0]];
  for (let i = 1; i < values.length; i++) {
    const prevWrapped = ((out[i - 1] % 1) + 1) % 1;
    const raw = values[i] - prevWrapped; // 跟上一個攤平值的原始差距
    let delta;
    if (mode === "far") {
      delta = raw - Math.round(raw); // 先折進最短路徑 [-0.5, 0.5]
      delta += delta > 0 ? -1 : 1; // 再翻到比較遠的那一邊；剛好相等（0）時任選一個方向繞整圈
    } else if (mode === "ccw") {
      delta = ((raw % 1) + 1) % 1; // 一律非負＝色相持續遞增
    } else if (mode === "cw") {
      delta = (((raw % 1) + 1) % 1) - 1; // 一律非正＝色相持續遞減
    } else {
      delta = raw - Math.round(raw); // near：最短路徑
    }
    out.push(out[i - 1] + delta);
  }
  return out;
}

// 給定四個相鄰控制值（前一點/本段起點/本段終點/下一點）跟插值方式，
// 回傳這一段（本地 t ∈ [0,1]）的三次多項式係數 [a, b, c, d]（a*t³+b*t²+c*t+d）。
export function segmentPolyCoeffs(mode, vPrev, v0, v1, vNext) {
  switch (mode) {
    case "constant":
      return [0, 0, 0, v0];
    case "ease": {
      const d = v1 - v0;
      return [-2 * d, 3 * d, 0, v0];
    }
    case "cardinal": {
      const m0 = (v1 - vPrev) / 2;
      const m1 = (vNext - v0) / 2;
      const a = 2 * v0 + m0 - 2 * v1 + m1;
      const b = -3 * v0 - 2 * m0 + 3 * v1 - m1;
      const c = m0;
      return [a, b, c, v0];
    }
    case "bspline": {
      const a = (-vPrev + 3 * v0 - 3 * v1 + vNext) / 6;
      const b = (3 * vPrev - 6 * v0 + 3 * v1) / 6;
      const c = (-3 * vPrev + 3 * v1) / 6;
      const d = (vPrev + 4 * v0 + v1) / 6;
      return [a, b, c, d];
    }
    default: // linear
      return [0, 0, v1 - v0, v0];
  }
}

function glslFloat(n) {
  const num = Number(n) || 0;
  return Number.isInteger(num) ? `${num}.0` : `${num}`;
}

// Horner 形式：((a*t + b)*t + c)*t + d
function hornerExpr(coeffs, tExpr) {
  const [a, b, c, d] = coeffs;
  return `(((${glslFloat(a)}*${tExpr}+${glslFloat(b)})*${tExpr}+${glslFloat(c)})*${tExpr}+${glslFloat(d)})`;
}

// 給節點卡片的插值方式下拉選單用的直觀示意圖：用一組參考停駐點（黑→白→黑）算出「黑到白」
// 這一段搭配前後鄰居的實際曲線形狀，重用跟真正編譯進 GLSL 完全同一套多項式係數公式
// （segmentPolyCoeffs），不是另外手工畫近似曲線，示意圖畫的就是真正會發生的形狀。
export function buildInterpolationPreviewCSS(mode) {
  const coeffs = segmentPolyCoeffs(mode, 0, 0, 1, 0);
  const [a, b, c, d] = coeffs;
  const stops = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const v = Math.max(0, Math.min(1, ((a * t + b) * t + c) * t + d));
    const gray = Math.round(v * 255);
    stops.push(`rgb(${gray},${gray},${gray}) ${(t * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

// 主要進入點：把一串停駐點依照 colorMode/interpolation 編譯成一段 GLSL vec4 運算式（RGBA）。
// fac：GLSL 字串，係數輸入。
export function buildColorRampExprGLSL(stops, colorMode, interpolation, facExpr, hueInterp) {
  const cm = colorMode || "rgb";
  const interp = interpolation || "linear";

  // 每個停駐點轉成工作色彩空間的 4 元素向量；HSV/HSL 模式下把色相攤平成連續數值。
  const working = stops.map((s) => toWorkingSpace(s.color, cm));
  let channels = [
    working.map((w) => w[0]),
    working.map((w) => w[1]),
    working.map((w) => w[2]),
    working.map((w) => w[3]),
  ];
  if (cm !== "rgb") channels[0] = unwrapHueChannel(channels[0], hueInterp);

  const fac = `(${facExpr})`;
  let expr = null;
  for (let i = stops.length - 2; i >= 0; i--) {
    const span = glslFloat(Math.max(stops[i + 1].position - stops[i].position, 0.0001));
    const t = `clamp((${fac} - ${glslFloat(stops[i].position)}) / ${span}, 0.0, 1.0)`;

    const chanExprs = channels.map((chVals) => {
      const vPrev = chVals[Math.max(i - 1, 0)];
      const v0 = chVals[i];
      const v1 = chVals[i + 1];
      const vNext = chVals[Math.min(i + 2, chVals.length - 1)];
      const coeffs = segmentPolyCoeffs(interp, vPrev, v0, v1, vNext);
      return hornerExpr(coeffs, t);
    });

    let seg;
    if (cm === "rgb") {
      seg = `clamp(vec4(${chanExprs.join(", ")}), 0.0, 1.0)`;
    } else {
      const hueExpr = `mod(${chanExprs[0]}, 1.0)`;
      const satExpr = `clamp(${chanExprs[1]}, 0.0, 1.0)`;
      const valExpr = `clamp(${chanExprs[2]}, 0.0, 1.0)`;
      const alphaExpr = `clamp(${chanExprs[3]}, 0.0, 1.0)`;
      const conv = cm === "hsv" ? "bml_hsv2rgb" : "bml_hsl2rgb";
      seg = `vec4(${conv}(vec3(${hueExpr}, ${satExpr}, ${valExpr})), ${alphaExpr})`;
    }

    expr = expr === null ? seg : `(${fac} < ${glslFloat(stops[i + 1].position)}) ? (${seg}) : (${expr})`;
  }

  // 常量（Constant）插值模式下，segmentPolyCoeffs 每一段固定回傳「起點顏色」（poly(t) 不管 t
  // 多少都等於 v0），這對「維持前一色，到下一個 stop 才跳下一色」的逐段行為沒問題，但『最後
  // 一段』的公式永遠是倒數第二個 stop 的顏色，導致 fac 超出最後一個 stop 的位置時，最後一個
  // stop 的顏色永遠顯示不出來（只有 2 個 stop 時尤其嚴重：最後一色完全無法出現）。額外包一層
  // 「fac 已經到達或超過最後一個 stop 位置」的檢查，直接回傳該 stop 的原始顏色，不透過任何
  // 分段公式（constant 模式本來就該是分段常數/階梯函式，這裡補上遺漏的最後一階）。
  if (interp === "constant" && stops.length >= 1) {
    const lastIdx = stops.length - 1;
    const lastChan = channels.map((chVals) => chVals[lastIdx]);
    let lastColorExpr;
    if (cm === "rgb") {
      lastColorExpr = `vec4(${lastChan.map(glslFloat).join(", ")})`;
    } else {
      const hueExpr = `mod(${glslFloat(lastChan[0])}, 1.0)`;
      const conv = cm === "hsv" ? "bml_hsv2rgb" : "bml_hsl2rgb";
      lastColorExpr = `vec4(${conv}(vec3(${hueExpr}, ${glslFloat(lastChan[1])}, ${glslFloat(lastChan[2])})), ${glslFloat(lastChan[3])})`;
    }
    expr = `(${fac} >= ${glslFloat(stops[lastIdx].position)}) ? (${lastColorExpr}) : (${expr})`;
  }
  return expr;
}
