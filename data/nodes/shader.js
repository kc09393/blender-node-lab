// Shader 分類：產生 BSDF（材質行為）的節點。
// 即時預覽用一個簡化的 BmlBsdf struct（baseColor/roughness/metallic/emission/alpha）
// 近似 Blender 的物理式渲染，細節上跟 Cycles/Eevee 的實際運算不完全相同，
// 重點是讓使用者理解「這個節點在材質圖裡的角色與連接方式」。真正逐光程計算超出瀏覽器即時預覽範圍。
export default [
  {
    id: "shader_principled_bsdf",
    category: "shader",
    name: { zh: "原則化 BSDF", en: "Principled BSDF" },
    summary: { zh: "以 Blender 5.2 LTS OpenPBR 架構為準的萬用材質節點。", en: "The Blender 5.2 LTS OpenPBR-based all-in-one surface shader." },
    docBeginner: {
      zh: "這是 Blender 5.2 LTS 新建材質時的主要表面節點。先從底色、金屬度與粗糙度開始；需要玻璃、車漆、布料或薄膜彩虹時，再使用透射、塗層、絨光與薄膜區塊。Thin Wall 適合紙張、葉片與窗片這類可視為零厚度的薄面。",
      en: "This is Blender 5.2 LTS's primary surface shader. Start with Base Color, Metallic, and Roughness; use Transmission, Coat, Sheen, or Thin Film for glass, paint, fabric, and interference colors. Thin Wall is for paper, leaves, and window sheets that can be treated as zero-thickness surfaces.",
    },
    docPro: {
      zh: "輸入分組與名稱依 Blender 5.2 LTS／OpenPBR。Thin Wall 為 5.2 新增的布林輸入；Blender 將表面當作層狀鏡對、零厚度的薄片，此時次表面半徑與縮放不起作用。本預覽會切到零厚度透射並關閉次表面近似，但仍不是 Cycles 的完整光線追蹤。",
      en: "Inputs follow Blender 5.2 LTS/OpenPBR. Thin Wall is a new 5.2 Boolean input: Blender treats the surface as a mirrored-layer, zero-thickness slab, and subsurface Radius/Scale no longer apply. This preview switches transmission to zero thickness and disables its subsurface approximation, but it is still not full Cycles path tracing.",
    },
    supported: true,
    inputs: [
      { key: "baseColor", label: { zh: "底色", en: "Base Color" }, section: { zh: "基礎", en: "Base" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "metallic", label: { zh: "金屬度", en: "Metallic" }, section: { zh: "基礎", en: "Base" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, section: { zh: "基礎", en: "Base" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "ior", label: { zh: "折射率", en: "IOR" }, section: { zh: "基礎", en: "Base" }, type: "float", default: 1.5, min: 1, max: 4, step: 0.01 },
      { key: "alpha", label: { zh: "Alpha", en: "Alpha" }, section: { zh: "基礎", en: "Base" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
      { key: "thinWall", label: { zh: "Thin Wall（薄壁）", en: "Thin Wall" }, section: { zh: "基礎", en: "Base" }, type: "bool", default: false },
      { key: "normal", label: { zh: "法線", en: "Normal" }, section: { zh: "基礎", en: "Base" }, type: "vector", default: "NORMAL" },
      { key: "diffuseRoughness", label: { zh: "粗糙度", en: "Roughness" }, section: { zh: "漫射", en: "Diffuse" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "subsurfaceWeight", label: { zh: "權重", en: "Weight" }, section: { zh: "次表面", en: "Subsurface" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "subsurfaceRadius", label: { zh: "半徑", en: "Radius" }, section: { zh: "次表面", en: "Subsurface" }, type: "vector", default: [1, 0.2, 0.1], min: 0, max: 10, step: 0.01 },
      { key: "subsurfaceScale", label: { zh: "縮放", en: "Scale" }, section: { zh: "次表面", en: "Subsurface" }, type: "float", default: 0.005, min: 0, max: 10, step: 0.001 },
      { key: "subsurfaceAnisotropy", label: { zh: "非等向性", en: "Anisotropy" }, section: { zh: "次表面", en: "Subsurface" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "specularIorLevel", label: { zh: "IOR 等級", en: "IOR Level" }, section: { zh: "鏡面反射", en: "Specular" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "specularTint", label: { zh: "染色", en: "Tint" }, section: { zh: "鏡面反射", en: "Specular" }, type: "color", default: [1, 1, 1, 1] },
      { key: "anisotropy", label: { zh: "非等向性", en: "Anisotropic" }, section: { zh: "鏡面反射", en: "Specular" }, type: "float", default: 0, min: -1, max: 1, step: 0.01 },
      { key: "anisotropyRotation", label: { zh: "非等向旋轉", en: "Anisotropic Rotation" }, section: { zh: "鏡面反射", en: "Specular" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "tangent", label: { zh: "切線", en: "Tangent" }, section: { zh: "鏡面反射", en: "Specular" }, type: "vector", default: [0, 0, 0], min: -1, max: 1, step: 0.01 },
      { key: "transmissionWeight", label: { zh: "權重", en: "Weight" }, section: { zh: "透射", en: "Transmission" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "coatWeight", label: { zh: "權重", en: "Weight" }, section: { zh: "塗層", en: "Coat" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "coatRoughness", label: { zh: "粗糙度", en: "Roughness" }, section: { zh: "塗層", en: "Coat" }, type: "float", default: 0.03, min: 0, max: 1, step: 0.01 },
      { key: "coatIor", label: { zh: "折射率", en: "IOR" }, section: { zh: "塗層", en: "Coat" }, type: "float", default: 1.5, min: 1, max: 4, step: 0.01 },
      { key: "coatTint", label: { zh: "染色", en: "Tint" }, section: { zh: "塗層", en: "Coat" }, type: "color", default: [1, 1, 1, 1] },
      { key: "coatNormal", label: { zh: "法線", en: "Normal" }, section: { zh: "塗層", en: "Coat" }, type: "vector", default: "NORMAL" },
      { key: "sheenWeight", label: { zh: "權重", en: "Weight" }, section: { zh: "絨光", en: "Sheen" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "sheenRoughness", label: { zh: "粗糙度", en: "Roughness" }, section: { zh: "絨光", en: "Sheen" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "sheenTint", label: { zh: "染色", en: "Tint" }, section: { zh: "絨光", en: "Sheen" }, type: "color", default: [1, 1, 1, 1] },
      { key: "emissionColor", label: { zh: "顏色", en: "Color" }, section: { zh: "發光", en: "Emission" }, type: "color", default: [1, 1, 1, 1] },
      { key: "emissionStrength", label: { zh: "強度", en: "Strength" }, section: { zh: "發光", en: "Emission" }, type: "float", default: 0, min: 0, max: 20, step: 0.1 },
      { key: "thinFilmThickness", label: { zh: "厚度", en: "Thickness" }, section: { zh: "薄膜", en: "Thin Film" }, type: "float", default: 0, min: 0, max: 1000, step: 1 },
      { key: "thinFilmIor", label: { zh: "折射率", en: "IOR" }, section: { zh: "薄膜", en: "Thin Film" }, type: "float", default: 1.33, min: 1, max: 4, step: 0.01 },
    ],
    settings: [
      {
        key: "distribution",
        uiType: "select",
        label: { zh: "分布", en: "Distribution" },
        default: "multi_ggx",
        options: [
          { value: "ggx", label: { zh: "GGX", en: "GGX" } },
          { value: "multi_ggx", label: { zh: "多重散射 GGX", en: "Multiscatter GGX" } },
        ],
      },
      {
        key: "subsurfaceMethod",
        uiType: "select",
        label: { zh: "次表面方法", en: "Subsurface Method" },
        default: "random_walk",
        options: [
          { value: "burley", label: { zh: "Christensen-Burley", en: "Christensen-Burley" } },
          { value: "random_walk", label: { zh: "隨機行走", en: "Random Walk" } },
          { value: "random_walk_skin", label: { zh: "隨機漫步 (皮膚)", en: "Random Walk (Skin)" } },
          { value: "random_walk_legacy", label: { zh: "Random Walk (Legacy)", en: "Random Walk (Legacy)" } },
        ],
      },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        ctx.line(`normal = normalize(${ins.normal});`);
        const fresnel = ctx.freshVar("sssFresnel");
        ctx.line(`float ${fresnel} = bml_fresnel(normalize(vNormal), 1.4);`);
        const subsurface = ctx.freshVar("sssGlow");
        ctx.line(`vec3 ${subsurface} = (${ins.baseColor}).rgb * max(${ins.subsurfaceRadius}, vec3(0.0)) * clamp(${ins.subsurfaceScale}, 0.0, 10.0) * clamp(${ins.subsurfaceWeight}, 0.0, 1.0) * mix(1.0 - ${fresnel}, 1.0, clamp(${ins.subsurfaceAnisotropy}, 0.0, 1.0)) * (${ins.thinWall} ? 0.0 : 0.45);`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.baseColor}).rgb, clamp(${ins.roughness} + ${ins.diffuseRoughness} * 0.15, 0.035, 1.0), clamp(${ins.metallic}, 0.0, 1.0), (${ins.emissionColor}).rgb * ${ins.emissionStrength} + ${subsurface}, clamp(${ins.alpha}, 0.0, 1.0));`);
        ctx.line(`${v}.ior = clamp(${ins.ior}, 1.0, 4.0);`);
        ctx.line(`${v}.transmission = clamp(${ins.transmissionWeight}, 0.0, 1.0);`);
        ctx.line(`${v}.thinWall = ${ins.thinWall} ? 1.0 : 0.0;`);
        ctx.line(`${v}.coatWeight = clamp(${ins.coatWeight}, 0.0, 1.0);`);
        ctx.line(`${v}.coatRoughness = clamp(${ins.coatRoughness}, 0.035, 1.0);`);
        ctx.line(`${v}.coatIor = clamp(${ins.coatIor}, 1.0, 4.0);`);
        ctx.line(`${v}.coatTint = (${ins.coatTint}).rgb;`);
        ctx.line(`${v}.coatNormal = normalize(${ins.coatNormal});`);
        ctx.line(`${v}.sheenColor = (${ins.sheenTint}).rgb * clamp(${ins.sheenWeight}, 0.0, 1.0);`);
        ctx.line(`${v}.sheenRoughness = clamp(${ins.sheenRoughness}, 0.035, 1.0);`);
        ctx.line(`${v}.anisotropy = abs(clamp(${ins.anisotropy}, -1.0, 1.0));`);
        ctx.line(`${v}.anisotropyRotation = fract(clamp(${ins.anisotropyRotation}, 0.0, 1.0) + (length((${ins.tangent}).xy) > 0.00001 ? atan((${ins.tangent}).y, (${ins.tangent}).x) / 6.28318530718 : 0.0) + (${ins.anisotropy} < 0.0 ? 0.25 : 0.0));`);
        ctx.line(`${v}.specularIorLevel = clamp(${ins.specularIorLevel}, 0.0, 1.0);`);
        ctx.line(`${v}.specularTint = (${ins.specularTint}).rgb;`);
        ctx.line(`${v}.thinFilmWeight = step(0.001, ${ins.thinFilmThickness});`);
        ctx.line(`${v}.thinFilmIor = clamp(${ins.thinFilmIor}, 1.0, 4.0);`);
        ctx.line(`${v}.thinFilmThickness = clamp(${ins.thinFilmThickness}, 0.0, 1000.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_diffuse_bsdf",
    category: "shader",
    name: { zh: "漫射 BSDF", en: "Diffuse BSDF" },
    summary: { zh: "純粗糙、不反光的表面，像粉筆、紙張。", en: "A purely rough, non-reflective surface like chalk or paper." },
    docBeginner: {
      zh: "Diffuse BSDF 只描述「均勻往四面八方散開的光」，沒有 Principled BSDF 的金屬/透明等額外功能，適合用來做完全霧面的材質，或是教學上理解「最單純的材質節點長什麼樣子」。",
      en: "Diffuse BSDF only models light scattering evenly in all directions — no metal or transmission options. Good for fully matte materials, or for learning the simplest possible shader node.",
    },
    docPro: {
      zh: "Blender 的 Diffuse BSDF 有 Roughness 插槽時用的是 Oren-Nayar 模型而非純 Lambert；本沙盒的即時預覽把 Roughness 一併考慮進最終粗糙度，但不是逐光線的 Oren-Nayar 積分。",
      en: "Blender's Diffuse BSDF uses Oren-Nayar (not pure Lambert) when Roughness > 0. This preview folds Roughness into the final material roughness rather than doing a per-ray Oren-Nayar integral.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.0, min: 0, max: 1, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        ctx.line(`normal = normalize(${ins.normal});`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, clamp(0.9 + ${ins.roughness} * 0.1, 0.035, 1.0), 0.0, vec3(0.0), 1.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_glossy_bsdf",
    category: "shader",
    name: { zh: "光澤 BSDF", en: "Glossy BSDF" },
    summary: { zh: "純鏡面反射的表面，像拋光金屬、鏡子。", en: "A purely reflective, mirror-like surface — polished metal, mirrors." },
    docBeginner: {
      zh: "Glossy BSDF 只描述「反射」，沒有 Diffuse BSDF 那種散射底色。Roughness 決定反射清不清晰（0 = 像鏡子一樣清楚、1 = 模糊霧面反光）。常常拿來跟 Diffuse BSDF 用 Mix Shader 混合，做出「大部分是塑膠、邊緣有一層光澤」的車漆效果。",
      en: "Glossy BSDF only models reflection — no scattered base color like Diffuse BSDF. Roughness controls how sharp the reflection is (0 = mirror-clear, 1 = blurry/frosted). Often mixed with Diffuse BSDF via Mix Shader to create a 'mostly plastic, glossy at the edges' car-paint look.",
    },
    docPro: {
      zh: "本沙盒把 Glossy BSDF 實作成 metallic=1 的材質（純反射、底色只影響反射的顏色），這跟 Blender 實際使用的 GGX 微表面模型不完全相同，但在教學上足以呈現『純反射 vs 純散射』的差異。",
      en: "This sandbox implements Glossy BSDF as metallic=1 (pure reflection, base color tints the reflection). This isn't identical to Blender's actual GGX microfacet model, but is enough to teach the 'pure reflection vs. pure diffuse' distinction.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "anisotropy", label: { zh: "非等向性", en: "Anisotropy" }, type: "float", default: 0, min: -1, max: 1, step: 0.01 },
      { key: "rotation", label: { zh: "旋轉", en: "Rotation" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
      { key: "tangent", label: { zh: "切線", en: "Tangent" }, type: "vector", default: [0, 0, 0] },
    ],
    settings: [{
      key: "distribution",
      uiType: "select",
      label: { zh: "分布", en: "Distribution" },
      default: "multi_ggx",
      options: [
        { value: "beckmann", label: { zh: "貝克曼", en: "Beckmann" } },
        { value: "ggx", label: { zh: "GGX", en: "GGX" } },
        { value: "ashikhmin_shirley", label: { zh: "阿席克敏-雪莉", en: "Ashikhmin-Shirley" } },
        { value: "multi_ggx", label: { zh: "多重散射 GGX", en: "Multiscatter GGX" } },
      ],
    }],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        ctx.line(`normal = normalize(${ins.normal});`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, clamp(${ins.roughness}, 0.035, 1.0), 1.0, vec3(0.0), 1.0);`);
        ctx.line(`${v}.anisotropy = abs(clamp(${ins.anisotropy}, -1.0, 1.0));`);
        ctx.line(`${v}.anisotropyRotation = fract(${ins.rotation} + (length((${ins.tangent}).xy) > 0.00001 ? atan((${ins.tangent}).y, (${ins.tangent}).x) / 6.28318530718 : 0.0) + (${ins.anisotropy} < 0.0 ? 0.25 : 0.0));`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_emission",
    category: "shader",
    name: { zh: "發光", en: "Emission" },
    summary: { zh: "讓表面自己發光，常用來做燈光、螢幕、霓虹燈效果。", en: "Makes a surface emit light — useful for lamps, screens, neon." },
    docBeginner: {
      zh: "Emission 節點會讓材質本身發光，不受場景光源影響。Color 決定發光顏色，Strength 決定亮度，數值越大越亮（也越容易過曝變全白）。",
      en: "Emission makes the material glow on its own, independent of scene lighting. Color sets the glow color, Strength sets brightness — higher values can blow out to white.",
    },
    docPro: {
      zh: "在真實的 Cycles 渲染中，Emission 節點的物體本身可以照亮其他物體（成為光源）；本沙盒的即時預覽只把它當作自發光（emissive）顯示，不會反過來照亮場景中其他表面。",
      en: "In real Cycles rendering, an Emission surface can light up other objects (it becomes a light source). This live preview only shows it as self-emissive; it won't illuminate other surfaces in the scene.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "strength", label: { zh: "強度", en: "Strength" }, type: "float", default: 1, min: 0, max: 50, step: 0.1 },
    ],
    outputs: [{ key: "bsdf", label: { zh: "發光", en: "Emission" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf(vec3(0.0), 0.5, 0.0, (${ins.color}).rgb * ${ins.strength}, 1.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_transparent_bsdf",
    category: "shader",
    name: { zh: "透明 BSDF", en: "Transparent BSDF" },
    summary: { zh: "讓表面完全穿透，常跟 Mix Shader 搭配做出局部透明。", en: "Makes the surface fully see-through; often mixed with another shader for partial transparency." },
    docBeginner: {
      zh: "Transparent BSDF 本身沒有參數，接上去的表面會完全穿透。通常不會單獨使用，而是用 Mix Shader 把它跟另一個材質（例如 Diffuse）混合，做出「這裡透明、那裡不透明」的效果。",
      en: "Transparent BSDF has no parameters — surfaces using it become fully see-through. It's usually mixed with another shader via Mix Shader to make parts transparent and parts opaque.",
    },
    docPro: {
      zh: "本沙盒把 Transparent BSDF 實作成 alpha = 0、其餘欄位透傳顏色但不影響外觀；材質會統一開啟透明混合（alpha blending），不做真正的光線折射穿透。",
      en: "This sandbox implements Transparent BSDF as alpha = 0. Materials use standard alpha blending, not true ray refraction.",
    },
    supported: true,
    inputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] }],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, 0.5, 0.0, vec3(0.0), 0.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_mix_shader",
    category: "shader",
    name: { zh: "混合著色器", en: "Mix Shader" },
    summary: { zh: "把兩個材質依照比例混合成一個，例如玻璃 = 玻璃反射 + 折射穿透混合。", en: "Blends two shaders by a factor — e.g. glass mixes reflection and transmission." },
    docBeginner: {
      zh: "Mix Shader 有三個輸入：Fac（混合比例，0 = 完全用上面那個、1 = 完全用下面那個）、Shader（上）、Shader（下）。做玻璃、車漆等「多層材質疊加」效果時很常用。",
      en: "Mix Shader has three inputs: Fac (0 = fully the top shader, 1 = fully the bottom one), Shader (top), Shader (bottom). Very common for layered materials like glass or car paint.",
    },
    docPro: {
      zh: "物理上 Mix Shader 是依 Fac 選擇兩個 BSDF 的光程機率，而不是把材質參數直接混色。本沙盒會線性混合基礎、透射、塗層、絨光與薄膜等預覽欄位，是適合即時教學的近似。",
      en: "Physically, Mix Shader chooses between two BSDFs by path probability rather than simply blending material parameters. This preview linearly mixes its Base, Transmission, Coat, Sheen, and Thin Film fields as a real-time teaching approximation.",
    },
    supported: true,
    inputs: [
      { key: "fac", label: { zh: "係數", en: "Factor" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "shader1", label: { zh: "著色器", en: "Shader" }, type: "shader", default: null },
      { key: "shader2", label: { zh: "著色器", en: "Shader" }, type: "shader", default: null },
    ],
    outputs: [{ key: "bsdf", label: { zh: "Shader", en: "Shader" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_mixShader(${ins.shader1}, ${ins.shader2}, clamp(${ins.fac}, 0.0, 1.0));`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_add_shader",
    category: "shader",
    name: { zh: "新增著色器", en: "Add Shader" },
    summary: { zh: "把兩個材質的光線效果直接相加（不是平均）。", en: "Adds two shaders' light contribution together (not averaged)." },
    docBeginner: {
      zh: "Add Shader 跟 Mix Shader 很像，但沒有 Fac 比例——兩個輸入會直接疊加，常用來疊加一層額外的反射或發光效果在原本材質上。",
      en: "Similar to Mix Shader but without a Fac ratio — both inputs are simply added together. Often used to layer extra reflection or glow on top of a base material.",
    },
    docPro: {
      zh: "本沙盒的近似作法：基礎參數取兩者平均、發光直接相加，透射、塗層與薄膜取較強的一側，避免直接相加超出合理範圍。這跟真實的輻射相加不完全相同，但足以示範『疊加』的概念。",
      en: "Approximation used here: base parameters are averaged, emission is summed, and the stronger Transmission, Coat, and Thin Film layers are kept to avoid invalid ranges. This is not true radiance addition, but it demonstrates the layering concept.",
    },
    supported: true,
    inputs: [
      { key: "shader1", label: { zh: "著色器", en: "Shader" }, type: "shader", default: null },
      { key: "shader2", label: { zh: "著色器", en: "Shader" }, type: "shader", default: null },
    ],
    outputs: [{ key: "bsdf", label: { zh: "Shader", en: "Shader" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_addShader(${ins.shader1}, ${ins.shader2});`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_glass_bsdf",
    category: "shader",
    name: { zh: "玻璃 BSDF", en: "Glass BSDF" },
    summary: { zh: "同時具有反射與折射穿透的表面，做玻璃、水、寶石的基礎。", en: "A surface with both reflection and refraction — the basis for glass, water, gems." },
    docBeginner: {
      zh: "Glass BSDF 讓表面既會反光、又會透光，Roughness 控制模糊程度、IOR（折射率）決定反光強不強、透明感夠不夠明顯（玻璃約 1.45、水約 1.33、鑽石約 2.42——數字越大，邊緣反光越明顯、整體看起來越像寶石而不是單純的窗玻璃）。正面看比較透、側邊/邊緣比較容易看到反光，這是玻璃的典型特徵。",
      en: "Glass BSDF both reflects and lets light through. Roughness blurs it, and IOR (index of refraction) controls how strong the reflections are and how transparent it looks overall (glass ≈1.45, water ≈1.33, diamond ≈2.42 — higher numbers give stronger edge reflections and a gem-like look rather than plain window glass). It looks through more head-on and reflects more at the edges — the classic glass 'rim' look.",
    },
    docPro: {
      zh: "真正的折射需要對背後場景做逐光線彎曲取樣，屬於路徑追蹤渲染器的強項（我們也試過直接用 Three.js MeshPhysicalMaterial 內建的 transmission 物理透射功能，但在這個渲染環境下沒有正確顯現透射效果，所以改用下面這個更可控的做法）。本沙盒把 Glass BSDF 實作成：用 Fresnel 公式依 IOR 算出「側邊反光強度」，讓透明度隨著視角與 IOR 變化——正面看比較透明、側邊/IOR 越高越不透明越反光，方向是對的，但不會真的讓背後景物彎曲變形。",
      en: "True refraction requires bending rays per-sample against the scene behind — a path tracer's specialty (we also tried Three.js MeshPhysicalMaterial's built-in physical transmission feature directly, but it didn't render the transmission effect correctly in this rendering setup, so we switched to the more controllable approach below). This sandbox implements Glass BSDF by computing an edge-reflection strength from IOR via the Fresnel equation, varying transparency with viewing angle and IOR — more see-through head-on, more opaque/reflective at grazing angles or with higher IOR. The direction is physically correct, but it won't actually bend or distort what's behind it.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.0, min: 0, max: 1, step: 0.01 },
      { key: "ior", label: { zh: "IOR", en: "IOR" }, type: "float", default: 1.5, min: 1, max: 3, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
      { key: "thinFilmThickness", label: { zh: "薄膜厚度", en: "Thin Film Thickness" }, type: "float", default: 0, min: 0, max: 1000, step: 1 },
      { key: "thinFilmIor", label: { zh: "薄膜 IOR", en: "Thin Film IOR" }, type: "float", default: 1.33, min: 1, max: 4, step: 0.01 },
    ],
    settings: [{
      key: "distribution",
      uiType: "select",
      label: { zh: "分布", en: "Distribution" },
      default: "multi_ggx",
      options: [
        { value: "beckmann", label: { zh: "貝克曼", en: "Beckmann" } },
        { value: "ggx", label: { zh: "GGX", en: "GGX" } },
        { value: "multi_ggx", label: { zh: "多重散射 GGX", en: "Multiscatter GGX" } },
      ],
    }],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const fres = ctx.freshVar("gfres");
        ctx.line(`normal = normalize(${ins.normal});`);
        ctx.line(`float ${fres} = bml_fresnel(normalize(${ins.normal}), max(${ins.ior}, 1.001));`);
        const alpha = ctx.freshVar("galpha");
        ctx.line(`float ${alpha} = clamp(0.06 + ${fres} * 0.9, 0.0, 1.0);`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, clamp(${ins.roughness}, 0.035, 1.0), 0.0, vec3(0.0), ${alpha});`);
        ctx.line(`${v}.ior = clamp(${ins.ior}, 1.0, 4.0);`);
        ctx.line(`${v}.transmission = 1.0;`);
        ctx.line(`${v}.thinFilmWeight = step(0.001, ${ins.thinFilmThickness});`);
        ctx.line(`${v}.thinFilmIor = clamp(${ins.thinFilmIor}, 1.0, 4.0);`);
        ctx.line(`${v}.thinFilmThickness = clamp(${ins.thinFilmThickness}, 0.0, 1000.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_toon_bsdf",
    category: "shader",
    name: { zh: "卡通 BSDF", en: "Toon BSDF" },
    summary: { zh: "把光影分成清楚的色塊，做卡通/賽璐璐風格。", en: "Splits lighting into hard bands for a cartoon/cel-shaded look." },
    docBeginner: { zh: "Toon BSDF 讓明暗交界變得銳利（一階一階，而不是平滑漸層），是動漫風格算圖常用的節點。", en: "Toon BSDF makes the light/shadow boundary sharp (stepped, not smooth gradient) — common for anime-style rendering." },
    docPro: {
      zh: "要做出真正的色塊感，需要在光照計算之後（而不是之前）做量化，這跟本沙盒目前『先給材質參數、再交給 Three.js 內建光照』的架構不同，屬於之後才會支援的進階節點。",
      en: "A true stepped look requires quantizing *after* the lighting calculation, not before — different from this sandbox's current 'hand off material params, let Three.js light it' architecture. Planned for a future upgrade.",
    },
    supported: false,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "size", label: { zh: "色塊大小", en: "Size" }, type: "float", default: 0.5, min: 0, max: 1 },
      { key: "smooth", label: { zh: "邊緣平滑", en: "Smooth" }, type: "float", default: 0.0, min: 0, max: 1 },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
  },
  {
    id: "shader_translucent_bsdf",
    category: "shader",
    name: { zh: "半透明 BSDF", en: "Translucent BSDF" },
    summary: { zh: "讓光從背面透過來，像葉子、紙張透光的感覺。", en: "Lets light pass through from the back — like light shining through a leaf or paper." },
    docBeginner: { zh: "常跟 Diffuse BSDF 用 Mix Shader 混合，模擬光線穿透薄物體背面的效果。", en: "Often mixed with Diffuse BSDF via Mix Shader to simulate light passing through thin objects." },
    docPro: {
      zh: "真正的半透射需要取得物體背面的光照與厚度資訊，這在單一表面的即時預覽架構下無法取得（原始碼裡 Blender 這個節點確實也只有 Color／Normal 兩個輸入，沒有額外的厚度或半徑參數）。本沙盒改用跟次表面散射類似的簡化：用菲涅爾算出「側邊/背向鏡頭」的比例，疊加一層用 Color 驅動的發光——方向正確（側邊/背光處更亮，模擬光線從背後透出的感覺），但不是真的取樣背面光照。跟次表面散射的差異：次表面散射多了 Radius 讓每個色版散射距離不同（做出偏紅的邊緣），半透射沒有這個色散效果，邊緣發光就是原本的顏色本身。",
      en: "Real translucency needs lighting and thickness info from the back face, unavailable in this single-surface live preview architecture (Blender's own node source only has Color/Normal inputs too — no thickness or radius parameter). This sandbox uses a simplification similar to Subsurface Scattering: a Fresnel term drives an edge/back-facing glow using the Color itself — directionally correct (brighter at edges/backlit areas, mimicking light bleeding through from behind), but not a real sample of back-face lighting. Difference from Subsurface Scattering: SSS has a Radius vector giving each color channel a different falloff (producing a reddish edge tint); Translucent has no such per-channel dispersion — its edge glow is just the Color itself.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        ctx.line(`normal = normalize(${ins.normal});`);
        const fres = ctx.freshVar("translFres");
        ctx.line(`float ${fres} = bml_fresnel(normalize(vNormal), 1.3);`);
        const glow = ctx.freshVar("translGlow");
        ctx.line(`vec3 ${glow} = (${ins.color}).rgb * ${fres} * 0.6;`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb * 0.6, 0.9, 0.0, ${glow}, 1.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_subsurface_scattering",
    category: "shader",
    name: { zh: "次表面散射", en: "Subsurface Scattering" },
    summary: { zh: "模擬光線鑽進表面下方再散出來，做皮膚、蠟燭、牛奶的關鍵節點。", en: "Simulates light entering beneath the surface and scattering back out — key for skin, wax, milk." },
    docBeginner: { zh: "沒有次表面散射時，皮膚看起來會像塑膠。這個節點讓邊緣（例如耳朵、鼻子逆光處）透出微微的紅色光暈。", en: "Without subsurface scattering, skin looks plasticky. This node lets edges (like a backlit ear or nose) glow faintly red." },
    docPro: {
      zh: "真實運算需要在表面下做多次取樣模糊（screen-space 或 burley diffusion profile），是完整光線追蹤/後製管線的工作。本沙盒改用簡化近似：以 Fresnel 算出邊緣比例，讓 Radius 的 R/G/B 三個分量各自的比例變成邊緣處的透光顏色（預設值紅色分量比藍色分量走得遠，所以邊緣會偏紅——這正是皮膚逆光時耳朵、鼻尖會透出紅色光暈的原因），再乘上 Scale 控制整體強弱。這不是真正的次表面漫射，但方向與觀感是對的。",
      en: "Real SSS needs multi-sample blurring beneath the surface (screen-space or a Burley diffusion profile) — a full ray-tracing/post-process job. This sandbox uses a simplified approximation instead: a Fresnel term drives an edge-tinted glow using the Radius vector's R/G/B ratios (the default has red traveling further than blue, which is why backlit ears/noses glow reddish), scaled by Scale. It isn't true subsurface diffusion, but the direction and look are right.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.8, 0.8, 0.8, 1] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 0.005, min: 0, max: 2, step: 0.001 },
      { key: "radius", label: { zh: "半徑", en: "Radius" }, type: "vector", default: [1, 0.2, 0.1] },
      { key: "ior", label: { zh: "IOR", en: "IOR" }, type: "float", default: 1.4, min: 1, max: 4, step: 0.01 },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 1, min: 0, max: 1, step: 0.01 },
      { key: "anisotropy", label: { zh: "非等向性", en: "Anisotropy" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    settings: [{
      key: "method",
      uiType: "select",
      label: { zh: "方法", en: "Method" },
      default: "random_walk",
      options: [
        { value: "burley", label: { zh: "Christensen-Burley", en: "Christensen-Burley" } },
        { value: "random_walk", label: { zh: "隨機行走", en: "Random Walk" } },
        { value: "random_walk_skin", label: { zh: "隨機漫步 (皮膚)", en: "Random Walk (Skin)" } },
        { value: "random_walk_legacy", label: { zh: "Random Walk (Legacy)", en: "Random Walk (Legacy)" } },
      ],
    }],
    outputs: [{ key: "bsdf", label: { zh: "BSSRDF", en: "BSSRDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const fres = ctx.freshVar("sssFres");
        ctx.line(`normal = normalize(${ins.normal});`);
        ctx.line(`float ${fres} = bml_fresnel(normalize(${ins.normal}), max(${ins.ior}, 1.001));`);
        const radius = ctx.freshVar("sssRadius");
        ctx.line(`vec3 ${radius} = clamp(${ins.radius}, 0.0, 5.0);`);
        const glow = ctx.freshVar("sssGlow");
        ctx.line(`vec3 ${glow} = (${ins.color}).rgb * ${radius} * ${fres} * ${ins.scale} * 4.0 * mix(1.0, 1.5, clamp(${ins.anisotropy}, 0.0, 1.0));`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, clamp(${ins.roughness}, 0.035, 1.0), 0.0, ${glow}, 1.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_sheen_bsdf",
    category: "shader",
    name: { zh: "光澤 BSDF", en: "Sheen BSDF" },
    summary: { zh: "布料邊緣逆光時的微光，做絨布、天鵝絨質感。", en: "The faint edge glow seen on backlit fabric — for velvet and cloth." },
    docBeginner: { zh: "單獨使用效果不明顯，通常混合進 Principled BSDF 的材質裡，讓布料邊緣多一點絨毛感的反光。", en: "Subtle on its own — usually blended into a Principled BSDF material to add a fuzzy edge highlight to fabric." },
    docPro: {
      zh: "在 Blender 5.2 LTS，Sheen 已是 Principled BSDF 的絨光層；這裡仍保留獨立節點方便教學拆解。本沙盒把它實作成一個底色全黑、只靠 Fresnel 邊緣光（Emission 欄位）貢獻亮度的 BSDF——這樣跟其他材質用 Mix Shader 疊加時，才不會把底色蓋掉，只會在邊緣多一圈絨毛感的光暈。Roughness 越高，光暈覆蓋的角度範圍越寬、越柔和。",
      en: "In Blender 5.2 LTS, Sheen is a layer of Principled BSDF; this standalone node is kept here for teaching purposes. This sandbox implements it as a BSDF with a fully black base color that only contributes brightness through a Fresnel-driven edge glow (via the Emission channel) — so when layered onto another material with Mix Shader, it won't wash out the base color, just add a fuzzy rim highlight. Higher Roughness widens and softens the glow.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    settings: [{
      key: "distribution",
      uiType: "select",
      label: { zh: "分布", en: "Distribution" },
      default: "microfiber",
      options: [
        { value: "ashikhmin", label: { zh: "阿席克敏", en: "Ashikhmin" } },
        { value: "microfiber", label: { zh: "微纖維", en: "Microfiber" } },
      ],
    }],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        const ior = ctx.freshVar("sheenIor");
        ctx.line(`float ${ior} = mix(1.05, 3.0, clamp(${ins.roughness}, 0.0, 1.0));`);
        const fres = ctx.freshVar("sheenFres");
        ctx.line(`normal = normalize(${ins.normal});`);
        ctx.line(`float ${fres} = bml_fresnel(normalize(${ins.normal}), ${ior});`);
        const glow = ctx.freshVar("sheenGlow");
        ctx.line(`vec3 ${glow} = (${ins.color}).rgb * ${fres} * 0.6;`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf(vec3(0.0), clamp(${ins.roughness}, 0.035, 1.0), 0.0, ${glow}, 1.0);`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_holdout",
    category: "shader",
    name: { zh: "鉗制", en: "Holdout" },
    summary: { zh: "讓物體在畫面中變成完全透明的「洞」，只用在合成流程。", en: "Makes an object a fully transparent 'hole' in the render — used only for compositing." },
    docBeginner: { zh: "Holdout 會讓物體不出現在畫面裡（但仍然遮住背後的東西），常用在需要把 3D 物件疊加到真實影片上的合成工作。", en: "Holdout makes an object invisible in the render (while still occluding what's behind it) — used when compositing 3D objects onto real footage." },
    docPro: { zh: "這是合成（compositing）專用的概念，跟材質外觀無關，本學習網站以材質為主，此節點僅列文件。", en: "This is a compositing-only concept unrelated to material appearance. Since this site focuses on materials, it's documented but not interactive." },
    supported: false,
    inputs: [],
    outputs: [{ key: "bsdf", label: { zh: "Holdout", en: "Holdout" }, type: "shader" }],
  },
  {
    id: "shader_refraction_bsdf",
    category: "shader",
    name: { zh: "折射 BSDF", en: "Refraction BSDF" },
    summary: { zh: "只有折射穿透、沒有反射的表面，通常配合 Glass 概念使用。", en: "Refraction only, no reflection — usually used alongside the Glass concept." },
    docBeginner: { zh: "跟 Glass BSDF 很像，但完全沒有反光，適合用來理解『折射』跟『反射』是兩件獨立的事。", en: "Similar to Glass BSDF but with zero reflection — useful for understanding that refraction and reflection are separate phenomena." },
    docPro: {
      zh: "真正的折射彎曲需要對背景做逐光線取樣，本沙盒的即時預覽管線做不到（Glass BSDF 也一樣做不到真的彎曲，改用 Fresnel 驅動的透明度取代）。這個節點刻意用比 Glass 更簡化的方式實作，藉此凸顯兩者的概念差異：Glass BSDF＝反射＋折射依 Fresnel 混合（所以側邊角度會明顯變得更反光），Refraction BSDF＝只有純折射穿透、完全沒有反射分量，因此本沙盒讓它的透明度只取決於 Roughness（不像 Glass 那樣隨視角在邊緣變亮），比較兩者的即時預覽就能感受到「有沒有 Fresnel 反射」這個差異。**誠實記錄的簡化**：IOR 插槽在本沙盒沒有可見效果——沒有真的彎曲光線，IOR 便無事可做；保留這個插槽只是為了跟 Blender 介面一致、方便理解概念，不要誤以為調它會看到變化。",
      en: "True refractive bending needs per-ray sampling of the background — this sandbox's live preview pipeline can't do that (Glass BSDF can't either; it substitutes a Fresnel-driven transparency instead). This node is implemented more simply than Glass on purpose, to highlight the conceptual difference: Glass BSDF blends reflection and refraction by Fresnel (so it visibly gets more reflective at grazing angles), while Refraction BSDF is pure transmission with no reflection component at all — so here its transparency depends only on Roughness, not on viewing angle. Comparing the two live previews makes the 'does it have Fresnel reflection or not' distinction tangible. **Honestly documented simplification**: the IOR socket has no visible effect in this sandbox — with no real ray bending, IOR has nothing to do. It's kept only to match Blender's interface; don't expect turning it to change anything here.",
    },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0, min: 0, max: 1, step: 0.01 },
      { key: "ior", label: { zh: "IOR", en: "IOR" }, type: "float", default: 1.45, min: 1, max: 3, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    settings: [{
      key: "distribution",
      uiType: "select",
      label: { zh: "分布", en: "Distribution" },
      default: "beckmann",
      options: [
        { value: "beckmann", label: { zh: "貝克曼", en: "Beckmann" } },
        { value: "ggx", label: { zh: "GGX", en: "GGX" } },
      ],
    }],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
    glsl: {
      emit(ctx, ins) {
        ctx.line(`normal = normalize(${ins.normal});`);
        const alpha = ctx.freshVar("refrAlpha");
        ctx.line(`float ${alpha} = clamp(0.05 + (${ins.roughness}) * 0.35, 0.0, 1.0);`);
        const v = ctx.freshVar("bsdf");
        ctx.line(`BmlBsdf ${v} = bml_makeBsdf((${ins.color}).rgb, clamp(${ins.roughness}, 0.035, 1.0), 0.0, vec3(0.0), ${alpha});`);
        ctx.line(`${v}.ior = clamp(${ins.ior}, 1.0, 4.0);`);
        ctx.line(`${v}.transmission = 1.0;`);
        return { bsdf: v };
      },
    },
  },
  {
    id: "shader_volume_absorption",
    category: "shader",
    name: { zh: "體積吸收", en: "Volume Absorption" },
    summary: { zh: "體積內部吸收光線，做有色的煙霧、玻璃內部霧感。", en: "Absorbs light within a volume — colored smoke or foggy glass interiors." },
    docBeginner: { zh: "接在 Material Output 的 Volume 插槽（不是 Surface），讓物體『內部』有吸光效果。", en: "Connects to Material Output's Volume socket (not Surface) to give an object's interior a light-absorbing effect." },
    docPro: { zh: "體積渲染需要在物體內部做多層取樣（ray marching），本沙盒的即時預覽只處理 Surface，Volume 插槽先列文件、尚未支援。", en: "Volume rendering requires multi-step ray marching through the interior. This preview only handles Surface — Volume is documented but not yet supported." },
    supported: false,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "density", label: { zh: "密度", en: "Density" }, type: "float", default: 1, min: 0, max: 10 },
    ],
    outputs: [{ key: "volume", label: { zh: "Volume", en: "Volume" }, type: "shader" }],
  },
  {
    id: "shader_volume_scatter",
    category: "shader",
    name: { zh: "體積散射", en: "Volume Scatter" },
    summary: { zh: "體積內部散射光線，做均勻的煙霧、雲霧效果。", en: "Scatters light within a volume — even smoke or cloud/fog effects." },
    docBeginner: { zh: "跟 Volume Absorption 常一起用：Absorption 讓光變暗，Scatter 讓光散開變柔和。", en: "Often used with Volume Absorption: Absorption darkens light, Scatter softens/spreads it." },
    docPro: { zh: "同樣需要 ray marching 才能正確顯示，暫不支援即時預覽。", en: "Also requires ray marching to render correctly — not yet supported in live preview." },
    supported: false,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
      { key: "density", label: { zh: "密度", en: "Density" }, type: "float", default: 1, min: 0, max: 10 },
      { key: "anisotropy", label: { zh: "各向異性", en: "Anisotropy" }, type: "float", default: 0, min: -1, max: 1 },
    ],
    outputs: [{ key: "volume", label: { zh: "Volume", en: "Volume" }, type: "shader" }],
  },
  {
    id: "shader_principled_volume",
    category: "shader",
    name: { zh: "原則化容體", en: "Principled Volume" },
    summary: { zh: "萬用體積材質，一個節點做出火焰、煙霧等體積效果。", en: "The all-in-one volume shader for fire, smoke, and other volumetric effects." },
    docBeginner: { zh: "常搭配 Blender 的煙霧/火焰模擬使用，透過密度、顏色、發光等屬性一次描述整團體積的樣子。", en: "Commonly paired with Blender's smoke/fire simulation, describing an entire volume's look via density, color, and emission." },
    docPro: { zh: "體積模擬與 ray marching 超出本網站『材質節點』的教學範圍與即時預覽能力，先列文件供查閱。", en: "Volume simulation and ray marching are beyond this site's material-node teaching scope and live-preview capability. Documentation only." },
    supported: false,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.5, 0.5, 0.5, 1] },
      { key: "density", label: { zh: "密度", en: "Density" }, type: "float", default: 1, min: 0, max: 10 },
      { key: "emissionStrength", label: { zh: "發光強度", en: "Emission Strength" }, type: "float", default: 0, min: 0, max: 10 },
    ],
    outputs: [{ key: "volume", label: { zh: "Volume", en: "Volume" }, type: "shader" }],
  },
  {
    id: "shader_hair_bsdf",
    category: "shader",
    name: { zh: "毛髮 BSDF", en: "Hair BSDF" },
    summary: { zh: "專門描述毛髮纖維反光方式的材質節點。", en: "A shader specialized for how hair strands reflect light." },
    docBeginner: { zh: "只用在毛髮/毛髮粒子系統的材質上，一般物體表面用不到。", en: "Used only on hair/fur particle system materials — not applicable to regular object surfaces." },
    docPro: { zh: "需要毛髮專用的切線資訊與粒子系統資料，本沙盒的預覽物件（球體/方塊等）沒有毛髮幾何，先列文件。", en: "Requires hair-specific tangent data and particle system info. This sandbox's preview meshes (sphere/cube/etc.) have no hair geometry — documentation only." },
    supported: false,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.2, 0.1, 0.05, 1] },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.3, min: 0, max: 1 },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
  },
  {
    id: "shader_principled_hair_bsdf",
    category: "shader",
    name: { zh: "Principled Hair BSDF", en: "Principled Hair BSDF" },
    summary: { zh: "萬用毛髮材質，用色素濃度取代直接指定顏色，更接近真實毛髮。", en: "The all-in-one hair shader — uses pigment concentration instead of a direct color, closer to real hair." },
    docBeginner: { zh: "做角色頭髮/毛皮時的首選節點，比 Hair BSDF 多了更符合直覺的參數（例如粗細、色素）。", en: "The go-to node for character hair/fur — offers more intuitive parameters than Hair BSDF (like thickness and pigment)." },
    docPro: { zh: "同樣需要毛髮幾何與切線資料，本沙盒暫不支援，先列文件。", en: "Also requires hair geometry and tangent data, not yet supported by this sandbox. Documentation only." },
    supported: false,
    inputs: [
      { key: "melanin", label: { zh: "黑色素", en: "Melanin" }, type: "float", default: 0.3, min: 0, max: 1 },
      { key: "roughness", label: { zh: "粗糙度", en: "Roughness" }, type: "float", default: 0.3, min: 0, max: 1 },
    ],
    outputs: [{ key: "bsdf", label: { zh: "BSDF", en: "BSDF" }, type: "shader" }],
  },
];
