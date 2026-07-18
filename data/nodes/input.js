import { literalExpr } from "../../js/core/socketTypes.js";

// Input 分類：提供座標、顏色、數值等輸入來源的節點。
export default [
  {
    id: "input_texture_coordinate",
    category: "input",
    name: { zh: "紋理座標", en: "Texture Coordinate" },
    summary: { zh: "提供好幾種不同的座標系統，接到 Texture 節點的 Vector 輸入控制貼圖怎麼貼。", en: "Provides several coordinate systems to feed into a Texture node's Vector input." },
    docBeginner: {
      zh: "紋理節點如果不接 Vector，預設就是用 UV。這個節點讓你可以改用其他座標系統——最常用的是 Generated（不受 UV 影響、跟著物體形狀走）跟 Object（跟著物體本身、不受移動旋轉影響）。",
      en: "Texture nodes default to UV if Vector is left unconnected. This node lets you switch to other coordinate systems — most commonly Generated (follows the object's shape, ignores UV) and Object (follows the object itself, unaffected by its transform).",
    },
    docPro: {
      zh: "本沙盒的預覽物件沒有記錄各自獨立的 Generated/Object 座標資料，因此 Generated/Object/Window 這幾個輸出先近似等於 UV，只有 UV 與 Normal 是精確計算的；Reflection 用視角方向對法線做反射近似。",
      en: "This sandbox's preview meshes don't store separate Generated/Object coordinate data, so the Generated/Object/Window outputs are approximated as UV for now — only UV and Normal are computed exactly. Reflection approximates the view direction reflected off the normal.",
    },
    supported: true,
    inputs: [],
    outputs: [
      { key: "generated", label: { zh: "Generated", en: "Generated" }, type: "vector" },
      { key: "normal", label: { zh: "Normal", en: "Normal" }, type: "vector" },
      { key: "uv", label: { zh: "UV", en: "UV" }, type: "vector" },
      { key: "object", label: { zh: "Object", en: "Object" }, type: "vector" },
      { key: "camera", label: { zh: "Camera", en: "Camera" }, type: "vector" },
      { key: "window", label: { zh: "Window", en: "Window" }, type: "vector" },
      { key: "reflection", label: { zh: "Reflection", en: "Reflection" }, type: "vector" },
    ],
    glsl: {
      emit() {
        return {
          generated: "vec3(vUv, 0.0)",
          normal: "normalize(vNormal)",
          uv: "vec3(vUv, 0.0)",
          object: "vec3(vUv, 0.0)",
          camera: "normalize(vViewPosition)",
          window: "vec3(vUv, 0.0)",
          reflection: "reflect(-normalize(vViewPosition), normalize(vNormal))",
        };
      },
    },
  },
  {
    id: "input_uv_map",
    category: "input",
    name: { zh: "UV 貼圖", en: "UV Map" },
    summary: { zh: "指定要用物體身上哪一組 UV 貼圖座標。", en: "Selects which UV map on the object to use." },
    docBeginner: { zh: "當一個物體有多組 UV（例如一組給貼圖、一組給光照烘焙）時，用這個節點指定要用哪一組。", en: "When an object has multiple UV maps (e.g. one for texturing, one for baked lighting), use this node to pick which one." },
    docPro: { zh: "本沙盒的預覽物件只有一組內建 UV，因此這個節點固定輸出跟 Texture Coordinate 的 UV 相同的座標。", en: "This sandbox's preview meshes only have one built-in UV set, so this node always outputs the same coordinate as Texture Coordinate's UV." },
    supported: true,
    inputs: [],
    outputs: [{ key: "uv", label: { zh: "UV", en: "UV" }, type: "vector" }],
    glsl: {
      emit() {
        return { uv: "vec3(vUv, 0.0)" };
      },
    },
  },
  {
    id: "input_rgb",
    category: "input",
    name: { zh: "RGB", en: "RGB" },
    summary: { zh: "一個固定的顏色值，材質圖裡最基本的顏色來源。", en: "A fixed color value — the most basic color source in a material graph." },
    docBeginner: { zh: "點擊色塊選顏色，輸出就是這個顏色，可以接到任何顏色插槽。", en: "Click the swatch to pick a color; the output is exactly that color, ready to plug into any color socket." },
    docPro: { zh: "跟直接在某個節點的插槽上選色的差別在於：RGB 是獨立節點，同一個顏色值可以同時接到好幾個地方，之後改一次全部跟著變。", en: "Unlike picking a color directly on a socket, RGB is a standalone node — the same color value can feed multiple destinations, and changing it once updates them all." },
    supported: true,
    inputs: [],
    settings: [{ key: "color", uiType: "color", label: { zh: "顏色", en: "Color" }, default: [0.8, 0.8, 0.8, 1] }],
    outputs: [{ key: "color", label: { zh: "顏色", en: "Color" }, type: "color" }],
    glsl: {
      emit(ctx, ins, node) {
        return { color: literalExpr(node.params.color, "color") };
      },
    },
  },
  {
    id: "input_value",
    category: "input",
    name: { zh: "數值", en: "Value" },
    summary: { zh: "一個固定的數值，材質圖裡最基本的數值來源。", en: "A fixed number — the most basic value source in a material graph." },
    docBeginner: { zh: "輸出一個你自訂的數字，可以接到任何數值插槽，例如共用同一個 Roughness 數值給好幾個材質分支。", en: "Outputs a number you set — plug it into any float socket, e.g. to share one Roughness value across several material branches." },
    docPro: { zh: "把常用數值抽成一個獨立的 Value 節點，之後要整體調整時只需要改一個地方，是材質圖整理的常見技巧。", en: "Extracting a commonly-used number into its own Value node means you only need to change it in one place later — a common material-graph organization technique." },
    supported: true,
    inputs: [],
    settings: [{ key: "value", uiType: "float", label: { zh: "數值", en: "Value" }, default: 0.5 }],
    outputs: [{ key: "value", label: { zh: "數值", en: "Value" }, type: "float" }],
    glsl: {
      emit(ctx, ins, node) {
        return { value: literalExpr(node.params.value, "float") };
      },
    },
  },
  {
    id: "input_fresnel",
    category: "input",
    name: { zh: "菲涅爾", en: "Fresnel" },
    summary: { zh: "算出「表面正對鏡頭 vs 側面掠過」的比例，做出邊緣反光更強的效果。", en: "Computes how much a surface faces the camera vs. grazes it — used for stronger edge reflections." },
    docBeginner: {
      zh: "現實中幾乎所有材質都是「正面看較不反光、側邊掠視角度反光更強」，這就是菲涅爾效應（想想看池水正上方看得到底、斜看只看到反光）。把 Fresnel 接到 Mix Shader 的 Fac，就能做出這種邊緣增亮的效果。",
      en: "Almost every real material reflects less when viewed head-on and more at grazing angles — the Fresnel effect (think of looking straight down into a pool vs. across its surface). Wiring Fresnel into a Mix Shader's Fac creates this edge-brightening look.",
    },
    docPro: {
      zh: "IOR 插槽控制反光增強的強度曲線（數值越大，效果越明顯）。本沙盒用視角方向與『幾何法線』（未套用 Bump）計算，這是簡化：真實情況應該用套用 Bump 後的最終法線。",
      en: "The IOR socket controls how strong the edge effect is (higher = more pronounced). This sandbox computes it from the view direction and the geometric (pre-Bump) normal — a simplification; ideally it should use the final normal after Bump is applied.",
    },
    supported: true,
    inputs: [{ key: "ior", label: { zh: "IOR", en: "IOR" }, type: "float", default: 1.45, min: 1, max: 3, step: 0.01 }],
    outputs: [{ key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("fresnel");
        ctx.line(`float ${v} = bml_fresnel(normalize(vNormal), max(${ins.ior}, 1.001));`);
        return { fac: v };
      },
    },
  },
  {
    id: "input_layer_weight",
    category: "input",
    name: { zh: "層權重", en: "Layer Weight" },
    summary: { zh: "跟 Fresnel 類似，但多了更直覺的 Blend 滑桿，常用來疊加清漆層。", en: "Similar to Fresnel but with a more intuitive Blend slider — often used to layer a clearcoat." },
    docBeginner: {
      zh: "Facing 輸出「正對鏡頭」的比例（跟 Fresnel 相反方向），Fresnel 輸出跟 Fresnel 節點類似的邊緣反光比例。Blend 越大，過渡效果越集中在邊緣。",
      en: "Facing outputs how much the surface faces the camera (the inverse direction from Fresnel), Fresnel outputs an edge-reflection ratio similar to the Fresnel node. Higher Blend concentrates the transition more at the edges.",
    },
    docPro: {
      zh: "常見用法：Mix Shader 的 Fac 接 Layer Weight 的 Fresnel，疊一層清漆/水膜光澤在原本材質上。實作同樣使用未套用 Bump 的幾何法線，屬於簡化。",
      en: "Common use: wire Layer Weight's Fresnel into a Mix Shader's Fac to layer a clearcoat/water-film gloss on top of a base material. Also uses the geometric (pre-Bump) normal — a simplification.",
    },
    supported: true,
    inputs: [{ key: "blend", label: { zh: "Blend", en: "Blend" }, type: "float", default: 0.5, min: 0, max: 1, step: 0.01 }],
    outputs: [
      { key: "fresnel", label: { zh: "Fresnel", en: "Fresnel" }, type: "float" },
      { key: "facing", label: { zh: "Facing", en: "Facing" }, type: "float" },
    ],
    glsl: {
      emit(ctx, ins) {
        const fresnel = ctx.freshVar("lwf");
        ctx.line(`float ${fresnel} = bml_fresnel(normalize(vNormal), mix(1.01, 5.0, clamp(${ins.blend}, 0.0, 1.0)));`);
        const facing = ctx.freshVar("lwc");
        ctx.line(`float ${facing} = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));`);
        return { fresnel, facing };
      },
    },
  },
  {
    id: "input_object_info",
    category: "input",
    name: { zh: "物體資訊", en: "Object Info" },
    summary: { zh: "提供物體的位置、顏色、隨機值等場景層級資訊。", en: "Provides object-level scene info: location, color, a random per-object value." },
    docBeginner: { zh: "Random 輸出最常用：可以讓同一份材質在套用到不同物體時，各自呈現一點點隨機變化（例如隨機挑選磚塊顏色）。", en: "The Random output is most useful: it lets the same material look slightly different on each object it's applied to (e.g. randomly picking a brick tone)." },
    docPro: { zh: "需要場景中有多個獨立物體的資訊，本沙盒只預覽單一物體，沒有『物體與物體之間比較』的意義，先列文件。", en: "Requires info about multiple distinct scene objects. This sandbox only previews a single object, so there's nothing to compare 'between objects'. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "location", label: { zh: "位置", en: "Location" }, type: "vector" },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "random", label: { zh: "隨機", en: "Random" }, type: "float" },
    ],
  },
  {
    id: "input_geometry",
    category: "input",
    name: { zh: "幾何資料", en: "Geometry" },
    summary: { zh: "提供表面的位置、法線、切線等幾何資料。", en: "Provides surface position, normal, tangent, and other geometric data." },
    docBeginner: { zh: "Position、Normal 是最常用的兩個輸出，效果跟 Texture Coordinate 的 Object/Normal 類似。", en: "Position and Normal are the two most common outputs, similar in effect to Texture Coordinate's Object/Normal." },
    docPro: { zh: "Pointiness（邊緣/凹角偵測）、Random Per Island 等進階輸出需要網格拓樸分析，本沙盒的即時預覽管線沒有這一層資料，先整個節點列為文件參考；Position/Normal 可透過 Texture Coordinate 節點取得類似效果。", en: "Advanced outputs like Pointiness (edge/crevice detection) and Random Per Island need mesh topology analysis unavailable in this live-preview pipeline. The whole node is documented for reference; Position/Normal are available via the Texture Coordinate node instead." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "position", label: { zh: "Position", en: "Position" }, type: "vector" },
      { key: "normal", label: { zh: "Normal", en: "Normal" }, type: "vector" },
      { key: "tangent", label: { zh: "Tangent", en: "Tangent" }, type: "vector" },
      { key: "incoming", label: { zh: "Incoming", en: "Incoming" }, type: "vector" },
      { key: "pointiness", label: { zh: "Pointiness", en: "Pointiness" }, type: "float" },
    ],
  },
  {
    id: "input_camera_data",
    category: "input",
    name: { zh: "攝影機資訊", en: "Camera Data" },
    summary: { zh: "提供跟目前攝影機相關的向量與距離資訊。", en: "Provides vectors and distances relative to the current camera." },
    docBeginner: { zh: "View Z Depth 常用來做景深或距離霧化效果——離攝影機越遠，效果越明顯。", en: "View Z Depth is commonly used for depth-of-field or distance fog — the further from the camera, the stronger the effect." },
    docPro: { zh: "本沙盒的沙盒攝影機會隨使用者拖曳旋轉/縮放即時改變，這類節點在教學情境下容易讓人誤以為『材質本身變了』，先列文件、暫不即時預覽。", en: "This sandbox's camera changes live as the user drags to orbit/zoom, which could make learners mistakenly think 'the material itself changed'. Documentation only for now." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "viewVector", label: { zh: "View Vector", en: "View Vector" }, type: "vector" },
      { key: "viewZDepth", label: { zh: "View Z Depth", en: "View Z Depth" }, type: "float" },
      { key: "viewDistance", label: { zh: "View Distance", en: "View Distance" }, type: "float" },
    ],
  },
  {
    id: "input_light_path",
    category: "input",
    name: { zh: "光程", en: "Light Path" },
    summary: { zh: "判斷目前這道光線是反射、折射、陰影等哪一種路徑，只在路徑追蹤渲染器中有意義。", en: "Detects whether the current ray is a reflection, refraction, shadow ray, etc. — only meaningful in a path-traced renderer." },
    docBeginner: { zh: "常用來讓材質『只在被攝影機直接看到時』顯示某個效果、但反射中不顯示（例如讓某些效果不在鏡子倒影裡出現）。", en: "Often used to make a material show an effect only when directly seen by the camera, but not in reflections (e.g. hiding certain effects from mirror reflections)." },
    docPro: { zh: "這個節點的意義建立在『逐光線追蹤』的渲染架構上；本沙盒用的是即時光柵化（rasterization）預覽，沒有『這是第幾次反彈的光線』這個概念，先列文件。", en: "This node's meaning is built on a per-ray path-tracing architecture. This sandbox uses real-time rasterization, which has no concept of 'which bounce this ray is'. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "isCameraRay", label: { zh: "Is Camera Ray", en: "Is Camera Ray" }, type: "float" },
      { key: "isShadowRay", label: { zh: "Is Shadow Ray", en: "Is Shadow Ray" }, type: "float" },
      { key: "isReflectionRay", label: { zh: "Is Reflection Ray", en: "Is Reflection Ray" }, type: "float" },
    ],
  },
  {
    id: "input_ambient_occlusion",
    category: "input",
    name: { zh: "環境光遮蔽", en: "Ambient Occlusion" },
    summary: { zh: "偵測凹角、縫隙等光線較難照到的區域，常用來加深髒污/陰影。", en: "Detects crevices and corners that light struggles to reach — often used to darken grime or contact shadows." },
    docBeginner: { zh: "常接到 Mix Color 或 Color Ramp，讓模型凹陷處自然變暗，增加真實感。", en: "Often fed into Mix Color or Color Ramp to naturally darken a model's recesses, adding realism." },
    docPro: { zh: "正確運算需要對周遭幾何做多方向取樣（螢幕空間 SSAO 或逐光線取樣），計算量較大；本沙盒的即時預覽管線目前沒有這一道多重取樣步驟，先列文件。（曾嘗試用螢幕空間法線曲率（dFdx/dFdy）近似邊角遮蔽，實測即使在方塊的銳利邊緣上，效果也被抗鋸齒/多重取樣稀釋到肉眼幾乎看不出來，判斷不值得為了一個看不見的效果新增節點支援，故維持文件狀態。）", en: "Correct computation needs multi-directional sampling of surrounding geometry (screen-space SSAO or per-ray sampling) — fairly expensive. This live-preview pipeline doesn't have that multi-sample pass yet. Documentation only. (A screen-space normal-curvature approximation via dFdx/dFdy was tried and tested — even on a cube's sharp edges, the effect got diluted by anti-aliasing/MSAA to the point of being visually imperceptible, so it wasn't judged worth shipping for an effect nobody could actually see.)" },
    supported: false,
    inputs: [
      { key: "distance", label: { zh: "距離", en: "Distance" }, type: "float", default: 1 },
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color", default: [1, 1, 1, 1] },
    ],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "ao", label: { zh: "AO", en: "AO" }, type: "float" },
    ],
  },
  {
    id: "input_bevel",
    category: "input",
    name: { zh: "倒角", en: "Bevel" },
    summary: { zh: "把銳利的邊緣算出一個柔化後的法線，模擬真實世界很少有完全銳利邊角的樣子。", en: "Computes a softened normal along sharp edges, simulating how few real-world edges are perfectly sharp." },
    docBeginner: { zh: "現實中的金屬、塑膠邊緣通常會因為加工或磨損而有一點點小圓角，Bevel 節點能在不修改模型的情況下，讓邊緣反光看起來更真實。", en: "Real-world metal and plastic edges usually have a tiny roundover from manufacturing or wear. The Bevel node makes edge highlights look more realistic without modifying the actual mesh." },
    docPro: { zh: "正確運算需要取樣周遭幾何頂點法線做加權平均，本沙盒的即時預覽管線目前沒有這一層網格拓樸資料，先列文件。", en: "Correct computation needs sampling and averaging neighboring vertex normals — this live-preview pipeline doesn't have that mesh topology data yet. Documentation only." },
    supported: false,
    inputs: [{ key: "radius", label: { zh: "半徑", en: "Radius" }, type: "float", default: 0.05, min: 0, max: 1 }],
    outputs: [{ key: "normal", label: { zh: "法線", en: "Normal" }, type: "vector" }],
  },
  {
    id: "input_wireframe",
    category: "input",
    name: { zh: "線框", en: "Wireframe" },
    summary: { zh: "偵測目前位置是不是靠近多邊形的邊線，做出線框顯示效果。", en: "Detects whether the current point is near a polygon edge, for a wireframe-overlay look." },
    docBeginner: { zh: "常用來做『技術風格』或全息投影效果，讓模型的三角面線條發亮。", en: "Often used for a 'tech' or hologram look, making the model's polygon edges glow." },
    docPro: { zh: "本沙盒的預覽幾何體已經改成 non-indexed、每個三角形附帶一組重心座標頂點屬性（vertex attribute），靠螢幕空間導數（fwidth）判斷片元離哪條邊比較近，不需要真的做網格鄰接分析。跟 Blender 的差異：Blender 的線框寬度是固定的螢幕像素寬，本沙盒的 Size 是相對三角形大小的比例值，同一個 Size 在不同細分程度的網格上看起來粗細會不太一樣。", en: "This sandbox's preview meshes are now non-indexed with a per-triangle barycentric-coordinate vertex attribute, using screen-space derivatives (fwidth) to tell how close a fragment is to an edge — no real mesh adjacency analysis needed. Difference from Blender: Blender's line width is a fixed screen-pixel width, while this sandbox's Size is relative to triangle size, so the same Size can look thicker or thinner depending on mesh subdivision." },
    supported: true,
    needsBarycentric: true,
    inputs: [{ key: "size", label: { zh: "粗細", en: "Size" }, type: "float", default: 0.01, min: 0, max: 0.5 }],
    outputs: [{ key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" }],
    glsl: {
      emit(ctx, ins) {
        const v = ctx.freshVar("wire");
        ctx.line(`float ${v} = bml_wireframeFactor(vBmlBarycentric, ${ins.size});`);
        return { fac: v };
      },
    },
  },
  {
    id: "input_attribute",
    category: "input",
    name: { zh: "屬性", en: "Attribute" },
    summary: { zh: "讀取物體上自訂的頂點/面/實例屬性資料。", en: "Reads custom vertex/face/instance attribute data stored on the object." },
    docBeginner: { zh: "適合進階使用者：當你在 Geometry Nodes 或頂點群組裡存了自訂資料（例如每個頂點的濕度值），可以用這個節點在材質裡讀出來。", en: "For advanced users: if you've stored custom data via Geometry Nodes or vertex groups (like a per-vertex wetness value), this node reads it into your material." },
    docPro: { zh: "需要對應到本沙盒沒有的自訂頂點屬性資料，先列文件參考。", en: "Requires custom vertex attribute data that this sandbox doesn't have. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "vector", label: { zh: "向量", en: "Vector" }, type: "vector" },
      { key: "fac", label: { zh: "係數", en: "Fac" }, type: "float" },
    ],
  },
  {
    id: "input_point_info",
    category: "input",
    name: { zh: "點資訊", en: "Point Info" },
    summary: { zh: "提供點雲/髮絲等以「點」為單位的位置、半徑、隨機值。", en: "Provides per-point position, radius, and random value for point clouds or hair strands." },
    docBeginner: { zh: "只在點雲物件或毛髮系統的材質上有意義，一般網格物體用不到。", en: "Only meaningful on point-cloud objects or hair systems — not applicable to regular mesh objects." },
    docPro: { zh: "本沙盒的預覽物件都是一般網格（球體/方塊等），沒有點雲資料，先列文件。", en: "This sandbox's preview meshes are all regular geometry (sphere/cube/etc.) with no point-cloud data. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "position", label: { zh: "Position", en: "Position" }, type: "vector" },
      { key: "radius", label: { zh: "Radius", en: "Radius" }, type: "float" },
      { key: "random", label: { zh: "Random", en: "Random" }, type: "float" },
    ],
  },
  {
    id: "input_particle_info",
    category: "input",
    name: { zh: "粒子資訊", en: "Particle Info" },
    summary: { zh: "提供粒子系統裡每顆粒子的年齡、位置、速度等資料。", en: "Provides per-particle age, location, velocity, and other data from a particle system." },
    docBeginner: { zh: "常用來讓粒子（例如落葉、火花）依存活時間改變顏色或透明度。", en: "Often used to change a particle's (e.g. falling leaves, sparks) color or transparency based on how long it's existed." },
    docPro: { zh: "需要場景中有粒子系統模擬資料，本沙盒沒有粒子系統，先列文件。", en: "Requires particle system simulation data, which this sandbox doesn't have. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "age", label: { zh: "Age", en: "Age" }, type: "float" },
      { key: "location", label: { zh: "Location", en: "Location" }, type: "vector" },
      { key: "size", label: { zh: "Size", en: "Size" }, type: "float" },
    ],
  },
  {
    id: "input_curves_info",
    category: "input",
    name: { zh: "曲線資訊", en: "Curves Info" },
    summary: { zh: "提供髮絲/曲線物件的長度、切線、內插參數等資料。", en: "Provides length, tangent, and interpolation parameters for hair/curve objects." },
    docBeginner: { zh: "只用在毛髮或曲線類物件的材質上。", en: "Used only on hair or curve-type object materials." },
    docPro: { zh: "本沙盒的預覽物件沒有曲線幾何資料，先列文件。", en: "This sandbox's preview meshes have no curve geometry data. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "tangent", label: { zh: "Tangent", en: "Tangent" }, type: "vector" },
      { key: "length", label: { zh: "Length", en: "Length" }, type: "float" },
    ],
  },
  {
    id: "input_volume_info",
    category: "input",
    name: { zh: "體積資訊", en: "Volume Info" },
    summary: { zh: "提供體積資料（例如煙霧模擬）裡的密度、顏色、溫度。", en: "Provides density, color, and temperature from volumetric data like a smoke simulation." },
    docBeginner: { zh: "只用在體積材質（Volume 插槽）上，一般表面材質用不到。", en: "Only used on volume materials (the Volume socket) — not applicable to regular surface materials." },
    docPro: { zh: "體積渲染超出本沙盒即時預覽管線的能力範圍，先列文件。", en: "Volume rendering is beyond this sandbox's live-preview pipeline capability. Documentation only." },
    supported: false,
    inputs: [],
    outputs: [
      { key: "color", label: { zh: "顏色", en: "Color" }, type: "color" },
      { key: "density", label: { zh: "Density", en: "Density" }, type: "float" },
      { key: "temperature", label: { zh: "Temperature", en: "Temperature" }, type: "float" },
    ],
  },
];
