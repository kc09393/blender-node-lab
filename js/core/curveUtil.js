// 共用的「曲線」codegen 工具：把一串已排序的控制點 {x,y}，在編譯期（JS 端）
// 展開成一段逐段三次多項式插值的 GLSL 運算式——重用 Color Ramp 已驗證過的 Cardinal
// （Catmull-Rom）多項式係數公式（segmentPolyCoeffs，見 colorRampUtil.js），讓這個沙盒的
// 數值曲線/RGB 曲線/向量曲線都跟 Blender 的曲線部件一樣是平滑過每個控制點、而不是
// 生硬的逐段直線；跟 Color Ramp 一樣，邊界外側的相鄰點用第一個/最後一個控制點重複代替
// （開放樣條的標準處理方式）。可能像 Blender 一樣在控制點之間輕微 overshoot 出 0-1/-1-1
// 範圍外，這是平滑曲線本身的正常行為，不是 bug。
import { segmentPolyCoeffs } from "./colorRampUtil.js";

function glslFloat(n) {
  const num = Number(n) || 0;
  return Number.isInteger(num) ? `${num}.0` : `${num}`;
}

function hornerExpr(coeffs, tExpr) {
  const [a, b, c, d] = coeffs;
  return `(((${glslFloat(a)}*${tExpr}+${glslFloat(b)})*${tExpr}+${glslFloat(c)})*${tExpr}+${glslFloat(d)})`;
}

export function buildCurveExprGLSL(points, xExpr) {
  let pts = [...(points || [])].sort((a, b) => a.x - b.x);
  if (pts.length === 0) pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
  if (pts.length === 1) pts = [pts[0], pts[0]];

  const x = `(${xExpr})`;

  let expr = null;
  for (let i = pts.length - 2; i >= 0; i--) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const span = glslFloat(Math.max(p1.x - p0.x, 0.0001));
    const t = `clamp((${x} - ${glslFloat(p0.x)}) / ${span}, 0.0, 1.0)`;
    const yPrev = pts[Math.max(i - 1, 0)].y;
    const yNext = pts[Math.min(i + 2, pts.length - 1)].y;
    const coeffs = segmentPolyCoeffs("cardinal", yPrev, p0.y, p1.y, yNext);
    const seg = hornerExpr(coeffs, t);
    expr = expr === null ? seg : `(${x} < ${glslFloat(p1.x)}) ? (${seg}) : (${expr})`;
  }
  return expr;
}
