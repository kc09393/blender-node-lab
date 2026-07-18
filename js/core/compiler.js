// 把 Graph 編譯成一段 GLSL 片段，注入到 THREE.MeshPhysicalMaterial 裡。
//
// 設計：不自己重寫一整套光照模型，而是借用 Three.js MeshPhysicalMaterial 既有、
// 已經寫好且效果良好的 IBL/環境反射/Fresnel/色調映射管線——我們只需要在
// `#include <lights_physical_fragment>` 之前，把材質圖算出來的
// baseColor / roughness / metallic / emission / alpha 塞進對應變數即可。
// 這樣「Shader 節點」只需要描述材質參數，不需要處理任何實際的光線積分。
import * as THREE from "three";
import { getNodeType } from "./nodeRegistry.js";
import { castExpr, literalExpr, TYPES } from "./socketTypes.js";
import { getTextureForNode } from "./textureCache.js";

export class CompileError extends Error {
  constructor(message, nodeId) {
    super(message);
    this.nodeId = nodeId;
  }
}

// --- 共用 GLSL：所有編譯出來的材質都會包含這段（未使用到的函式不影響正確性，只是多幾行程式碼）---
const NOISE_GLSL = `
// 3D Simplex noise — Ashima Arts / Stefan Gustavson (MIT License)
vec3 bml_mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 bml_mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 bml_permute(vec4 x){ return bml_mod289(((x*34.0)+1.0)*x); }
vec4 bml_taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float bml_snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = bml_mod289(i);
  vec4 p = bml_permute(bml_permute(bml_permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = bml_taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float bml_noiseFac(vec3 p){
  float n = 0.0; float amp = 0.5; float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    n += amp * (0.5 + 0.5 * bml_snoise(p * freq));
    amp *= 0.5;
    freq *= 2.0;
  }
  return clamp(n, 0.0, 1.0);
}
vec3 bml_noiseColor(vec3 p){
  float r = bml_noiseFac(p + vec3(0.0, 0.0, 0.0));
  float g = bml_noiseFac(p + vec3(37.2, 17.1, 5.4));
  float b = bml_noiseFac(p + vec3(11.5, 71.3, 29.8));
  return vec3(r, g, b);
}
// 可調 Detail/Roughness/Lacunarity 的 FBM（分形疊代雜訊），對應 Blender Noise/Wave Texture
// 的同名參數：Detail＝疊代次數、Roughness＝每疊代振幅衰減比例、Lacunarity＝每疊代頻率倍率。
// 用固定迴圈上限＋提早 break 處理「疊代次數是執行期數值」的情況，相容各版本 GLSL。
float bml_fbmNoise(vec3 p, float detail, float roughness, float lacunarity) {
  float n = 0.0;
  float amp = 1.0;
  float freq = 1.0;
  float maxAmp = 0.0;
  int iterations = int(clamp(detail, 0.0, 15.0)) + 1;
  for (int i = 0; i < 16; i++) {
    if (i >= iterations) break;
    n += amp * (0.5 + 0.5 * bml_snoise(p * freq));
    maxAmp += amp;
    amp *= roughness;
    freq *= lacunarity;
  }
  return maxAmp > 0.0001 ? clamp(n / maxAmp, 0.0, 1.0) : 0.0;
}
vec3 bml_fbmColor(vec3 p, float detail, float roughness, float lacunarity) {
  float r = bml_fbmNoise(p + vec3(0.0, 0.0, 0.0), detail, roughness, lacunarity);
  float g = bml_fbmNoise(p + vec3(37.2, 17.1, 5.4), detail, roughness, lacunarity);
  float b = bml_fbmNoise(p + vec3(11.5, 71.3, 29.8), detail, roughness, lacunarity);
  return vec3(r, g, b);
}

// Noise Texture 的其餘 4 種 Noise Type（跟 Blender 一致），公式逐項對照 Blender 原始碼
// （blenlib/intern/noise.cc 的 multi_fractal/hetero_terrain/hybrid_multi_fractal/
// ridged_multi_fractal）——這 4 種內部都是對「signed 雜訊」（-1~1，不是 fbm 那樣先 remap
// 到 0~1 再疊代）做遞迴運算，Offset/Gain 只有這幾種會用到。刻意不動 bml_fbmNoise/bml_fbmColor
// 本身，維持舊版沙盒（只有 fbm 一種）的既有行為跟存檔 100% 相容。
float bml_multiFractalNoise(vec3 p, float detail, float roughness, float lacunarity) {
  float value = 1.0;
  float pwr = 1.0;
  int iterations = int(clamp(detail, 0.0, 15.0)) + 1;
  for (int i = 0; i < 16; i++) {
    if (i >= iterations) break;
    value *= (pwr * bml_snoise(p) + 1.0);
    pwr *= roughness;
    p *= lacunarity;
  }
  return value;
}
float bml_heteroTerrainNoise(vec3 p, float detail, float roughness, float lacunarity, float offset) {
  float pwr = roughness;
  float value = offset + bml_snoise(p);
  p *= lacunarity;
  int iterations = int(clamp(detail, 0.0, 15.0)) + 1;
  for (int i = 1; i < 16; i++) {
    if (i >= iterations) break;
    float increment = (bml_snoise(p) + offset) * pwr * value;
    value += increment;
    pwr *= roughness;
    p *= lacunarity;
  }
  return value;
}
float bml_hybridMultiFractalNoise(vec3 p, float detail, float roughness, float lacunarity, float offset, float gain) {
  float pwr = 1.0;
  float value = 0.0;
  float weight = 1.0;
  int iterations = int(clamp(detail, 0.0, 15.0)) + 1;
  for (int i = 0; i < 16; i++) {
    if (i >= iterations || weight <= 0.001) break;
    float signal = (bml_snoise(p) + offset) * pwr;
    pwr *= roughness;
    value += weight * signal;
    weight *= gain * signal;
    p *= lacunarity;
  }
  return value;
}
float bml_ridgedMultiFractalNoise(vec3 p, float detail, float roughness, float lacunarity, float offset, float gain) {
  float pwr = roughness;
  float signal = offset - abs(bml_snoise(p));
  signal *= signal;
  float value = signal;
  int iterations = int(clamp(detail, 0.0, 15.0)) + 1;
  for (int i = 1; i < 16; i++) {
    if (i >= iterations) break;
    p *= lacunarity;
    float weight = clamp(signal * gain, 0.0, 1.0);
    signal = offset - abs(bml_snoise(p));
    signal *= signal;
    signal *= weight;
    value += signal * pwr;
    pwr *= roughness;
  }
  return value;
}
// Distortion：套用前先用另外 3 組互不相關的偏移量各取一次雜訊，位移原始座標
// （方向跟 Blender 的 perlin_distortion 一致：3 條軸分別用不同偏移取樣同一種雜訊函式，
// 這裡沿用 bml_fbmColor 已經在用的偏移量魔術數字，唯一新增第三軸的偏移）。
vec3 bml_noiseDistort(vec3 p, float distortion) {
  return p + vec3(
    bml_snoise(p + vec3(37.2, 17.1, 5.4)) * distortion,
    bml_snoise(p + vec3(11.5, 71.3, 29.8)) * distortion,
    bml_snoise(p + vec3(63.7, 4.2, 88.9)) * distortion
  );
}
`;

// 不依賴 dFdx/dFdy/fwidth（片元導數）的輔助函式：純數學運算，vertex shader 也能安全使用。
// Displacement 節點的頂點著色器編譯通道會需要重用這些（Noise/Voronoi/Checker/Magic/Brick 等
// 程序化紋理節點的 emit() 函式本身就是純函式，只要這裡提供的輔助函式在兩種 shader 階段都合法即可）。
const HELPERS_SHARED_GLSL = `
struct BmlBsdf {
  vec3 baseColor;
  float roughness;
  float metallic;
  vec3 emission;
  float alpha;
};

BmlBsdf bml_mixShader(BmlBsdf a, BmlBsdf b, float fac) {
  BmlBsdf r;
  r.baseColor = mix(a.baseColor, b.baseColor, fac);
  r.roughness = mix(a.roughness, b.roughness, fac);
  r.metallic  = mix(a.metallic, b.metallic, fac);
  r.emission  = mix(a.emission, b.emission, fac);
  r.alpha     = mix(a.alpha, b.alpha, fac);
  return r;
}

BmlBsdf bml_addShader(BmlBsdf a, BmlBsdf b) {
  BmlBsdf r;
  r.baseColor = (a.baseColor + b.baseColor) * 0.5;
  r.roughness = (a.roughness + b.roughness) * 0.5;
  r.metallic  = (a.metallic + b.metallic) * 0.5;
  r.emission  = a.emission + b.emission;
  r.alpha     = max(a.alpha, b.alpha);
  return r;
}

// 依 X→Y→Z 軸順序疊加旋轉的矩陣本身（拆成矩陣版本，讓 Mapping 節點的 Texture/Normal
// 類型可以直接 transpose() 這個矩陣求反向旋轉，不用另外湊negate角度+反順序的算法）。
mat3 bml_eulerRotMat3(vec3 eulerDeg) {
  vec3 e = radians(eulerDeg);
  float cx = cos(e.x), sx = sin(e.x);
  float cy = cos(e.y), sy = sin(e.y);
  float cz = cos(e.z), sz = sin(e.z);
  mat3 rx = mat3(1.0,0.0,0.0,  0.0,cx,sx,  0.0,-sx,cx);
  mat3 ry = mat3(cy,0.0,-sy,   0.0,1.0,0.0, sy,0.0,cy);
  mat3 rz = mat3(cz,sz,0.0,   -sz,cz,0.0,  0.0,0.0,1.0);
  return rz * ry * rx;
}
vec3 bml_rotateEuler(vec3 v, vec3 eulerDeg) {
  return bml_eulerRotMat3(eulerDeg) * v;
}

// Rodrigues' rotation formula：繞任意軸旋轉一個向量。
vec3 bml_rotateAxis(vec3 v, vec3 axis, float angleDeg) {
  float a = radians(angleDeg);
  vec3 n = normalize(axis);
  return v * cos(a) + cross(n, v) * sin(a) + n * dot(n, v) * (1.0 - cos(a));
}

// Math 節點用的輔助函式：多項式平滑最小值（Smooth Min）與環繞取值（Wrap）。
float bml_smoothMin(float a, float b, float k) {
  if (k <= 0.0001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float bml_wrap(float value, float maxV, float minV) {
  float range = maxV - minV;
  if (abs(range) < 0.0001) return minV;
  return value - range * floor((value - minV) / range);
}

// Vector Math 節點用的逐分量安全版本（除以 0 / 環繞範圍為 0 時回傳 0，而不是 inf/nan）。
vec3 bml_safeDivVec3(vec3 a, vec3 b) {
  return vec3(
    abs(b.x) > 0.0001 ? a.x / b.x : 0.0,
    abs(b.y) > 0.0001 ? a.y / b.y : 0.0,
    abs(b.z) > 0.0001 ? a.z / b.z : 0.0
  );
}
vec3 bml_safeModVec3(vec3 a, vec3 b) {
  return vec3(
    abs(b.x) > 0.0001 ? mod(a.x, b.x) : 0.0,
    abs(b.y) > 0.0001 ? mod(a.y, b.y) : 0.0,
    abs(b.z) > 0.0001 ? mod(a.z, b.z) : 0.0
  );
}
vec3 bml_wrapVec3(vec3 v, vec3 maxV, vec3 minV) {
  return vec3(bml_wrap(v.x, maxV.x, minV.x), bml_wrap(v.y, maxV.y, minV.y), bml_wrap(v.z, maxV.z, minV.z));
}
vec3 bml_snapVec3(vec3 v, vec3 inc) {
  return vec3(
    abs(inc.x) > 0.0001 ? floor(v.x / inc.x) * inc.x : 0.0,
    abs(inc.y) > 0.0001 ? floor(v.y / inc.y) * inc.y : 0.0,
    abs(inc.z) > 0.0001 ? floor(v.z / inc.z) * inc.z : 0.0
  );
}
vec3 bml_projectVec3(vec3 a, vec3 b) {
  float d = dot(b, b);
  return d > 0.0001 ? b * (dot(a, b) / d) : vec3(0.0);
}

float bml_checker(vec3 p) {
  vec3 pf = floor(p);
  return mod(pf.x + pf.y + pf.z, 2.0);
}

float bml_hash1(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
}
vec3 bml_hash3(vec3 p) {
  vec3 q = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(q) * 43758.5453123);
}

// randomness＝0 時細胞中心退化成完美網格（每個格子的點都在正中央），
// randomness＝1（Blender 預設）時完全隨機跳動，對應 Blender Voronoi Texture 的 Randomness 插槽。
// metric：0=歐式 Euclidean、1=曼哈頓 Manhattan、2=切比雪夫 Chebychev、3=閔可夫斯基 Minkowski，
// 對應 Distance Metric 插槽。Minkowski 公式跟 Blender 原始碼（blenlib/intern/noise.cc 的
// voronoi_distance()）逐項對照過一致：pow(sum(pow(abs(diff), exponent)), 1/exponent)；
// exponent 只有 metric==3 時才有意義，其餘 metric 忽略這個參數。
float bml_voronoiMetricDist(vec3 diff, int metric, float exponent) {
  if (metric == 1) return abs(diff.x) + abs(diff.y) + abs(diff.z);
  if (metric == 2) return max(abs(diff.x), max(abs(diff.y), abs(diff.z)));
  if (metric == 3) {
    float e = max(exponent, 0.0001); // 避免 exponent 太接近 0 時 1.0/e 爆炸成 Inf/NaN
    return pow(pow(abs(diff.x), e) + pow(abs(diff.y), e) + pow(abs(diff.z), e), 1.0 / e);
  }
  return length(diff);
}

// 在以 center 為中心的 3x3x3 鄰域裡找最近（F1）跟次近（F2）的細胞點，
// Smooth F1／Distance to Edge／N-Sphere Radius 都需要同時知道 F1 跟 F2 才能算。
void bml_voronoiSearch(
  vec3 p, float randomness, int metric, float exponent,
  out float f1, out vec3 f1Color, out vec3 f1CellPoint,
  out float f2
) {
  vec3 pi = floor(p);
  vec3 pf = fract(p);
  f1 = 8.0;
  f2 = 8.0;
  f1Color = vec3(0.0);
  f1CellPoint = vec3(0.0);
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 neighbor = vec3(float(x), float(y), float(z));
        vec3 point = bml_hash3(pi + neighbor) * clamp(randomness, 0.0, 1.0);
        vec3 diff = neighbor + point - pf;
        float dist = bml_voronoiMetricDist(diff, metric, exponent);
        if (dist < f1) {
          f2 = f1;
          f1 = dist;
          f1Color = bml_hash3(pi + neighbor + point);
          f1CellPoint = pi + neighbor + point;
        } else if (dist < f2) {
          f2 = dist;
        }
      }
    }
  }
}

// N-Sphere Radius：F1 細胞點本身（不是取樣位置 p）到「它自己最近的鄰居細胞點」距離的一半——
// 是這個細胞點自己能塞進去、不跟鄰居重疊的最大球半徑，所以要以 F1 細胞點為中心再搜一次鄰域。
float bml_voronoiNSphereRadius(vec3 f1CellPoint, float randomness, int metric, float exponent) {
  vec3 pi = floor(f1CellPoint);
  vec3 pf = f1CellPoint - pi;
  float minDist = 8.0;
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 neighbor = vec3(float(x), float(y), float(z));
        if (x == 0 && y == 0 && z == 0) continue;
        vec3 point = bml_hash3(pi + neighbor) * clamp(randomness, 0.0, 1.0);
        vec3 diff = neighbor + point - pf;
        float dist = bml_voronoiMetricDist(diff, metric, exponent);
        if (dist < minDist) minDist = dist;
      }
    }
  }
  return minDist * 0.5;
}


// 對照 Blender node_shader_tex_brick.cc 的 brick() 函式：每一列的磚塊寬度/位移可以依
// Squash/Offset Frequency 週期性變化（不是每列都固定同一種），tint 用來給 Color1/Color2 隨機挑選
// 加一點偏移（Bias）。mortarSmooth 沿用 Blender 的 smoothstep 平滑邊緣，不是死板的二元切換。
float bml_brick(
  vec2 p, float mortarSize, float mortarSmooth, float bias,
  float brickWidth, float rowHeight, float offsetAmount, float offsetFrequency,
  float squashAmount, float squashFrequency, out float tint
) {
  float safeRowHeight = max(rowHeight, 0.001);
  float rownum = floor(p.y / safeRowHeight);
  float offsetFreq = max(floor(offsetFrequency), 1.0);
  float squashFreq = max(floor(squashFrequency), 1.0);
  float squash = (mod(rownum, squashFreq) < 0.5) ? squashAmount : 1.0;
  float effWidth = max(brickWidth * squash, 0.001);
  float rowOffset = (mod(rownum, offsetFreq) < 0.5) ? (effWidth * offsetAmount) : 0.0;
  float bricknum = floor((p.x + rowOffset) / effWidth);

  float localX = fract((p.x + rowOffset) / effWidth);
  float localY = fract(p.y / safeRowHeight);
  float distX = min(localX, 1.0 - localX) * effWidth;
  float distY = min(localY, 1.0 - localY) * safeRowHeight;
  float dist = min(distX, distY);
  float mortar = 1.0 - smoothstep(mortarSize * (1.0 - mortarSmooth), max(mortarSize, 0.0001), dist);

  tint = clamp(bml_hash1(vec3(rownum, bricknum, 0.0)) + bias, 0.0, 1.0);
  return clamp(mortar, 0.0, 1.0);
}

// Blackbody（黑體輻射）近似公式 —— Tanner Helland 的色溫轉 RGB 多項式擬合，
// 廣泛用於攝影/燈光軟體的色溫滑桿，跟真正的普朗克輻射定律積分結果非常接近。
vec3 bml_blackbody(float tempK) {
  float temp = clamp(tempK, 800.0, 12000.0) / 100.0;
  float r = temp <= 66.0 ? 255.0 : 329.698727446 * pow(temp - 60.0, -0.1332047592);
  float g = temp <= 66.0
    ? 99.4708025861 * log(temp) - 161.1195681661
    : 288.1221695283 * pow(temp - 60.0, -0.0755148492);
  float b;
  if (temp >= 66.0) b = 255.0;
  else if (temp <= 19.0) b = 0.0;
  else b = 138.5177312231 * log(temp - 10.0) - 305.0447927307;
  return clamp(vec3(r, g, b) / 255.0, 0.0, 1.0);
}

// Wavelength（波長轉顏色）近似公式 —— Dan Bruton 提出、公開領域的可見光波長轉 RGB 分段公式，
// 常見於教學用的色散/光譜視覺化工具。
vec3 bml_wavelengthToRGB(float wavelength) {
  float w = clamp(wavelength, 380.0, 780.0);
  float r, g, b;
  if (w < 440.0) { r = -(w - 440.0) / 60.0; g = 0.0; b = 1.0; }
  else if (w < 490.0) { r = 0.0; g = (w - 440.0) / 50.0; b = 1.0; }
  else if (w < 510.0) { r = 0.0; g = 1.0; b = -(w - 510.0) / 20.0; }
  else if (w < 580.0) { r = (w - 510.0) / 70.0; g = 1.0; b = 0.0; }
  else if (w < 645.0) { r = 1.0; g = -(w - 645.0) / 65.0; b = 0.0; }
  else { r = 1.0; g = 0.0; b = 0.0; }

  float factor = 1.0;
  if (w < 420.0) factor = 0.3 + 0.7 * (w - 380.0) / 40.0;
  else if (w >= 700.0) factor = 0.3 + 0.7 * (780.0 - w) / 80.0;

  vec3 rgb = vec3(r, g, b) * factor;
  return clamp(pow(rgb, vec3(0.8)), 0.0, 1.0);
}

vec3 bml_rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 bml_hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
// Combine/Separate Color 的 HSL 模式用：rgb -> h/s/l（公式跟 js/core/colorRampUtil.js 的
// rgbToHsl() 同一套定義，只是那邊是 JS、這裡是 GLSL，兩邊互相校對過一致）。
vec3 bml_rgb2hsl(vec3 c) {
  float maxc = max(max(c.r, c.g), c.b);
  float minc = min(min(c.r, c.g), c.b);
  float l = (maxc + minc) * 0.5;
  float d = maxc - minc;
  float h = 0.0;
  float s = 0.0;
  if (d > 0.0001) {
    s = l > 0.5 ? d / max(2.0 - maxc - minc, 0.0001) : d / max(maxc + minc, 0.0001);
    if (maxc == c.r) h = mod((c.g - c.b) / d, 6.0);
    else if (maxc == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
  }
  return vec3(h, s, l);
}
// Color Ramp 的 HSL 色彩空間模式用：h/s/l -> rgb。
float bml_hue2rgbChan(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}
vec3 bml_hsl2rgb(vec3 c) {
  float h = c.x, s = c.y, l = c.z;
  if (s <= 0.0001) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(bml_hue2rgbChan(p, q, h + 1.0 / 3.0), bml_hue2rgbChan(p, q, h), bml_hue2rgbChan(p, q, h - 1.0 / 3.0));
}

// Mix Color 節點用：以下依 W3C/PDF 混合模式規格實作（跟 CSS mix-blend-mode、Photoshop 圖層混合
// 模式同一套定義），a 是底層（原本顏色）、b 是疊上去的顏色。
vec3 bml_blendOverlay(vec3 a, vec3 b) {
  return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
}
vec3 bml_blendDodge(vec3 a, vec3 b) {
  return clamp(a / max(1.0 - b, 0.0001), 0.0, 1.0);
}
vec3 bml_blendBurn(vec3 a, vec3 b) {
  return 1.0 - clamp((1.0 - a) / max(b, 0.0001), 0.0, 1.0);
}
vec3 bml_blendDivide(vec3 a, vec3 b) {
  return mix(vec3(0.0), a / max(b, 0.0001), step(0.0001, b));
}
vec3 bml_softLightD(vec3 x) {
  return mix(((16.0 * x - 12.0) * x + 4.0) * x, sqrt(x), step(0.25, x));
}
vec3 bml_blendSoftLight(vec3 a, vec3 b) {
  vec3 dark = a - (1.0 - 2.0 * b) * a * (1.0 - a);
  vec3 light = a + (2.0 * b - 1.0) * (bml_softLightD(a) - a);
  return mix(dark, light, step(0.5, b));
}
// Hue/Saturation/Color/Value 這 4 種模式跟 HSL 的極座標旋轉無關，是直接對 RGB 做
// Lum（亮度）/Sat（飽和度）的「設定—裁切」運算，這是 PDF 混合模式規格（CSS/Photoshop 都採用）的做法。
float bml_lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
vec3 bml_clipColor(vec3 c) {
  float l = bml_lum(c);
  float n = min(min(c.r, c.g), c.b);
  float x = max(max(c.r, c.g), c.b);
  if (n < 0.0) c = l + (c - l) * l / max(l - n, 0.0001);
  if (x > 1.0) c = l + (c - l) * (1.0 - l) / max(x - l, 0.0001);
  return c;
}
vec3 bml_setLum(vec3 c, float l) { return bml_clipColor(c + (l - bml_lum(c))); }
float bml_sat(vec3 c) { return max(max(c.r, c.g), c.b) - min(min(c.r, c.g), c.b); }
vec3 bml_setSat(vec3 c, float s) {
  float cmax = max(max(c.r, c.g), c.b);
  float cmin = min(min(c.r, c.g), c.b);
  return cmax > cmin ? (c - cmin) * s / (cmax - cmin) : vec3(0.0);
}
vec3 bml_blendHue(vec3 a, vec3 b) { return bml_setLum(bml_setSat(b, bml_sat(a)), bml_lum(a)); }
vec3 bml_blendSaturation(vec3 a, vec3 b) { return bml_setLum(bml_setSat(a, bml_sat(b)), bml_lum(a)); }
vec3 bml_blendColor(vec3 a, vec3 b) { return bml_setLum(b, bml_lum(a)); }
vec3 bml_blendValue(vec3 a, vec3 b) { return bml_setLum(a, bml_lum(b)); }

// Image Texture 的 Cubic 插值：經典的「B-spline 雙三次濾波，用 4 次雙線性取樣模擬 16-tap」
// 技巧（Sigg & Hadwiger 2005，遊戲/著色器業界常用手法），比 Blender 內部真正逐像素的三次
// 卷積核近似但方向/平滑程度一致，優點是只需要硬體原生的雙線性取樣、不用真的採 16 個點。
vec4 bml_cubicWeights(float t) {
  float t2 = t * t;
  float t3 = t2 * t;
  float w0 = -t3 + 3.0 * t2 - 3.0 * t + 1.0;
  float w1 = 3.0 * t3 - 6.0 * t2 + 4.0;
  float w2 = -3.0 * t3 + 3.0 * t2 + 3.0 * t + 1.0;
  float w3 = t3;
  return vec4(w0, w1, w2, w3) / 6.0;
}
vec4 bml_textureBicubic(sampler2D tex, vec2 uv) {
  vec2 texSize = vec2(textureSize(tex, 0));
  vec2 invTexSize = 1.0 / texSize;
  vec2 tuv = uv * texSize - 0.5;
  vec2 fxy = fract(tuv);
  tuv -= fxy;
  vec4 xcubic = bml_cubicWeights(fxy.x);
  vec4 ycubic = bml_cubicWeights(fxy.y);
  vec4 c = tuv.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
  vec4 offset = c + vec4(xcubic.yw, ycubic.yw) / s;
  offset *= invTexSize.xxyy;
  vec4 sample0 = texture2D(tex, offset.xz);
  vec4 sample1 = texture2D(tex, offset.yz);
  vec4 sample2 = texture2D(tex, offset.xw);
  vec4 sample3 = texture2D(tex, offset.yw);
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
}
`;

// 依賴 dFdx/dFdy/fwidth（片元導數，只有 fragment shader 才有）的輔助函式——只會被
// Bump/Normal Map/Wireframe 這幾個「vertexSafe 未設為 true」的節點用到，只注入 fragment shader。
const HELPERS_FRAGMENT_ONLY_GLSL = `
// 用螢幕空間導數（dFdx/dFdy）近似 Bump：把「高度」的局部斜率換算成法線偏移，
// 不需要額外的切線/副切線資料，是常見的 surface-gradient bump 技巧。
vec3 bml_bump(float height, float strength, vec3 N) {
  vec3 dPdx = dFdx(vViewPosition);
  vec3 dPdy = dFdy(vViewPosition);
  float dHdx = dFdx(height);
  float dHdy = dFdy(height);
  vec3 surfGrad = dHdx * cross(N, dPdy) - dHdy * cross(N, dPdx);
  return normalize(N - strength * surfGrad);
}

float bml_fresnel(vec3 N, float ior) {
  vec3 V = normalize(vViewPosition);
  float cosTheta = clamp(dot(normalize(N), V), 0.0, 1.0);
  float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
  return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
}

// 用螢幕空間導數（dFdx/dFdy）現算一組切線基底（cotangent frame，Christian Schüler 的技巧），
// 不需要網格預先算好的 Tangent/Bitangent 頂點屬性，就能把切線空間法線貼圖轉到與 N 一致的空間。
mat3 bml_cotangentFrame(vec3 N, vec3 p, vec2 uv) {
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float invmax = inversesqrt(max(dot(T, T), dot(B, B)) + 1e-8);
  return mat3(T * invmax, B * invmax, N);
}

vec3 bml_normalMap(vec3 mapColor, float strength, vec3 N) {
  vec3 mapN = mapColor * 2.0 - 1.0;
  mapN.xy *= strength;
  mat3 tbn = bml_cotangentFrame(N, -vViewPosition, vUv);
  return normalize(tbn * mapN);
}

// Wireframe（線框）節點用：靠螢幕空間導數（fwidth）判斷目前片元離三角形的哪條邊比較近，
// 不需要額外的鄰接資料——bary 是頂點的重心座標屬性（每個頂點分別是 (1,0,0)/(0,1,0)/(0,0,1)，
// 由 preview3d.js 在建立幾何體時附加），三個分量中任一個接近 0 就代表片元落在該分量對應的邊上。
float bml_wireframeFactor(vec3 bary, float size) {
  vec3 d = fwidth(bary);
  vec3 a3 = smoothstep(vec3(0.0), d * max(size, 0.0001) * 60.0, bary);
  return 1.0 - min(min(a3.x, a3.y), a3.z);
}
`;

let varCounter = 0;
function freshVar(prefix) {
  varCounter += 1;
  return `bml_${prefix}${varCounter}`;
}

function shaderDefaultExpr() {
  return "BmlBsdf(vec3(0.0), 0.5, 0.0, vec3(0.0), 1.0)";
}

function resolveInputExpr(graph, node, inputDef, nodeOutputVars, ctxTarget = "fragment") {
  const link = graph.getIncomingLink(node.id, inputDef.key);
  if (!link) {
    if (inputDef.type === TYPES.SHADER) return shaderDefaultExpr();
    return literalExpr(node.params[inputDef.key], inputDef.type, ctxTarget);
  }
  const fromNode = graph.nodes.get(link.fromNode);
  const fromType = getNodeType(fromNode.typeId);
  const outputDef = fromType.outputs.find((o) => o.key === link.fromSocket);
  const rawExpr = nodeOutputVars.get(link.fromNode)[link.fromSocket];
  return castExpr(rawExpr, outputDef.type, inputDef.type);
}

// 從 Material Output 的 Surface 插槽往回做拓樸排序，只編譯真正有連接到最終輸出的節點。
// 用 visiting（目前在遞迴堆疊上）+ visited（已經完全處理完）兩個集合偵測循環連線
// （例如 A 的輸入接 B、B 的輸入又接回 A）。沒有這層偵測的話，循環會讓後面的 emit()
// 讀到還沒被賦值的節點輸出變數，丟出很難懂的原始 TypeError，而不是清楚的錯誤訊息。
function topoOrderFromSurface(graph, startNodeId) {
  const visited = new Set();
  const visiting = new Set();
  const order = [];
  function visit(nodeId) {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      const typeDef = getNodeType(graph.nodes.get(nodeId)?.typeId);
      const label = typeDef ? `${typeDef.name.zh} / ${typeDef.name.en}` : nodeId;
      throw new CompileError(`材質圖裡有循環連線（節點「${label}」的輸入直接或間接接回自己的輸出），請拆開其中一條連線。`, nodeId);
    }
    visiting.add(nodeId);
    const node = graph.nodes.get(nodeId);
    if (!node) {
      visiting.delete(nodeId);
      return;
    }
    const typeDef = getNodeType(node.typeId);
    for (const inputDef of typeDef.inputs) {
      const link = graph.getIncomingLink(nodeId, inputDef.key);
      if (link) visit(link.fromNode);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    order.push(nodeId);
  }
  visit(startNodeId);
  return order;
}

// 編譯一條「從某個起點往回走」的節點鏈，共用給 Surface（fragment）與 Displacement（vertex）
// 兩種編譯目標。ctxTarget="vertex" 時，任何 typeDef.vertexSafe !== true 的節點會直接丟出
// CompileError——vertex shader 沒有 dFdx/dFdy/fwidth 這些片元導數，也沒有 vUv/vNormal 這些
// fragment 端 varying，硬編譯這類節點只會產生看起來能過、但邏輯錯誤或直接編譯失敗的 shader。
function compileChain(graph, startNodeId, textureNodeIds, ctxTarget) {
  const order = topoOrderFromSurface(graph, startNodeId);
  const lines = [];
  const nodeOutputVars = new Map();
  for (const nodeId of order) {
    const node = graph.nodes.get(nodeId);
    const typeDef = getNodeType(node.typeId);
    if (!typeDef.glsl) {
      throw new CompileError(`節點「${typeDef.name.zh} / ${typeDef.name.en}」目前只有百科說明，沙盒中還不支援即時預覽。`, nodeId);
    }
    if (ctxTarget === "vertex" && typeDef.vertexSafe !== true) {
      throw new CompileError(
        `節點「${typeDef.name.zh} / ${typeDef.name.en}」無法用在 Displacement——它需要只有 Fragment 端才有的資料（例如螢幕空間導數或目前的著色法線），Displacement 是在頂點著色器裡運算的，請改用 Math／Vector Math／程序化紋理等節點。`,
        nodeId
      );
    }
    const ins = {};
    for (const inputDef of typeDef.inputs) {
      ins[inputDef.key] = resolveInputExpr(graph, node, inputDef, nodeOutputVars, ctxTarget);
    }
    const ctx = {
      freshVar,
      line: (s) => lines.push(s),
      useTexture: (id) => {
        if (!textureNodeIds.includes(id)) textureNodeIds.push(id);
        return `bml_tex_${id}`;
      },
    };
    try {
      const outs = typeDef.glsl.emit(ctx, ins, node);
      nodeOutputVars.set(nodeId, outs);
    } catch (err) {
      if (err instanceof CompileError) throw err;
      throw new CompileError(`節點「${typeDef.name.zh}」編譯失敗：${err.message}`, nodeId);
    }
  }
  return { lines, nodeOutputVars };
}

// 回傳 { body, vertexBody, textureNodeIds, needsBarycentric }，或丟出 CompileError。
// textureNodeIds：圖裡用到「Image Texture」之類需要真正圖片資料的節點 id 清單，
// 呼叫端 (applyFragmentChunk) 會依此建立對應的 sampler2D uniform。
// needsBarycentric：圖裡有沒有用到 Wireframe 這種需要重心座標頂點屬性的節點——
// 只有真的用到才在 vertex shader 多插一段 varying 傳遞，避免每個材質都白白多付出這個成本。
// vertexBody：Material Output 的 Displacement 插槽有接線時，才會是非空字串。
export function compileGraph(graph) {
  varCounter = 0;
  const outputNode = [...graph.nodes.values()].find((n) => getNodeType(n.typeId)?.category === "output");
  if (!outputNode) {
    throw new CompileError("材質圖裡沒有「材質輸出」節點，請先從左側面板加入 Material Output。");
  }
  const surfaceLink = graph.getIncomingLink(outputNode.id, "surface");
  const displacementLink = graph.getIncomingLink(outputNode.id, "displacement");

  const textureNodeIds = [];
  let needsBarycentric = false;
  let finalExpr = shaderDefaultExpr();
  let surfaceLines = [];

  if (surfaceLink) {
    const { lines, nodeOutputVars } = compileChain(graph, surfaceLink.fromNode, textureNodeIds, "fragment");
    surfaceLines = lines;
    for (const nodeId of nodeOutputVars.keys()) {
      const typeDef = getNodeType(graph.nodes.get(nodeId).typeId);
      if (typeDef.needsBarycentric) needsBarycentric = true;
    }
    const fromNode = graph.nodes.get(surfaceLink.fromNode);
    const fromType = getNodeType(fromNode.typeId);
    const outDef = fromType.outputs.find((o) => o.key === surfaceLink.fromSocket);
    finalExpr = castExpr(
      nodeOutputVars.get(surfaceLink.fromNode)[surfaceLink.fromSocket],
      outDef.type,
      TYPES.SHADER
    );
  }

  const body = `
  // ---- Blender Material Lab: 由節點圖產生 ----
  ${surfaceLines.join("\n  ")}
  BmlBsdf bml_final = ${finalExpr};
  diffuseColor.rgb = bml_final.baseColor;
  diffuseColor.a = bml_final.alpha;
  roughnessFactor = clamp(bml_final.roughness, 0.035, 1.0);
  metalnessFactor = clamp(bml_final.metallic, 0.0, 1.0);
  totalEmissiveRadiance += bml_final.emission;
  // ---- 節點圖產生結束 ----
`;

  let vertexBody = "";
  if (displacementLink) {
    const { lines, nodeOutputVars } = compileChain(graph, displacementLink.fromNode, textureNodeIds, "vertex");
    const fromNode = graph.nodes.get(displacementLink.fromNode);
    const fromType = getNodeType(fromNode.typeId);
    const outDef = fromType.outputs.find((o) => o.key === displacementLink.fromSocket);
    const dispExpr = castExpr(
      nodeOutputVars.get(displacementLink.fromNode)[displacementLink.fromSocket],
      outDef.type,
      TYPES.VECTOR
    );
    vertexBody = `
  // ---- Blender Material Lab: Displacement（由節點圖產生，頂點著色器）----
  ${lines.join("\n  ")}
  transformed += ${dispExpr};
  // ---- Displacement 產生結束 ----
`;
  }

  return { body, vertexBody, textureNodeIds, needsBarycentric };
}

export function createPreviewMaterial() {
  const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0 });
  material.transparent = true;
  return material;
}

// 把編譯結果套用到既有的 MeshPhysicalMaterial 上。graph 用來查詢 Image Texture 節點目前的圖片資料。
export function applyFragmentChunk(material, graph, compileResult) {
  const { body: fragmentBody, vertexBody, textureNodeIds, needsBarycentric } = compileResult;
  material.defines = Object.assign({}, material.defines, { USE_UV: "" });
  // Three.js 的 WebGLPrograms 快取是用 customProgramCacheKey 判斷要不要重用舊的編譯結果，
  // 不會自動偵測 onBeforeCompile 產生的原始碼有沒有變——所以每次材質圖變動都要給不同的 key，
  // 否則畫面會一直沿用第一次編譯出來的舊 shader，看起來像「改了設定卻沒反應」。
  // 貼圖的色彩空間（sRGB/Non-Color）也要納入 key：這版 Three.js 把 texture 的 colorSpace
  // 綁進編譯出來的 program（texture 解碼邏輯），只改 texture.colorSpace＋needsUpdate 不會讓
  // 已編譯的 program 換掉，必須讓 cache key 跟著變才會真的重新編譯（實測不納入的話，
  // 切換 Color Space 下拉選單畫面完全沒反應）。
  const textureStateKey = () =>
    textureNodeIds.map((id) => `${id}:${graph.nodes.get(id)?.params.colorSpace || "srgb"}`).join(",");
  material.customProgramCacheKey = () => `${fragmentBody}|${vertexBody}|bary:${!!needsBarycentric}|tex:${textureStateKey()}`;
  material.onBeforeCompile = (shader) => {
    const uniformDecls = textureNodeIds.map((id) => `uniform sampler2D bml_tex_${id};`).join("\n");
    for (const id of textureNodeIds) {
      shader.uniforms[`bml_tex_${id}`] = { value: getTextureForNode(graph.nodes.get(id)) };
    }
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `${NOISE_GLSL}\n${HELPERS_SHARED_GLSL}\n${HELPERS_FRAGMENT_ONLY_GLSL}\n${uniformDecls}\n${needsBarycentric ? "varying vec3 vBmlBarycentric;" : ""}\nvoid main() {`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_physical_fragment>",
      `${fragmentBody}\n  #include <lights_physical_fragment>`
    );
    if (needsBarycentric) {
      // Wireframe 節點需要每個頂點的重心座標——這個自訂 attribute 是 preview3d.js 在建立
      // 幾何體時附加的（non-indexed 幾何、每個三角形的三個頂點分別是 (1,0,0)/(0,1,0)/(0,0,1)）。
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        "attribute vec3 barycentric;\nvarying vec3 vBmlBarycentric;\nvoid main() {"
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vBmlBarycentric = barycentric;"
      );
    }
    if (vertexBody) {
      // Displacement 只需要不依賴片元導數的共用輔助函式（HELPERS_SHARED_GLSL），
      // 加上圖裡用到的貼圖 uniform（例如 Image Texture 接進 Displacement 高度圖的情況）。
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `${NOISE_GLSL}\n${HELPERS_SHARED_GLSL}\n${uniformDecls}\nvoid main() {`
      );
      // beginnormal_vertex（宣告 objectNormal）在 begin_vertex（宣告 transformed）之前就跑過了，
      // 兩個變數在這個插入點都已經可以用；位移只在這裡加總一次，不影響後續的
      // morph/skinning（本沙盒的預覽物件沒有用到這兩者，但保留標準流程順序比較穩健）。
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${vertexBody}`
      );
    }
  };
  material.needsUpdate = true;
}
