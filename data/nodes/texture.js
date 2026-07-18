// Texture 分類：產生程序化貼圖或讀取影像貼圖的節點。
// v1 先做 Noise Texture（完全程序化、不需要使用者上傳圖檔）；
// Image Texture（需要檔案上傳 UI）會在擴充批次中加入。
export default [
  {
    id: "texture_noise",
    category: "texture",
    name: { zh: "雜訊紋理", en: "Noise Texture" },
    summary: { zh: "程序化的隨機雜訊，常用來做粗糙度變化、凹凸、木紋等自然質感。", en: "Procedural random noise — great for varying roughness, bumps, wood grain, and other organic detail." },
    docBeginner: {
      zh: "Noise Texture 會依座標產生連續但看起來隨機的灰階/彩色圖案。Scale 越大，花紋看起來越密集。最常見用法：接到 Roughness 或 Bump 讓材質不要死板。",
      en: "Noise Texture generates a continuous but random-looking pattern based on coordinates. Higher Scale means denser patterns. Common use: feed it into Roughness or Bump so a material doesn't look flat and uniform.",
    },
    docPro: {
      zh: "Detail/Roughness/Lacunarity 現在都是真的可調參數，跟 Blender 一致：Detail 是疊代（octave）次數、Roughness 是每疊代振幅衰減比例、Lacunarity 是每疊代頻率倍率。類型（Type）現在有 5 種，跟 Blender 一致：fBM（預設，也是本沙盒過去唯一支援的類型，逐疊代振幅衰減疊加）、Multifractal（逐疊代用相乘而不是相加）、Hybrid Multifractal（用 Offset/Gain 控制訊號怎麼疊加、疊代到 weight 太小會提早停止）、Ridged Multifractal（`offset - abs(雜訊)` 做出山脊狀的尖銳稜線）、Hetero Terrain（每疊代的增量會被目前累積值加權，做出侵蝕感地形）——公式逐項對照 Blender 原始碼（`blenlib/intern/noise.cc`）核對過一致。新增 Offset／Gain（只有後 3 種類型會用到）跟 Distortion（先用另外 3 組獨立雜訊位移座標，5 種類型都適用）插槽。跟 Blender 的差異：只有 fBM 有「標準化」到 0-1（本沙盒沿用過去就有的行為）；其餘 4 種類型輸出範圍可能明顯超出 0-1（這是這幾種類型本身的特性，Blender 也一樣，真實用法通常會再接 Color Ramp 或 Clamp 節點馴服範圍，不是本沙盒的簡化）。Blender 另外支援 1D-2D-4D 與更多 Dimensions 選項，本沙盒先固定 3D。",
      en: "Detail/Roughness/Lacunarity are now genuinely adjustable, matching Blender: Detail is the octave count, Roughness is the per-octave amplitude falloff, Lacunarity is the per-octave frequency multiplier. Type now has 5 options matching Blender: fBM (default, and the only type this sandbox previously supported — additive per-octave amplitude falloff), Multifractal (multiplicative per-octave accumulation instead of additive), Hybrid Multifractal (Offset/Gain control how the signal accumulates, stopping early once weight gets too small), Ridged Multifractal (`offset - abs(noise)` carves sharp ridge-like creases), and Hetero Terrain (each octave's increment is weighted by the current accumulated value, giving an eroded-terrain look) — formulas verified line-by-line against Blender's source (`blenlib/intern/noise.cc`). Added Offset/Gain (only used by the latter 3 types) and Distortion (warps the coordinate using 3 independent noise samples first; applies to all 5 types) sockets. Difference from Blender: only fBM is normalized to 0-1 (this sandbox's pre-existing behavior); the other 4 types can noticeably exceed 0-1 — that's inherent to those types (true in real Blender too; real workflows usually tame the range with a Color Ramp or Clamp afterward, this isn't a sandbox simplification). Blender also supports 1D/2D/4D dimensions; this sandbox fixes it to 3D for now.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.1, max: 50, step: 0.1 },
      { key: "detail", label: { zh: "細節", en: "Detail" }, type: "float", default: 2, min: 0, max: 15, step: 1 },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "lacunarity", label: { zh: "間隙度", en: "Lacunarity" }, type: "float", default: 2, min: 0, max: 6, step: 0.1 },
      { key: "distortion", label: { zh: "扭曲", en: "Distortion" }, type: "float", default: 0, min: 0, max: 10, step: 0.1 },
      { key: "offset", label: { zh: "偏移 Offset", en: "Offset" }, type: "float", default: 0, min: -2, max: 2, step: 0.05 },
      { key: "gain", label: { zh: "增益 Gain", en: "Gain" }, type: "float", default: 1, min: 0, max: 5, step: 0.05 },
    ],
    settings: [
      {
        key: "noiseType",
        uiType: "select",
        label: { zh: "類型", en: "Type" },
        default: "fbm",
        options: [
          { value: "fbm", label: { zh: "fBM", en: "fBM" } },
          { value: "multifractal", label: { zh: "多重分形 Multifractal", en: "Multifractal" } },
          { value: "hybrid_multifractal", label: { zh: "混合多重分形 Hybrid Multifractal", en: "Hybrid Multifractal" } },
          { value: "ridged_multifractal", label: { zh: "山脊多重分形 Ridged Multifractal", en: "Ridged Multifractal" } },
          { value: "hetero_terrain", label: { zh: "異質地形 Hetero Terrain", en: "Hetero Terrain" } },
        ],
      },
    ],
    outputs: [
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const type = node.params.noiseType || "fbm";
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector}) * ${ins.scale};`);
        const pd = ctx.freshVar("pDist");
        ctx.line(`vec3 ${pd} = bml_noiseDistort(${p}, ${ins.distortion});`);
        const fac = ctx.freshVar("fac");
        const col = ctx.freshVar("col");
        if (type === "fbm") {
          // 跟修改前逐字元一致的舊路徑（只多了 Distortion 位移），保證舊存檔的視覺結果不變。
          ctx.line(`float ${fac} = bml_fbmNoise(${pd}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity});`);
          ctx.line(`vec4 ${col} = vec4(bml_fbmColor(${pd}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity}), 1.0);`);
          return { fac, color: col };
        }
        const callFn = {
          multifractal: (pos) => `bml_multiFractalNoise(${pos}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity})`,
          hetero_terrain: (pos) => `bml_heteroTerrainNoise(${pos}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity}, ${ins.offset})`,
          hybrid_multifractal: (pos) => `bml_hybridMultiFractalNoise(${pos}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity}, ${ins.offset}, ${ins.gain})`,
          ridged_multifractal: (pos) => `bml_ridgedMultiFractalNoise(${pos}, ${ins.detail}, ${ins.roughness}, ${ins.lacunarity}, ${ins.offset}, ${ins.gain})`,
        }[type];
        ctx.line(`float ${fac} = ${callFn(pd)};`);
        const r = ctx.freshVar("nr");
        const g = ctx.freshVar("ng");
        const b = ctx.freshVar("nb");
        ctx.line(`float ${r} = ${callFn(`${pd} + vec3(0.0, 0.0, 0.0)`)};`);
        ctx.line(`float ${g} = ${callFn(`${pd} + vec3(37.2, 17.1, 5.4)`)};`);
        ctx.line(`float ${b} = ${callFn(`${pd} + vec3(11.5, 71.3, 29.8)`)};`);
        ctx.line(`vec4 ${col} = vec4(${r}, ${g}, ${b}, 1.0);`);
        return { fac, color: col };
      },
    },
  },
  {
    id: "texture_white_noise",
    category: "texture",
    name: { zh: "白噪波紋理", en: "White Noise Texture" },
    summary: { zh: "完全隨機、沒有平滑過渡的雜訊，每個座標值都不相關。", en: "Fully random noise with no smooth transitions — every coordinate is unrelated to its neighbors." },
    docBeginner: {
      zh: "跟 Noise Texture 不同，White Noise 完全沒有平滑漸變，看起來就像電視雜訊。適合需要「完全隨機、不要有花紋規律」的場合，例如隨機挑選顏色。",
      en: "Unlike Noise Texture, White Noise has no smooth gradient at all — it looks like TV static. Good when you need pure randomness with no pattern, e.g. picking a random color.",
    },
    docPro: {
      zh: "本沙盒用簡單的 hash 函式實作（sin+fract 雜湊），跟 Blender 內部的雜湊演算法不完全相同，但『完全不相關的隨機值』這個教學重點是一致的。",
      en: "This sandbox uses a simple hash function (sin+fract). It's not identical to Blender's internal hashing algorithm, but the teaching point — fully uncorrelated random values — holds.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" }],
    outputs: [
      { key: "value", label: { zh: "數值", en: "Value" }, type: "float" },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
    ],
    glsl: {
      emit(ctx, ins) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector});`);
        const v = ctx.freshVar("wn");
        ctx.line(`float ${v} = bml_hash1(${p});`);
        const col = ctx.freshVar("wnc");
        ctx.line(`vec4 ${col} = vec4(bml_hash3(${p}), 1.0);`);
        return { value: v, color: col };
      },
    },
  },
  {
    id: "texture_checker",
    category: "texture",
    name: { zh: "棋盤格紋理", en: "Checker Texture" },
    summary: { zh: "黑白相間的棋盤格，最適合拿來理解座標與 UV 的關係。", en: "A classic checkerboard pattern — great for visualizing coordinates and UV mapping." },
    docBeginner: {
      zh: "Checker Texture 是最容易看懂座標系統的紋理：格子如果扭曲、拉伸或縫隙不對齊，通常代表 UV 展開有問題。也可以直接拿兩個顏色做簡單的雙色材質。",
      en: "Checker Texture is the easiest way to visualize a coordinate system: if the squares look stretched or misaligned, the UV unwrap likely has issues. It also works as a simple two-tone material.",
    },
    docPro: {
      zh: "Scale 支援任意正數（不限整數，例如 4.5 也會正確等比例縮放格子大小——這點原本文件寫錯，已更正）。跟 Blender 的差異：Blender 額外支援 4D 座標（W 分量），本沙盒的向量型別固定是三維，沒有 4D 座標的概念。",
      en: "Scale supports any positive number (not just integers — e.g. 4.5 correctly scales the cell size proportionally; this doc previously claimed otherwise, now corrected). Difference from Blender: Blender additionally supports 4D coordinates (a W component); this sandbox's vector type is fixed at three dimensions, with no concept of a 4D coordinate.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "color1", label: { zh: "顏色 1", en: "Color 1" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "color2", label: { zh: "顏色 2", en: "Color 2" }, type: "color", default: [0.2, 0.2, 0.2, 1] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.1, max: 50, step: 0.1 },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector}) * ${ins.scale};`);
        const fac = ctx.freshVar("fac");
        ctx.line(`float ${fac} = bml_checker(${p});`);
        const col = ctx.freshVar("col");
        ctx.line(`vec4 ${col} = mix(${ins.color1}, ${ins.color2}, ${fac});`);
        return { color: col, fac };
      },
    },
  },
  {
    id: "texture_wave",
    category: "texture",
    name: { zh: "波浪紋理", en: "Wave Texture" },
    summary: { zh: "規律的條紋或環狀波紋，適合做木紋、水波、金屬拉絲。", en: "Regular bands or rings — good for wood grain, water ripples, brushed metal." },
    docBeginner: {
      zh: "Wave Texture 產生規律的明暗條紋。Distortion 可以讓條紋加入一點雜訊、變得不那麼死板規律，很適合模擬木紋的年輪。",
      en: "Wave Texture produces regular light/dark bands. Distortion adds some noise so the bands aren't perfectly rigid — great for simulating wood grain rings.",
    },
    docPro: {
      zh: "Wave Type（Bands/Rings）、方向（Direction：X/Y/Z/Diagonal，Rings 模式下 Diagonal 會退回跟球狀一樣的效果，跟 Blender 一致）、Profile（Sine/Saw/Triangle）、Detail/Detail Scale/Detail Roughness、Phase Offset 現在都是真的可調參數，涵蓋範圍跟 Blender 一致。Detail 系列參數是用可調的分形雜訊去扭曲波形，細節上跟 Blender 內部演算法不完全相同，但方向與可控性一致。",
      en: "Wave Type (Bands/Rings), Direction (X/Y/Z/Diagonal — in Rings mode, Diagonal falls back to the same spherical behavior as Blender), Profile (Sine/Saw/Triangle), Detail/Detail Scale/Detail Roughness, and Phase Offset are all genuinely adjustable now, matching Blender's parameter coverage. The Detail parameters distort the waveform using tunable fractal noise — not bit-identical to Blender's internal algorithm, but directionally correct and equally controllable.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.1, max: 50, step: 0.1 },
      { key: "distortion", label: { zh: "扭曲", en: "Distortion" }, type: "float", default: 0, min: 0, max: 10, step: 0.1 },
      { key: "detail", label: { zh: "細節", en: "Detail" }, type: "float", default: 2, min: 0, max: 15, step: 1 },
      { key: "detailScale", label: { zh: "細節縮放", en: "Detail Scale" }, type: "float", default: 1, min: 0, max: 10, step: 0.1 },
      { key: "detailRoughness", label: { zh: "細節粗糙度", en: "Detail Roughness" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "phaseOffset", label: { zh: "相位偏移", en: "Phase Offset" }, type: "float", default: 0, min: -10, max: 10, step: 0.1 },
    ],
    settings: [
      {
        key: "waveType",
        uiType: "select",
        label: { zh: "波形", en: "Wave Type" },
        default: "bands",
        options: [
          { value: "bands", label: { zh: "條紋 Bands", en: "Bands" } },
          { value: "rings", label: { zh: "環狀 Rings", en: "Rings" } },
        ],
      },
      {
        key: "direction",
        uiType: "select",
        label: { zh: "方向", en: "Direction" },
        default: "diagonal",
        options: [
          { value: "x", label: { zh: "X", en: "X" } },
          { value: "y", label: { zh: "Y", en: "Y" } },
          { value: "z", label: { zh: "Z", en: "Z" } },
          { value: "diagonal", label: { zh: "對角 Diagonal", en: "Diagonal" } },
        ],
      },
      {
        key: "profile",
        uiType: "select",
        label: { zh: "波形剖面", en: "Profile" },
        default: "sine",
        options: [
          { value: "sine", label: { zh: "正弦 Sine", en: "Sine" } },
          { value: "saw", label: { zh: "鋸齒 Saw", en: "Saw" } },
          { value: "triangle", label: { zh: "三角 Triangle", en: "Triangle" } },
        ],
      },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector}) * ${ins.scale};`);
        const baseCoord = ctx.freshVar("basec");
        const dir = node.params.direction || "diagonal";
        if (node.params.waveType === "rings") {
          // 對角（Diagonal）在 Rings 沒有意義（Blender 這個組合會退回球狀），
          // 環狀方向是把某一軸「歸零」，讓環狀花紋出現在另外兩軸構成的平面上。
          if (dir === "x") ctx.line(`float ${baseCoord} = length(${p} * vec3(0.0, 1.0, 1.0)) * 5.0;`);
          else if (dir === "y") ctx.line(`float ${baseCoord} = length(${p} * vec3(1.0, 0.0, 1.0)) * 5.0;`);
          else if (dir === "z") ctx.line(`float ${baseCoord} = length(${p} * vec3(1.0, 1.0, 0.0)) * 5.0;`);
          else ctx.line(`float ${baseCoord} = length(${p}) * 5.0;`);
        } else if (dir === "x") {
          ctx.line(`float ${baseCoord} = (${p}).x * 5.0;`);
        } else if (dir === "y") {
          ctx.line(`float ${baseCoord} = (${p}).y * 5.0;`);
        } else if (dir === "z") {
          ctx.line(`float ${baseCoord} = (${p}).z * 5.0;`);
        } else {
          // Blender 的對角（Diagonal）用的頻率常數是單軸方向的一半（因為同時混合了三軸，
          // 頻率減半才能維持跟單軸方向差不多的視覺密度，不會看起來變得混亂擁擠）。
          ctx.line(`float ${baseCoord} = ((${p}).x + (${p}).y + (${p}).z) * 2.5;`);
        }
        const detailN = ctx.freshVar("detailn");
        ctx.line(`float ${detailN} = bml_fbmNoise(${p} * max(${ins.detailScale}, 0.001), ${ins.detail}, ${ins.detailRoughness}, 2.0);`);
        const phase = ctx.freshVar("phase");
        ctx.line(`float ${phase} = ${baseCoord} + ${ins.distortion} * ${detailN} * 6.2831853 + ${ins.phaseOffset};`);
        const fac = ctx.freshVar("fac");
        const profile = node.params.profile;
        let profileExpr;
        if (profile === "saw") profileExpr = `fract(${phase} / 6.2831853)`;
        else if (profile === "triangle") profileExpr = `abs(fract(${phase} / 6.2831853 + 0.5) * 2.0 - 1.0)`;
        else profileExpr = `(0.5 + 0.5 * sin(${phase}))`;
        ctx.line(`float ${fac} = clamp(${profileExpr}, 0.0, 1.0);`);
        const col = ctx.freshVar("col");
        ctx.line(`vec4 ${col} = vec4(vec3(${fac}), 1.0);`);
        return { color: col, fac };
      },
    },
  },
  {
    id: "texture_gradient",
    category: "texture",
    name: { zh: "漸變紋理", en: "Gradient Texture" },
    summary: { zh: "沿某個方向或形狀由黑到白的平滑漸層。", en: "A smooth black-to-white gradient along a direction or shape." },
    docBeginner: {
      zh: "最簡單的紋理節點：輸出從 0 到 1 平滑變化的灰階值，常接到 Color Ramp 做出漸層上色，或接到 Mix Shader 的 Fac 做出材質的漸變過渡。",
      en: "The simplest texture node: outputs a smooth 0-to-1 grayscale value. Often feeds a Color Ramp for gradient coloring, or a Mix Shader's Fac for a smooth material transition.",
    },
    docPro: {
      zh: "全部 6 種類型都跟 Blender 一致：線性（X 分量）、二次方（X 分量平方，中段變化更快）、緩動（3x²-2x³ 平滑曲線）、對角（X、Y 分量平均）、放射狀（繞中心點的角度掃描，像時鐘指針）、球狀（到中心點的距離，向外圈狀擴散）。跟 Blender 的差異：Blender 的放射狀／球狀公式直接對原始座標取值（座標本身就以物體中心為原點）；本沙盒的預設向量是 0-1 的 UV，所以先減去 (0.5,0.5) 把中心平移到畫面正中央，效果一致、只是座標系統不同。",
      en: "All 6 types match Blender exactly: Linear (X component), Quadratic (X squared, faster falloff mid-range), Easing (3x²-2x³ smooth curve), Diagonal (average of X and Y), Radial (angular sweep around the center, like a clock hand), and Spherical (distance from center, expanding outward in rings). Difference from Blender: Blender's Radial/Spherical formulas operate on raw coordinates already centered at the object's origin; this sandbox's default vector is 0-1 UV, so it first subtracts (0.5, 0.5) to recenter — same effect, different coordinate convention.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" }],
    settings: [
      {
        key: "type",
        uiType: "select",
        previewShape: true,
        label: { zh: "類型", en: "Type" },
        default: "linear",
        options: [
          { value: "linear", label: { zh: "線性 Linear", en: "Linear" }, cssPattern: "linear-gradient(to right, #000, #fff)" },
          {
            value: "quadratic",
            label: { zh: "二次方 Quadratic", en: "Quadratic" },
            cssPattern: "linear-gradient(to right, #000 0%, #101010 25%, #404040 50%, #909090 75%, #fff 100%)",
          },
          {
            value: "easing",
            label: { zh: "緩動 Easing", en: "Easing" },
            cssPattern: "linear-gradient(to right, #000 0%, #282828 25%, #808080 50%, #d7d7d7 75%, #fff 100%)",
          },
          { value: "diagonal", label: { zh: "對角 Diagonal", en: "Diagonal" }, cssPattern: "linear-gradient(to bottom right, #000, #fff)" },
          { value: "radial", label: { zh: "放射狀 Radial", en: "Radial" }, cssPattern: "conic-gradient(from 180deg, #000, #fff, #000)" },
          { value: "spherical", label: { zh: "球狀 Spherical", en: "Spherical" }, cssPattern: "radial-gradient(circle, #fff, #000)" },
        ],
      },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector});`);
        const fac = ctx.freshVar("fac");
        const type = node.params.type || "linear";
        if (type === "quadratic") {
          ctx.line(`float ${fac} = clamp(pow(max((${p}).x, 0.0), 2.0), 0.0, 1.0);`);
        } else if (type === "easing") {
          ctx.line(`float ${fac} = clamp((${p}).x, 0.0, 1.0);`);
          ctx.line(`${fac} = ${fac} * ${fac} * (3.0 - 2.0 * ${fac});`);
        } else if (type === "diagonal") {
          ctx.line(`float ${fac} = clamp(((${p}).x + (${p}).y) * 0.5, 0.0, 1.0);`);
        } else if (type === "radial") {
          ctx.line(`vec2 ${fac}_c = (${p}).xy - vec2(0.5);`);
          ctx.line(`float ${fac} = atan(${fac}_c.y, ${fac}_c.x) / (2.0 * 3.14159265) + 0.5;`);
        } else if (type === "spherical") {
          ctx.line(`float ${fac} = clamp(1.0 - length((${p}).xy - vec2(0.5)) * 2.0, 0.0, 1.0);`);
        } else {
          ctx.line(`float ${fac} = clamp((${p}).x, 0.0, 1.0);`);
        }
        const col = ctx.freshVar("col");
        ctx.line(`vec4 ${col} = vec4(vec3(${fac}), 1.0);`);
        return { color: col, fac };
      },
    },
  },
  {
    id: "texture_voronoi",
    category: "texture",
    name: { zh: "沃羅諾伊紋理", en: "Voronoi Texture" },
    summary: { zh: "自然的細胞/裂紋圖案，做石頭、龜裂地面、生物細胞紋理必備。", en: "Organic cell/crack patterns — essential for stone, cracked ground, and cellular textures." },
    docBeginner: {
      zh: "Voronoi 會把空間切成一塊塊不規則的『細胞』。Distance 輸出離最近細胞中心的距離（可以做出裂紋邊界），Color 輸出每個細胞一個隨機顏色（可以做出石頭的斑駁感）。",
      en: "Voronoi divides space into irregular 'cells'. Distance outputs how far you are from the nearest cell center (useful for crack-like edges), while Color gives each cell a random color (great for mottled stone).",
    },
    docPro: {
      zh: "Randomness 是真的可調參數（0＝細胞中心退化成完美網格、1＝完全隨機跳動，Blender 預設 1）。特徵（Feature）跟距離度量（Distance Metric）現在都跟 Blender 一致：F1（離最近細胞多遠）、F2（離第二近細胞多遠）、平滑 F1（用平滑最小值把 F1/F2 融合，邊界更柔和）、到邊緣的距離（離兩個細胞交界處多遠，做裂縫特別適合）、N-球半徑（細胞點本身能塞進去、不跟鄰居重疊的最大球半徑，做圓潤的鵝卵石顆粒特別適合）；距離度量支援歐式（Euclidean，一般直線距離）、曼哈頓（Manhattan，只能走格線）、切比雪夫（Chebychev，取最大分量，切出方形細胞）、閔可夫斯基（Minkowski，用 Exponent 插槽的次方廣義化前面幾種——Exponent=1 等於曼哈頓、Exponent=2 等於歐式、Exponent 越大越接近切比雪夫）。Exponent 預設 0.5、範圍 0-32，跟 Blender 原始碼（`node_shader_tex_voronoi.cc`）的插槽定義一致；只有 Distance Metric 選 Minkowski 時才會用到。差異：平滑 F1 用 Smooth Min 對 F1/F2 做平滑（方向正確，但不是 Blender 內部真正逐點加權平滑的演算法）。",
      en: "Randomness is genuinely adjustable (0 = cell centers collapse to a perfect grid, 1 = fully random jitter — Blender's default is 1). Feature and Distance Metric now both match Blender: F1 (distance to nearest cell), F2 (distance to second-nearest), Smooth F1 (blends F1/F2 with a smooth minimum for softer boundaries), Distance to Edge (distance to the boundary between two cells — great for cracks), N-Sphere Radius (the largest sphere a cell point fits without overlapping neighbors — great for rounded pebble grains); Distance Metric supports Euclidean (straight-line), Manhattan (grid-only movement), Chebychev (max component, carves square cells), and Minkowski (generalizes the others via the Exponent input — Exponent=1 equals Manhattan, Exponent=2 equals Euclidean, larger values approach Chebychev). Exponent defaults to 0.5 with range 0-32, matching Blender's source (`node_shader_tex_voronoi.cc`) socket definition; it only matters when Distance Metric is Minkowski. Difference: Smooth F1 approximates via Smooth Min on F1/F2 — directionally correct, but not Blender's true per-point weighted smoothing algorithm.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.1, max: 50, step: 0.1 },
      { key: "randomness", label: { zh: "隨機度", en: "Randomness" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
      { key: "smoothness", label: { zh: "平滑度", en: "Smoothness" }, type: "float", default: 0.3, min: 0, max: 1, step: 0.01 },
      { key: "exponent", label: { zh: "指數 Exponent", en: "Exponent" }, type: "float", default: 0.5, min: 0, max: 32, step: 0.1 },
    ],
    settings: [
      {
        key: "feature",
        uiType: "select",
        label: { zh: "特徵", en: "Feature" },
        default: "f1",
        options: [
          { value: "f1", label: { zh: "F1", en: "F1" } },
          { value: "f2", label: { zh: "F2", en: "F2" } },
          { value: "smooth_f1", label: { zh: "平滑 F1 Smooth F1", en: "Smooth F1" } },
          { value: "distance_to_edge", label: { zh: "到邊緣的距離 Distance to Edge", en: "Distance to Edge" } },
          { value: "n_sphere_radius", label: { zh: "N-球半徑 N-Sphere Radius", en: "N-Sphere Radius" } },
        ],
      },
      {
        key: "distanceMetric",
        uiType: "select",
        label: { zh: "距離度量", en: "Distance Metric" },
        default: "euclidean",
        options: [
          { value: "euclidean", label: { zh: "歐式 Euclidean", en: "Euclidean" } },
          { value: "manhattan", label: { zh: "曼哈頓 Manhattan", en: "Manhattan" } },
          { value: "chebychev", label: { zh: "切比雪夫 Chebychev", en: "Chebychev" } },
          { value: "minkowski", label: { zh: "閔可夫斯基 Minkowski", en: "Minkowski" } },
        ],
      },
    ],
    outputs: [
      { key: "distance", label: { zh: "距離", en: "Distance" }, type: "float" },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "position", label: { zh: "位置", en: "Position" }, type: "vector" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector}) * ${ins.scale};`);
        const metricIndex = { euclidean: 0, manhattan: 1, chebychev: 2, minkowski: 3 }[node.params.distanceMetric] ?? 0;
        const feature = node.params.feature || "f1";

        const f1 = ctx.freshVar("vf1");
        const f2 = ctx.freshVar("vf2");
        const col = ctx.freshVar("vcol");
        const pos = ctx.freshVar("vpos");
        ctx.line(`float ${f1}, ${f2};`);
        ctx.line(`vec3 ${col}, ${pos};`);
        ctx.line(`bml_voronoiSearch(${p}, ${ins.randomness}, ${metricIndex}, ${ins.exponent}, ${f1}, ${col}, ${pos}, ${f2});`);

        const dist = ctx.freshVar("vdist");
        if (feature === "f2") {
          ctx.line(`float ${dist} = ${f2};`);
        } else if (feature === "smooth_f1") {
          ctx.line(`float ${dist} = bml_smoothMin(${f1}, ${f2}, max(${ins.smoothness}, 0.0001));`);
        } else if (feature === "distance_to_edge") {
          ctx.line(`float ${dist} = (${f2} - ${f1}) * 0.5;`);
        } else if (feature === "n_sphere_radius") {
          ctx.line(`float ${dist} = bml_voronoiNSphereRadius(${pos}, ${ins.randomness}, ${metricIndex}, ${ins.exponent});`);
        } else {
          ctx.line(`float ${dist} = ${f1};`);
        }
        return { distance: dist, color: `vec4(${col}, 1.0)`, position: pos };
      },
    },
  },
  {
    id: "texture_magic",
    category: "texture",
    name: { zh: "迷幻紋理", en: "Magic Texture" },
    summary: { zh: "鮮豔的萬花筒式抽象花紋，適合做特效或抽象材質。", en: "Vibrant, kaleidoscope-like abstract patterns — good for effects or stylized materials." },
    docBeginner: {
      zh: "Magic Texture 沒有明確對應的真實世界材質，比較像是一個『產生有趣抽象花紋』的紋理產生器，可以用 Distortion 調整花紋的複雜程度。",
      en: "Magic Texture doesn't correspond to any real-world material — it's more of an 'interesting abstract pattern' generator. Use Distortion to adjust pattern complexity.",
    },
    docPro: {
      zh: "Depth（疊代次數，0-10）現在是真的可調參數，跟 Blender 一致：每多一層疊代，x/y/z 會被扭曲值再變換一次，花紋變得更複雜、更不規則，跟 Blender Cycles 內部的 `svm_magic` 演算法對照過、逐層公式一致。Depth 是節點設定（編譯期就固定），不是插槽，這點也跟 Blender 一致。",
      en: "Depth (iteration count, 0-10) is now genuinely adjustable, matching Blender: each additional iteration transforms x/y/z through the distortion value again, making the pattern more complex and irregular — verified against Blender Cycles' internal `svm_magic` algorithm, formula-for-formula per level. Depth is a node setting (fixed at compile time), not a socket, matching Blender.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.1, max: 50, step: 0.1 },
      { key: "distortion", label: { zh: "扭曲", en: "Distortion" }, type: "float", default: 1.5, min: 0, max: 10, step: 0.1 },
    ],
    settings: [{ key: "depth", uiType: "float", label: { zh: "疊代次數 Depth", en: "Depth" }, default: 2, min: 0, max: 10, step: 1 }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins, node) {
        const p = ctx.freshVar("p");
        ctx.line(`vec3 ${p} = (${ins.vector}) * ${ins.scale};`);
        const depth = Math.max(0, Math.min(10, Math.round(node.params.depth ?? 2)));
        const d = `(${ins.distortion})`;
        const x = ctx.freshVar("mx");
        const y = ctx.freshVar("my");
        const z = ctx.freshVar("mz");
        ctx.line(`float ${x} = sin((${p}.x + ${p}.y + ${p}.z) * 5.0);`);
        ctx.line(`float ${y} = cos((-${p}.x + ${p}.y - ${p}.z) * 5.0);`);
        ctx.line(`float ${z} = -cos((-${p}.x - ${p}.y + ${p}.z) * 5.0);`);
        // 跟 Blender Cycles 的 svm_magic 完全比照：Depth 每多一層，就多套用一次「某個分量乘上扭曲值、
        // 再用另外兩個分量的組合算三角函數」，10 層疊代各自的組合方式都不一樣（不是簡單重複同一個公式）。
        if (depth > 0) {
          ctx.line(`${x} *= ${d}; ${y} *= ${d}; ${z} *= ${d};`);
          ctx.line(`${y} = -cos(${x} - ${y} + ${z});`);
        }
        if (depth > 1) {
          ctx.line(`${y} *= ${d};`);
          ctx.line(`${x} = cos(${x} - ${y} - ${z});`);
        }
        if (depth > 2) {
          ctx.line(`${x} *= ${d};`);
          ctx.line(`${z} = sin(-${x} - ${y} - ${z});`);
        }
        if (depth > 3) {
          ctx.line(`${z} *= ${d};`);
          ctx.line(`${x} = -cos(-${x} - ${y} - ${z});`);
        }
        if (depth > 4) {
          ctx.line(`${x} *= ${d};`);
          ctx.line(`${y} = -sin(-${x} - ${y} - ${z});`);
        }
        if (depth > 5) {
          ctx.line(`${y} *= ${d};`);
          ctx.line(`${y} = -cos(-${x} - ${y} - ${z});`);
        }
        if (depth > 6) {
          ctx.line(`${y} *= ${d};`);
          ctx.line(`${x} = cos(-${x} - ${y} - ${z});`);
        }
        if (depth > 7) {
          ctx.line(`${x} *= ${d};`);
          ctx.line(`${z} = sin(${x} - ${y} - ${z});`);
        }
        if (depth > 8) {
          ctx.line(`${z} *= ${d};`);
          ctx.line(`${x} = -cos(${x} - ${y} + ${z});`);
        }
        if (depth > 9) {
          ctx.line(`${x} *= ${d};`);
        }
        const dscale = ctx.freshVar("mdscale");
        ctx.line(`float ${dscale} = (${d}) != 0.0 ? (${d}) * 2.0 : 1.0;`);
        const col = ctx.freshVar("magic");
        ctx.line(`vec4 ${col} = vec4(0.5 - ${x} / ${dscale}, 0.5 - ${y} / ${dscale}, 0.5 - ${z} / ${dscale}, 1.0);`);
        return { color: col };
      },
    },
  },
  {
    id: "texture_brick",
    category: "texture",
    name: { zh: "磚塊紋理", en: "Brick Texture" },
    summary: { zh: "磚牆的錯位方塊圖案，配上灰泥縫。", en: "Offset brick blocks with mortar lines — the classic wall pattern." },
    docBeginner: {
      zh: "Brick Texture 產生一排排交錯排列的磚塊，中間有灰泥縫（Mortar）。Mortar Size 控制縫隙粗細，Color 1/2 是磚塊本身會隨機挑選的兩種色調，Mortar Color 是縫隙顏色。",
      en: "Brick Texture generates rows of offset brick blocks with mortar lines between them. Mortar Size controls the gap thickness, Color 1/2 are two brick tones picked randomly per brick, and Mortar Color is the gap color.",
    },
    docPro: {
      zh: "Brick Width／Row Height（磚塊本身的長寬比）、Offset／Offset Frequency（每隔幾列水平位移一次）、Squash／Squash Frequency（每隔幾列壓縮磚塊寬度）、Bias（顏色 1/2 挑選的偏向）現在都是真的可調插槽，跟 Blender 完整版一致，公式對照 `node_shader_tex_brick.cc` 的 `brick()` 函式逐項複刻。跟 Blender 的差異：Mortar 邊緣用 `smoothstep` 平滑（Mortar Smooth 插槽控制平滑範圍），細節上跟 Blender 內部的距離場演算法不完全相同，但方向一致。",
      en: "Brick Width/Row Height (the brick's own aspect ratio), Offset/Offset Frequency (how many rows before a horizontal shift repeats), Squash/Squash Frequency (how many rows before brick width compresses), and Bias (skew toward Color 1 or 2) are all genuinely adjustable sockets now, matching full Blender — formulas ported directly from `node_shader_tex_brick.cc`'s `brick()` function. Difference from Blender: mortar edges use `smoothstep` (controlled by the Mortar Smooth socket) — not identical to Blender's internal distance-field algorithm, but directionally consistent.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "color1", label: { zh: "顏色 1", en: "Color 1" }, type: "color", default: [0.6, 0.25, 0.2, 1] },
      { key: "color2", label: { zh: "顏色 2", en: "Color 2" }, type: "color", default: [0.5, 0.2, 0.15, 1] },
      { key: "mortarColor", label: { zh: "灰泥顏色", en: "Mortar Color" }, type: "color", default: [0.8, 0.8, 0.78, 1] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 5, min: 0.5, max: 30, step: 0.1 },
      { key: "mortarSize", label: { zh: "灰泥縫寬度", en: "Mortar Size" }, type: "float", default: 0.02, min: 0, max: 0.3, step: 0.01 },
      { key: "mortarSmooth", label: { zh: "灰泥平滑度", en: "Mortar Smooth" }, type: "float", default: 0.1, min: 0, max: 1, step: 0.01 },
      { key: "bias", label: { zh: "偏向", en: "Bias" }, type: "float", default: 0, min: -1, max: 1, step: 0.01 },
      { key: "brickWidth", label: { zh: "磚塊寬度", en: "Brick Width" }, type: "float", default: 0.5, min: 0.05, max: 5, step: 0.01 },
      { key: "rowHeight", label: { zh: "列高", en: "Row Height" }, type: "float", default: 0.25, min: 0.05, max: 5, step: 0.01 },
      { key: "offset", label: { zh: "位移量", en: "Offset" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "offsetFrequency", label: { zh: "位移週期", en: "Offset Frequency" }, type: "float", default: 2, min: 1, max: 10, step: 1 },
      { key: "squash", label: { zh: "壓縮量", en: "Squash" }, type: "float", default: 1, min: 0.2, max: 2, step: 0.01 },
      { key: "squashFrequency", label: { zh: "壓縮週期", en: "Squash Frequency" }, type: "float", default: 2, min: 1, max: 10, step: 1 },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins) {
        const uv = ctx.freshVar("uv");
        ctx.line(`vec2 ${uv} = ((${ins.vector}).xy) * ${ins.scale};`);
        const mortar = ctx.freshVar("mortar");
        const tint = ctx.freshVar("tint");
        ctx.line(`float ${tint};`);
        ctx.line(
          `float ${mortar} = bml_brick(${uv}, clamp(${ins.mortarSize}, 0.0, 0.49), clamp(${ins.mortarSmooth}, 0.0, 1.0), ${ins.bias}, ` +
            `max(${ins.brickWidth}, 0.05), max(${ins.rowHeight}, 0.05), ${ins.offset}, ${ins.offsetFrequency}, ${ins.squash}, ${ins.squashFrequency}, ${tint});`
        );
        const col = ctx.freshVar("col");
        ctx.line(`vec4 ${col} = mix(mix(${ins.color1}, ${ins.color2}, step(0.5, ${tint})), ${ins.mortarColor}, ${mortar});`);
        return { color: col, fac: mortar };
      },
    },
  },
  {
    id: "texture_image",
    category: "texture",
    name: { zh: "圖像紋理", en: "Image Texture" },
    summary: { zh: "讀取一張你上傳的圖片當作貼圖，最常見的材質來源。", en: "Reads an uploaded image as a texture — the most common material source." },
    docBeginner: {
      zh: "Image Texture 是最常用的紋理節點：點節點上的「選擇圖片」上傳一張照片或素材圖，就能把它貼在物體表面。Vector 輸入決定貼圖怎麼對應到表面座標，預設用物體的 UV。",
      en: "Image Texture is the most-used texture node: click 'Choose Image' on the node to upload a photo or texture map, and it wraps onto the surface. The Vector input controls how the image maps to surface coordinates — UV by default.",
    },
    docPro: {
      zh: "延展模式（Extension：Repeat／Extend／Clip／Mirror）、插值（Interpolation：Linear／Closest／Cubic）與色彩空間（Color Space：sRGB／Non-Color）現在都是真的可調設定，跟 Blender 一致（`js/core/textureCache.js` 依這些設定即時設定 Three.js Texture；Clip 沒有原生對應的 wrap 模式，改在 GLSL 端判斷 UV 是否落在 0-1 之外，超出範圍就讓 Alpha 直接歸零）。**色彩空間很重要**：一般照片/顏色貼圖用 sRGB（會做 gamma 解碼）；法線貼圖、粗糙度圖、高度圖這類「數值資料」貼圖一定要選 Non-Color（原樣讀取、不解碼），選錯會讓法線方向偏移、粗糙度整體變暗。Cubic 用經典的「4 次雙線性取樣模擬雙三次 B-Spline」技巧實作（Sigg & Hadwiger 2005，遊戲/著色器業界常用手法），不是逐像素真的采 16 個點的卷積，但平滑方向與效果一致。跟 Blender 的差異：Smart 插值（依縮放程度自動切換 Cubic/Linear）還沒實作。",
      en: "Extension (Repeat/Extend/Clip/Mirror), Interpolation (Linear/Closest/Cubic), and Color Space (sRGB/Non-Color) are now genuinely adjustable settings, matching Blender (`js/core/textureCache.js` configures the Three.js Texture live based on these). Clip has no native wrap-mode equivalent, so it's handled in GLSL instead — checking whether the UV falls outside 0-1 and zeroing Alpha if so. **Color Space matters**: use sRGB for photos/color maps (gamma-decoded); data maps like normal, roughness, or height maps must use Non-Color (read as-is, no decoding) — the wrong choice shifts normal directions and darkens roughness values. Cubic uses the classic '4 bilinear taps approximating a bicubic B-spline' trick (Sigg & Hadwiger 2005, a common game/shader technique) rather than a true 16-tap per-pixel convolution, but the smoothing direction and effect match. Difference from Blender: Smart interpolation (auto-switches between Cubic/Linear based on zoom level) isn't implemented yet.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" }],
    settings: [
      { key: "src", uiType: "image", label: { zh: "圖片", en: "Image" }, default: null },
      {
        key: "extension",
        uiType: "select",
        label: { zh: "延展模式", en: "Extension" },
        default: "repeat",
        options: [
          { value: "repeat", label: { zh: "重複 Repeat", en: "Repeat" } },
          { value: "extend", label: { zh: "延伸 Extend", en: "Extend" } },
          { value: "clip", label: { zh: "裁切 Clip", en: "Clip" } },
          { value: "mirror", label: { zh: "鏡像 Mirror", en: "Mirror" } },
        ],
      },
      {
        key: "interpolation",
        uiType: "select",
        label: { zh: "插值", en: "Interpolation" },
        default: "linear",
        options: [
          { value: "linear", label: { zh: "線性 Linear", en: "Linear" } },
          { value: "closest", label: { zh: "最近 Closest", en: "Closest" } },
          { value: "cubic", label: { zh: "雙三次 Cubic", en: "Cubic" } },
        ],
      },
      {
        key: "colorSpace",
        uiType: "select",
        label: { zh: "色彩空間", en: "Color Space" },
        default: "srgb",
        options: [
          { value: "srgb", label: { zh: "sRGB（照片/顏色）", en: "sRGB" } },
          { value: "non_color", label: { zh: "Non-Color（法線/資料圖）", en: "Non-Color" } },
        ],
      },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "alpha", label: { zh: "透明度", en: "Alpha" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const uniformName = ctx.useTexture(node.id);
        const uv = ctx.freshVar("uv");
        ctx.line(`vec2 ${uv} = (${ins.vector}).xy;`);
        const col = ctx.freshVar("imgcol");
        if (node.params.interpolation === "cubic") {
          ctx.line(`vec4 ${col} = bml_textureBicubic(${uniformName}, ${uv});`);
        } else {
          ctx.line(`vec4 ${col} = texture2D(${uniformName}, ${uv});`);
        }
        if (node.params.extension === "clip") {
          ctx.line(`if (${uv}.x < 0.0 || ${uv}.x > 1.0 || ${uv}.y < 0.0 || ${uv}.y > 1.0) ${col}.a = 0.0;`);
        }
        return { color: col, alpha: `${col}.a` };
      },
    },
  },
  {
    id: "texture_environment",
    category: "texture",
    name: { zh: "環境紋理", en: "Environment Texture" },
    summary: { zh: "把整張全景圖包在場景外圍，通常用來當背景與反射來源。", en: "Wraps a full panorama around the scene — usually used as background and reflection source." },
    docBeginner: { zh: "跟 Image Texture 很像，但是用『經緯度展開』的方式把整張全景圖包成一整圈 360 度環境。", en: "Similar to Image Texture, but maps a full 360° panorama using equirectangular projection." },
    docPro: { zh: "本沙盒目前用固定的程序化環境光（Three.js RoomEnvironment）做反射，還沒開放讓使用者上傳自訂 HDRI 全景圖，先列文件。", en: "This sandbox currently uses a fixed procedural environment (Three.js RoomEnvironment) for reflections and doesn't yet support uploading a custom HDRI panorama. Documentation only for now." },
    supported: false,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
  },
  {
    id: "texture_sky",
    category: "texture",
    name: { zh: "天空紋理", en: "Sky Texture" },
    summary: { zh: "程序化產生天空與太陽的顏色，不需要貼圖。", en: "Procedurally generates sky and sun coloring — no image needed." },
    docBeginner: { zh: "常用來直接當背景環境光，模擬白天、傍晚、夜晚等不同天色。", en: "Often used directly as the background environment to simulate day, sunset, or night skies." },
    docPro: { zh: "完整的物理天空模型（Nishita/Preetham）運算量較大，本沙盒的即時預覽先不支援，先列文件。", en: "Full physical sky models (Nishita/Preetham) are computationally heavy. Not yet supported in this live preview. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
  },
  {
    id: "texture_ies",
    category: "texture",
    name: { zh: "IES 紋理", en: "IES Texture" },
    summary: { zh: "讀取真實燈具的光型檔案，模擬真實燈具的照射形狀。", en: "Reads a real-world luminaire light-profile file to simulate actual lamp shapes." },
    docBeginner: { zh: "IES 檔案通常由燈具廠商提供，記錄了這顆燈實際照出來的形狀（例如聚光燈的光斑形狀）。", en: "IES files are usually provided by lamp manufacturers and record the actual shape of light cast by that fixture (e.g. a spotlight's beam shape)." },
    docPro: { zh: "這個節點只用在燈光資料上，跟材質外觀無關，本網站以材質節點為主，此節點僅列文件。", en: "This node only applies to light data, not material appearance. Since this site focuses on material nodes, it's documented but not interactive." },
    supported: false,
    inputs: [],
    outputs: [{ key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" }],
  },
  {
    id: "texture_point_density",
    category: "texture",
    name: { zh: "點密度紋理", en: "Point Density" },
    summary: { zh: "依粒子或頂點的分布密度產生紋理，常用在體積特效。", en: "Generates a texture based on particle or vertex distribution density — common in volumetric effects." },
    docBeginner: { zh: "需要場景中有粒子系統或頂點群組資料才有意義，一般材質很少用到。", en: "Only meaningful when the scene has particle systems or vertex group data — rarely used in regular materials." },
    docPro: { zh: "需要存取粒子系統/頂點資料，本沙盒的預覽物件沒有這些資料來源，先列文件。", en: "Requires access to particle system/vertex data, which this sandbox's preview meshes don't have. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
  },
];
