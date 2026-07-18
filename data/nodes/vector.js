// Vector 分類：處理座標/法線等向量資料的節點。
import { buildCurveExprGLSL } from "../../js/core/curveUtil.js";

export default [
  {
    id: "vector_mapping",
    category: "vector",
    name: { zh: "映射", en: "Mapping" },
    summary: { zh: "平移、旋轉、縮放座標，常用來調整貼圖的位置與密度。", en: "Translate, rotate, and scale coordinates — commonly used to reposition or tile textures." },
    docBeginner: {
      zh: "Mapping 節點用來調整「座標」本身，而不是顏色。最常見用法：把 Texture Coordinate 或預設 UV 接進來，用 Scale 控制貼圖重複幾次、用 Location 平移貼圖位置。",
      en: "The Mapping node adjusts the coordinate itself, not color. Common use: feed in Texture Coordinate (or default UV), use Scale to control texture tiling and Location to shift its position.",
    },
    docPro: {
      zh: "類型（Type）現在有 4 種，跟 Blender 一致：點（Point，預設，一般座標平移/旋轉/縮放，公式為先縮放、再旋轉、最後加位置）、紋理（Texture，Point 的反向變換，用來把世界座標换算回貼圖座標，套用「反向旋轉」再除以縮放）、向量（Vector，跟 Point 一樣但不套用位置——方向不該受位移影響）、法線（Normal，除以縮放而非乘上、旋轉後正規化，正確處理非等比縮放下的法線方向，也不套用位置）。4 種公式都對照 Blender GPU 著色器原始碼（`gpu_shader_material_mapping.glsl` 的 `mapping_point`/`mapping_texture`/`mapping_vector`/`mapping_normal`）核對過一致。",
      en: "Type now has 4 options matching Blender: Point (default, ordinary coordinate translate/rotate/scale — scale, then rotate, then add location), Texture (Point's inverse transform, used to convert a world position back into texture space — applies the inverse rotation then divides by scale), Vector (same as Point but without location — directions shouldn't be affected by translation), and Normal (divides by scale instead of multiplying, then rotates and normalizes — correctly handles normal directions under non-uniform scale; also skips location). All 4 formulas were verified against Blender's GPU shader source (`mapping_point`/`mapping_texture`/`mapping_vector`/`mapping_normal` in `gpu_shader_material_mapping.glsl`).",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "location", label: { zh: "位置", en: "Location" }, type: "vector", default: [0, 0, 0] },
      { key: "rotation", label: { zh: "旋轉(度)", en: "Rotation (deg)" }, type: "vector", default: [0, 0, 0] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "vector", default: [1, 1, 1] },
    ],
    settings: [
      {
        key: "mappingType",
        uiType: "select",
        label: { zh: "類型", en: "Type" },
        default: "point",
        options: [
          { value: "point", label: { zh: "點 Point", en: "Point" } },
          { value: "texture", label: { zh: "紋理 Texture", en: "Texture" } },
          { value: "vector", label: { zh: "向量 Vector", en: "Vector" } },
          { value: "normal", label: { zh: "法線 Normal", en: "Normal" } },
        ],
      },
    ],
    outputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" }],
    glsl: {
      emit(ctx, ins, node) {
        const type = node.params.mappingType || "point";
        const v = ctx.freshVar("map");
        if (type === "texture") {
          const rot = ctx.freshVar("mapRotInv");
          ctx.line(`mat3 ${rot} = transpose(bml_eulerRotMat3(${ins.rotation}));`);
          ctx.line(`vec3 ${v} = bml_safeDivVec3(${rot} * ((${ins.vector}) - (${ins.location})), (${ins.scale}));`);
        } else if (type === "vector") {
          ctx.line(`vec3 ${v} = bml_eulerRotMat3(${ins.rotation}) * ((${ins.vector}) * (${ins.scale}));`);
        } else if (type === "normal") {
          ctx.line(`vec3 ${v} = normalize(bml_eulerRotMat3(${ins.rotation}) * bml_safeDivVec3((${ins.vector}), (${ins.scale})));`);
        } else {
          ctx.line(`vec3 ${v} = bml_rotateEuler((${ins.vector}) * (${ins.scale}), (${ins.rotation})) + (${ins.location});`);
        }
        return { vector: v };
      },
    },
  },
  {
    id: "vector_bump",
    category: "vector",
    name: { zh: "凹凸", en: "Bump" },
    summary: { zh: "用一個灰階高度值假造表面凹凸的光影效果，不會真的改變幾何形狀。", en: "Fakes surface bumps' lighting from a grayscale height value, without actually changing the geometry." },
    docBeginner: {
      zh: "Bump 接收一個數值（通常來自 Noise/Wave Texture 的 Height），越亮的地方看起來越凸起。它只是讓光影看起來有凹凸，摸起來（碰撞、輪廓）其實還是平的。",
      en: "Bump takes a value (often a Noise/Wave Texture's output as Height) — brighter areas look raised. It only fakes the lighting; the actual geometry (silhouette, collisions) stays flat.",
    },
    docPro: {
      zh: "本沙盒用『螢幕空間導數』（dFdx/dFdy）技巧，把高度值的局部斜率換算成法線偏移，不需要額外的切線資料，效果跟 Blender 的 Bump 節點方向一致，但實作細節不完全相同。要接到光影效果，需把 Bump 的輸出接到 Principled BSDF 的 Normal 插槽。",
      en: "This sandbox uses the screen-space derivative (dFdx/dFdy) technique to convert the height's local slope into a normal offset, without needing extra tangent data. The direction of the effect matches Blender's Bump node, though implementation details differ. To see the effect, connect Bump's output into a Principled BSDF's Normal socket.",
    },
    supported: true,
    inputs: [
      { key: "height", label: { zh: "高度", en: "Height" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 },
      { key: "strength", label: { zh: "強度", en: "Strength" }, type: "float", default: 1, min: 0, max: 5, step: 0.01 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    outputs: [{ key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("bump");
        ctx.line(`vec3 ${v} = bml_bump(${ins.height}, ${ins.strength} * 0.1, normalize(${ins.normal}));`);
        return { normal: v };
      },
    },
  },
  {
    id: "vector_math",
    category: "vector",
    name: { zh: "向量數學", en: "Vector Math" },
    summary: { zh: "對兩個向量做加減乘除、內積、外積、正規化等運算。", en: "Performs add/subtract/multiply/divide, dot/cross product, normalize, and more on vectors." },
    docBeginner: {
      zh: "跟 Math 節點很像，但操作的是三維向量（例如座標、法線）而不是單一數值。常用來手動調整座標或法線方向。",
      en: "Similar to the Math node, but operates on 3D vectors (like coordinates or normals) instead of single values. Often used to manually adjust coordinates or normal directions.",
    },
    docPro: {
      zh: "運算清單盡量對齊 Blender 完整版。跟 Blender 不同的地方：Blender 會依運算方式動態隱藏用不到的插槽，本沙盒固定顯示 3 個向量輸入＋1 個 Scale 數值（給 Scale/Refract 運算用），用不到的忽略即可；輸出固定同時提供 Vector 與 Value 兩種，跟 Blender 一致。",
      en: "The operation list closely mirrors full Blender. Difference from Blender: Blender dynamically hides sockets based on the operation; this sandbox always shows 3 vector inputs plus a Scale value (used by Scale/Refract) — unused ones are simply ignored. Both Vector and Value outputs are always available, matching Blender.",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector1", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] },
      { key: "vector2", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] },
      { key: "vector3", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 1, step: 0.01 },
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
          { value: "divide", label: { zh: "相除 Divide", en: "Divide" }, group: "函式 Functions" },
          { value: "multiply_add", label: { zh: "乘加 Multiply Add", en: "Multiply Add" }, group: "函式 Functions" },
          { value: "cross", label: { zh: "外積 Cross Product", en: "Cross Product" }, group: "函式 Functions" },
          { value: "project", label: { zh: "投影 Project", en: "Project" }, group: "函式 Functions" },
          { value: "reflect", label: { zh: "反射 Reflect", en: "Reflect" }, group: "函式 Functions" },
          { value: "refract", label: { zh: "折射 Refract", en: "Refract" }, group: "函式 Functions" },
          { value: "faceforward", label: { zh: "面向 Faceforward", en: "Faceforward" }, group: "函式 Functions" },
          { value: "dot", label: { zh: "內積 Dot Product", en: "Dot Product" }, group: "函式 Functions" },
          { value: "distance", label: { zh: "距離 Distance", en: "Distance" }, group: "幾何 Geometry" },
          { value: "length", label: { zh: "長度 Length", en: "Length" }, group: "幾何 Geometry" },
          { value: "scale", label: { zh: "縮放 Scale", en: "Scale" }, group: "幾何 Geometry" },
          { value: "normalize", label: { zh: "正規化 Normalize", en: "Normalize" }, group: "幾何 Geometry" },
          { value: "absolute", label: { zh: "絕對值 Absolute", en: "Absolute" }, group: "捨入 Rounding" },
          { value: "minimum", label: { zh: "取最小 Minimum", en: "Minimum" }, group: "捨入 Rounding" },
          { value: "maximum", label: { zh: "取最大 Maximum", en: "Maximum" }, group: "捨入 Rounding" },
          { value: "floor", label: { zh: "無條件捨去 Floor", en: "Floor" }, group: "捨入 Rounding" },
          { value: "ceil", label: { zh: "無條件進位 Ceil", en: "Ceil" }, group: "捨入 Rounding" },
          { value: "fraction", label: { zh: "小數部分 Fraction", en: "Fraction" }, group: "捨入 Rounding" },
          { value: "modulo", label: { zh: "取餘 Modulo", en: "Modulo" }, group: "捨入 Rounding" },
          { value: "wrap", label: { zh: "環繞 Wrap", en: "Wrap" }, group: "捨入 Rounding" },
          { value: "snap", label: { zh: "吸附 Snap", en: "Snap" }, group: "捨入 Rounding" },
          { value: "sine", label: { zh: "正弦 Sine", en: "Sine" }, group: "三角函數 Trigonometric" },
          { value: "cosine", label: { zh: "餘弦 Cosine", en: "Cosine" }, group: "三角函數 Trigonometric" },
          { value: "tangent", label: { zh: "正切 Tangent", en: "Tangent" }, group: "三角函數 Trigonometric" },
        ],
      },
    ],
    outputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" },
      { key: "value", label: { zh: "數值", en: "Value" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins, node) {
        const op = node.params.operation || "add";
        const a = `(${ins.vector1})`;
        const b = `(${ins.vector2})`;
        const c = `(${ins.vector3})`;
        const scale = `(${ins.scale})`;
        const vecOps = {
          add: `${a} + ${b}`,
          subtract: `${a} - ${b}`,
          multiply: `${a} * ${b}`,
          divide: `bml_safeDivVec3(${a}, ${b})`,
          multiply_add: `${a} * ${b} + ${c}`,
          cross: `cross(${a}, ${b})`,
          project: `bml_projectVec3(${a}, ${b})`,
          reflect: `reflect(${a}, normalize(${b}))`,
          refract: `refract(normalize(${a}), normalize(${b}), ${scale})`,
          faceforward: `faceforward(${a}, ${b}, ${c})`,
          scale: `${a} * ${scale}`,
          normalize: `normalize(${a})`,
          absolute: `abs(${a})`,
          minimum: `min(${a}, ${b})`,
          maximum: `max(${a}, ${b})`,
          floor: `floor(${a})`,
          ceil: `ceil(${a})`,
          fraction: `fract(${a})`,
          modulo: `bml_safeModVec3(${a}, ${b})`,
          wrap: `bml_wrapVec3(${a}, ${b}, ${c})`,
          snap: `bml_snapVec3(${a}, ${b})`,
          sine: `sin(${a})`,
          cosine: `cos(${a})`,
          tangent: `tan(${a})`,
        };
        const valOps = {
          dot: `dot(${a}, ${b})`,
          distance: `distance(${a}, ${b})`,
          length: `length(${a})`,
        };
        const v = ctx.freshVar("vm");
        const f = ctx.freshVar("vmf");
        if (valOps[op]) {
          ctx.line(`float ${f} = ${valOps[op]};`);
          ctx.line(`vec3 ${v} = vec3(${f});`);
        } else {
          ctx.line(`vec3 ${v} = ${vecOps[op] || vecOps.add};`);
          ctx.line(`float ${f} = length(${v});`);
        }
        return { vector: v, value: f };
      },
    },
  },
  {
    id: "vector_rotate",
    category: "vector",
    name: { zh: "向量旋轉", en: "Vector Rotate" },
    summary: { zh: "把一個向量繞著指定的中心點與軸旋轉。", en: "Rotates a vector around a chosen center and axis." },
    docBeginner: {
      zh: "跟 Mapping 的旋轉類似，但更單純：只做旋轉，並且可以指定旋轉的軸方向（不是固定 X/Y/Z 依序旋轉）。",
      en: "Similar to Mapping's rotation, but simpler: it only rotates, and lets you pick any custom axis (not a fixed X→Y→Z order).",
    },
    docPro: {
      zh: "類型（Type）現在有 5 種，跟 Blender 一致：軸角（Axis Angle，繞任意軸轉指定角度，用 Rodrigues 旋轉公式）、X／Y／Z 軸（固定繞該軸轉，等於軸角模式把 Axis 鎖死成該軸）、歐拉 XYZ（Euler XYZ，改用一個三軸角度向量，依 X→Y→Z 順序疊加旋轉，跟 Mapping 節點的 Rotation 用同一套公式）。",
      en: "Type now has 5 options matching Blender: Axis Angle (rotate by an angle around any axis, via Rodrigues' rotation formula), X/Y/Z Axis (fixed rotation around that axis — equivalent to Axis Angle with Axis locked to that direction), and Euler XYZ (uses a 3-axis rotation vector instead, applied in X→Y→Z order — the same formula as the Mapping node's Rotation).",
    },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: "UV" },
      { key: "center", label: { zh: "中心", en: "Center" }, type: "vector", default: [0, 0, 0] },
      { key: "axis", label: { zh: "軸", en: "Axis" }, type: "vector", default: [0, 0, 1] },
      { key: "angle", label: { zh: "角度(度)", en: "Angle (deg)" }, type: "float", default: 0, min: -360, max: 360, step: 1 },
      { key: "rotation", label: { zh: "歐拉角(度)", en: "Rotation (deg)" }, type: "vector", default: [0, 0, 0] },
    ],
    settings: [
      {
        key: "rotationType",
        uiType: "select",
        label: { zh: "類型", en: "Type" },
        default: "axis",
        options: [
          { value: "axis", label: { zh: "軸角 Axis Angle", en: "Axis Angle" } },
          { value: "x", label: { zh: "X 軸", en: "X Axis" } },
          { value: "y", label: { zh: "Y 軸", en: "Y Axis" } },
          { value: "z", label: { zh: "Z 軸", en: "Z Axis" } },
          { value: "euler_xyz", label: { zh: "歐拉 XYZ Euler XYZ", en: "Euler XYZ" } },
        ],
      },
    ],
    outputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" }],
    glsl: {
      emit(ctx, ins, node) {
        const type = node.params.rotationType || "axis";
        const v = ctx.freshVar("rot");
        const local = `((${ins.vector}) - (${ins.center}))`;
        if (type === "x") {
          ctx.line(`vec3 ${v} = bml_rotateAxis(${local}, vec3(1.0, 0.0, 0.0), ${ins.angle}) + (${ins.center});`);
        } else if (type === "y") {
          ctx.line(`vec3 ${v} = bml_rotateAxis(${local}, vec3(0.0, 1.0, 0.0), ${ins.angle}) + (${ins.center});`);
        } else if (type === "z") {
          ctx.line(`vec3 ${v} = bml_rotateAxis(${local}, vec3(0.0, 0.0, 1.0), ${ins.angle}) + (${ins.center});`);
        } else if (type === "euler_xyz") {
          ctx.line(`vec3 ${v} = bml_rotateEuler(${local}, ${ins.rotation}) + (${ins.center});`);
        } else {
          ctx.line(`vec3 ${v} = bml_rotateAxis(${local}, ${ins.axis}, ${ins.angle}) + (${ins.center});`);
        }
        return { vector: v };
      },
    },
  },
  {
    id: "vector_normal_map",
    category: "vector",
    name: { zh: "法線貼圖", en: "Normal Map" },
    summary: { zh: "讀取一張切線空間法線貼圖，做出比 Bump 更精細的凹凸細節。", en: "Reads a tangent-space normal map texture for finer bump detail than Bump alone." },
    docBeginner: { zh: "通常接在 Image Texture（色彩空間設為 Non-Color）後面，貼圖上的紫藍色其實是編碼過的法線方向，能表現比單純灰階高度更精細的凹凸感。", en: "Usually placed after an Image Texture (with color space set to Non-Color). The purple-blue image is actually encoded normal directions, giving finer detail than a plain grayscale height." },
    docPro: { zh: "正規做法需要模型預先算好的切線（Tangent）/副切線（Bitangent）頂點屬性；本沙盒改用跟 Bump 節點同一招的螢幕空間導數技巧（cotangent frame，依 dFdx/dFdy(位置) 與 dFdx/dFdy(UV) 現算切線基底），不需要額外的頂點資料就能把切線空間法線貼圖轉到正確方向，效果跟 Blender 一致，實作細節不同。", en: "The standard approach needs precomputed tangent/bitangent vertex attributes. This sandbox instead reuses the Bump node's screen-space derivative trick (a cotangent frame built from dFdx/dFdy of position and UV) to orient the tangent-space normal map correctly without extra vertex data — the effect matches Blender, though the implementation differs." },
    supported: true,
    inputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [0.5, 0.5, 1, 1] },
      { key: "strength", label: { zh: "強度", en: "Strength" }, type: "float", default: 1, min: 0, max: 5 },
    ],
    outputs: [{ key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("nmap");
        ctx.line(`vec3 ${v} = bml_normalMap((${ins.color}).rgb, ${ins.strength}, normalize(normal));`);
        return { normal: v };
      },
    },
  },
  {
    id: "vector_displacement",
    category: "vector",
    name: { zh: "位移", en: "Displacement" },
    summary: { zh: "真正依高度值改變物體的幾何形狀（而不只是光影假象）。", en: "Actually changes the object's geometry based on a height value (not just faked lighting)." },
    docBeginner: { zh: "跟 Bump 的差別：Displacement 會真的把頂點往外推，讓輪廓也跟著改變，代價是需要夠密的網格細分。", en: "Unlike Bump, Displacement actually pushes vertices outward, so the silhouette changes too — at the cost of needing a dense enough mesh subdivision." },
    docPro: { zh: "本沙盒新增了一條獨立的「頂點著色器編譯通道」，接在 Material Output 的 Displacement 插槽時，能真的在頂點著色器把 Height 換算成沿法線方向的位移、移動頂點（不再只是假的光影）。這條通道只支援不需要 Fragment 端資料的節點（Math／Vector Math／Mapping／程序化紋理等），Bump／Fresnel 等節點不能接在這裡。本沙盒的預覽網格（球體/環面細分較高、方塊/平面較低）沒有讓使用者自訂細分數，高頻率的位移在方塊上可能會看起來比較塊狀。", en: "This sandbox added a separate 'vertex shader compile pass' — when wired into Material Output's Displacement socket, Height genuinely offsets vertices along the normal in the vertex shader (not just faked lighting anymore). This pass only supports nodes that don't need fragment-only data (Math/Vector Math/Mapping/procedural textures, etc.) — Bump/Fresnel and similar can't be used here. This sandbox's preview meshes have fixed subdivision (sphere/torus are fairly dense, cube/plane less so) with no user control, so high-frequency displacement can look blocky on the cube." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "height", label: { zh: "高度", en: "Height" }, type: "float", default: 0, min: 0, max: 1 },
      { key: "midlevel", label: { zh: "中間值", en: "Midlevel" }, type: "float", default: 0.5, min: 0, max: 1 },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 1, min: 0, max: 5 },
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: "NORMAL" },
    ],
    outputs: [{ key: "displacement", label: { zh: "位移", en: "Displacement" }, type: "vector" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("disp");
        ctx.line(`vec3 ${v} = normalize(${ins.normal}) * ((${ins.height}) - (${ins.midlevel})) * (${ins.scale});`);
        return { displacement: v };
      },
    },
  },
  {
    id: "vector_displacement_vec",
    category: "vector",
    name: { zh: "向量位移", en: "Vector Displacement" },
    summary: { zh: "用一張向量貼圖描述每個頂點該往哪個方向、移動多少。", en: "Uses a vector map to describe exactly which direction and how far each point should move." },
    docBeginner: { zh: "比 Displacement 更自由：可以做出往任意方向的位移（不只是往外凸），常搭配雕刻軟體烘焙出來的向量位移貼圖使用。", en: "More flexible than Displacement — it can push in any direction, not just outward. Often paired with vector displacement maps baked from sculpting software." },
    docPro: { zh: "跟 Displacement 共用同一條頂點著色器編譯通道。跟 Blender 的差異：Blender 預設把向量貼圖解讀成切線空間（需要切線基底才能正確轉換方向）；本沙盒直接把向量當作物體座標系統下的位移方向使用，不做切線空間轉換，效果的『大小/整體感覺』一致，但貼圖畫的方向定義跟 Blender 不完全相同。", en: "Shares the same vertex-shader compile pass as Displacement. Difference from Blender: Blender defaults to interpreting the vector map in tangent space (needs a tangent basis to convert correctly). This sandbox treats the vector directly as an object-space displacement direction, no tangent-space conversion — the overall scale/feel is consistent, but the map's direction convention doesn't exactly match Blender's." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] },
      { key: "scale", label: { zh: "縮放", en: "Scale" }, type: "float", default: 1, min: 0, max: 5 },
    ],
    outputs: [{ key: "displacement", label: { zh: "位移", en: "Displacement" }, type: "vector" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("vdisp");
        ctx.line(`vec3 ${v} = (${ins.vector}) * (${ins.scale});`);
        return { displacement: v };
      },
    },
  },
  {
    id: "vector_curves",
    category: "vector",
    name: { zh: "向量曲線", en: "Vector Curves" },
    summary: { zh: "用可拖拉的曲線分別調整向量的 X/Y/Z 分量。", en: "Uses a draggable curve to remap a vector's X/Y/Z components independently." },
    docBeginner: { zh: "概念上跟 RGB Curves 一樣，只是套用在向量（例如法線）上而不是顏色上。", en: "Conceptually the same as RGB Curves, but applied to a vector (like a normal) instead of a color." },
    docPro: { zh: "已補上可拖拉控制點的曲線編輯器，曲線本身用平滑的 Cardinal（Catmull-Rom 風格）多項式逐段穿過每個控制點，跟 Blender 曲線部件的預設平滑手把效果一致（不是逐段直線）。X/Y/Z 現在各自有獨立曲線可調（跟 Blender 一致——Blender 原始碼 `node_shader_init_curve_vec` 本來就只有 3 條曲線，不像 RGB Curves 多一條「C」合成曲線）。曲線的定義域固定 -1 到 1（對應法線分量的常見範圍），輸入向量分量會先夾在這個範圍內再查表。", en: "Now has a draggable curve editor; the curve itself is a smooth Cardinal (Catmull-Rom-style) polynomial passing through every control point, matching Blender's default smooth handle look (not a piecewise-straight line). X/Y/Z now each have their own independent curve, matching Blender (Blender's own source, `node_shader_init_curve_vec`, only ever has 3 curves — unlike RGB Curves it has no extra 'C' combined curve). The curve's domain is fixed to -1..1 (a common range for normal components); each input component is clamped into that range before lookup." },
    supported: true,
    vertexSafe: true,
    inputs: [
      { key: "fac", label: { zh: "Fac", en: "Fac" }, type: "float", default: 1, min: 0, max: 1 },
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] },
    ],
    settings: [
      {
        key: "points",
        uiType: "curve",
        label: { zh: "X 曲線", en: "X Curve" },
        domain: { xMin: -1, xMax: 1, yMin: -1, yMax: 1 },
        default: [{ x: -1, y: -1 }, { x: 1, y: 1 }],
      },
      {
        key: "pointsY",
        uiType: "curve",
        label: { zh: "Y 曲線", en: "Y Curve" },
        domain: { xMin: -1, xMax: 1, yMin: -1, yMax: 1 },
        default: [{ x: -1, y: -1 }, { x: 1, y: 1 }],
      },
      {
        key: "pointsZ",
        uiType: "curve",
        label: { zh: "Z 曲線", en: "Z Curve" },
        domain: { xMin: -1, xMax: 1, yMin: -1, yMax: 1 },
        default: [{ x: -1, y: -1 }, { x: 1, y: 1 }],
      },
    ],
    outputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" }],
    glsl: {
      emit(ctx, ins, node) {
        const v = ctx.freshVar("vcurve");
        const cx = buildCurveExprGLSL(node.params.points, `clamp((${ins.vector}).x, -1.0, 1.0)`);
        const cy = buildCurveExprGLSL(node.params.pointsY, `clamp((${ins.vector}).y, -1.0, 1.0)`);
        const cz = buildCurveExprGLSL(node.params.pointsZ, `clamp((${ins.vector}).z, -1.0, 1.0)`);
        ctx.line(`vec3 ${v} = mix((${ins.vector}), vec3(${cx}, ${cy}, ${cz}), clamp(${ins.fac}, 0.0, 1.0));`);
        return { vector: v };
      },
    },
  },
  {
    id: "vector_transform",
    category: "vector",
    name: { zh: "向量變換", en: "Vector Transform" },
    summary: { zh: "把向量在世界／物體／攝影機等不同座標空間之間轉換。", en: "Converts a vector between World/Object/Camera coordinate spaces." },
    docBeginner: { zh: "同一個向量（例如法線）在不同座標系統下數值不一樣，這個節點負責在它們之間換算。", en: "The same vector (like a normal) has different values depending on the coordinate system. This node converts between them." },
    docPro: { zh: "Three.js 本來就會給每個材質內建 modelMatrix（Object→World）與 viewMatrix（World→Camera）這兩個 uniform，本沙盒直接借用（必要時用 WebGL2/GLSL ES 3.00 內建的 inverse() 算反向），補上了這個節點。跟 Blender 的差異：Blender 用 Type 下拉選單區分 Point/Vector/Normal（Point 會加位移、Normal 用反轉置矩陣處理非等比縮放）；本沙盒的預覽物件沒有可調整的物體變換（不能縮放/位移），固定當作純方向向量處理（不含位移），在等比縮放下三種 Type 的結果是一致的，先不特別區分。", en: "Three.js already provides every material with modelMatrix (Object→World) and viewMatrix (World→Camera) uniforms; this sandbox uses them directly (falling back to WebGL2/GLSL ES 3.00's built-in inverse() where needed) to implement this node. Difference from Blender: Blender has a Type dropdown for Point/Vector/Normal (Point adds translation, Normal uses the inverse-transpose matrix for non-uniform scale). This sandbox's preview objects have no adjustable transform (no scale/translation), so it's always treated as a pure direction (no translation) — under uniform scale all three Types give the same result anyway, so the distinction is skipped for now." },
    supported: true,
    vertexSafe: true,
    inputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector", default: [0, 0, 0] }],
    settings: [
      {
        key: "from",
        uiType: "select",
        label: { zh: "來源空間", en: "From" },
        default: "world",
        options: [
          { value: "object", label: { zh: "物體 Object", en: "Object" } },
          { value: "world", label: { zh: "世界 World", en: "World" } },
          { value: "camera", label: { zh: "攝影機 Camera", en: "Camera" } },
        ],
      },
      {
        key: "to",
        uiType: "select",
        label: { zh: "目標空間", en: "To" },
        default: "object",
        options: [
          { value: "object", label: { zh: "物體 Object", en: "Object" } },
          { value: "world", label: { zh: "世界 World", en: "World" } },
          { value: "camera", label: { zh: "攝影機 Camera", en: "Camera" } },
        ],
      },
    ],
    outputs: [{ key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" }],
    glsl: {
      emit(ctx, ins, node) {
        const from = node.params.from || "world";
        const to = node.params.to || "object";
        let expr = `(${ins.vector})`;
        if (from !== to) {
          if (from === "object") expr = `(mat3(modelMatrix) * ${expr})`;
          else if (from === "camera") expr = `(inverse(mat3(viewMatrix)) * ${expr})`;
          if (to === "object") expr = `(inverse(mat3(modelMatrix)) * ${expr})`;
          else if (to === "camera") expr = `(mat3(viewMatrix) * ${expr})`;
        }
        const v = ctx.freshVar("vtransform");
        ctx.line(`vec3 ${v} = ${expr};`);
        return { vector: v };
      },
    },
  },
  {
    id: "vector_normal",
    category: "vector",
    name: { zh: "法線", en: "Normal" },
    summary: { zh: "手動指定一個方向當作法線，並輸出跟原法線的夾角。", en: "Manually specify a direction to use as a normal, and output its angle against the original normal." },
    docBeginner: { zh: "節點上有一個小球可以直接拖拉方向；Dot 輸出兩個法線的夾角餘弦值，常用來做簡易的方向性效果。", en: "The node has a small ball widget you can drag to set a direction. Dot outputs the cosine of the angle between the two normals — useful for simple directional effects." },
    docPro: { zh: "Blender 用一個可拖拉的 3D 方向球控制元件；本沙盒的節點卡片目前只有數值輸入框，改用跟 Vector Math／Combine XYZ 一致的 X/Y/Z 數字欄位讓使用者輸入方向，效果相同、只是操作手感不像球體那麼直覺。", en: "Blender uses a draggable 3D direction-ball widget; this sandbox's node cards only have numeric inputs, so it uses the same X/Y/Z number fields as Vector Math/Combine XYZ instead. The effect is identical — just less tactile than dragging a ball." },
    supported: true,
    inputs: [{ key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector", default: [0, 0, 1] }],
    outputs: [
      { key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector" },
      { key: "dot", label: { zh: "Dot", en: "Dot" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins) {
        const n = ctx.freshVar("vnorm");
        ctx.line(`vec3 ${n} = normalize(${ins.normal});`);
        const d = ctx.freshVar("vdot");
        ctx.line(`float ${d} = dot(${n}, normalize(normal));`);
        return { normal: n, dot: d };
      },
    },
  },
];
