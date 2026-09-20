import { anyNodeParamMatches, hasLinkBetweenTypes } from "../js/core/tutorialChecks.js";
import { Graph } from "../js/core/graphModel.js";

const output = { id: "a_out", typeId: "output_material", x: 900, y: 180, params: {} };

const coreChallenges = [
  {
    id: "challenge-polished-metal",
    kind: "challenge",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "拋光金屬：只靠 Principled 完成", en: "Polished Metal with Principled Only" },
    description: { zh: "把灰色塑膠調成真正的拋光金屬，不提供逐步答案。", en: "Turn gray plastic into polished metal without step-by-step instructions." },
    objective: { zh: "做出金屬度至少 0.9、粗糙度不超過 0.2，並正確連到材質輸出的材質。", en: "Create a material with Metallic ≥ 0.9, Roughness ≤ 0.2, connected to Material Output." },
    startGraph: {
      nodes: [output, { id: "a_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.35, 0.35, 0.35, 1], metallic: 0, roughness: 0.55 } }],
      links: [{ id: "a_l1", fromNode: "a_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    targetGraph: {
      nodes: [output, { id: "a_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.55, 0.57, 0.6, 1], metallic: 1, roughness: 0.12 } }],
      links: [{ id: "a_l1", fromNode: "a_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [
      { label: { zh: "原理化 BSDF 已接到材質輸出", en: "Principled BSDF reaches Material Output" }, test: (g) => hasLinkBetweenTypes(g, "shader_principled_bsdf", "bsdf", "output_material", "surface") },
      { label: { zh: "金屬度至少 0.9", en: "Metallic is at least 0.9" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "metallic", (v) => v >= 0.9) },
      { label: { zh: "粗糙度不超過 0.2", en: "Roughness is no more than 0.2" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "roughness", (v) => v <= 0.2) },
    ],
    hints: [
      { zh: "先想想金屬和塑膠最關鍵的差別是哪一個滑桿。", en: "Which single slider most directly separates metal from plastic?" },
      { zh: "把 Metallic 拉近 1，再處理高光是否夠銳利。", en: "Move Metallic close to 1, then decide whether the highlight is sharp enough." },
      { zh: "參考解法：Metallic = 1、Roughness 約 0.12。", en: "Reference: Metallic = 1 and Roughness around 0.12." },
    ],
  },
  {
    id: "challenge-time-pulse",
    kind: "challenge",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "時間脈衝：做出不會爆亮的循環發光", en: "Time Pulse Without Blown Highlights" },
    description: { zh: "把持續增加的時間轉成安全、可循環的發光強度。", en: "Turn ever-increasing time into a safe repeating emission pulse." },
    objective: { zh: "完成「場景時間 → Sine → 映射範圍 → 發光強度」並開啟 Clamp。", en: "Build Scene Time → Sine → Map Range → Emission Strength, with Clamp enabled." },
    sourceTutorialId: "tutorial_scene_time_pulse",
    checks: [
      { label: { zh: "秒數接到 Math", en: "Seconds connects to Math" }, test: (g) => hasLinkBetweenTypes(g, "input_scene_time", "seconds", "converter_math", "value1") },
      { label: { zh: "Math 使用 Sine", en: "Math uses Sine" }, test: (g) => anyNodeParamMatches(g, "converter_math", "operation", (v) => v === "sine") },
      { label: { zh: "Sine 經過映射範圍再進入發光", en: "Sine passes through Map Range before Emission" }, test: (g) => hasLinkBetweenTypes(g, "converter_math", "value", "converter_map_range", "value") && hasLinkBetweenTypes(g, "converter_map_range", "value", "shader_emission", "strength") },
      { label: { zh: "映射範圍已開啟 Clamp", en: "Map Range Clamp is enabled" }, test: (g) => anyNodeParamMatches(g, "converter_map_range", "clamp", (v) => v === true) },
    ],
    hints: [
      { zh: "一直增加的 Seconds 需要先變成週期波。", en: "Ever-increasing Seconds must first become a periodic wave." },
      { zh: "Sine 會輸出 -1 到 1，負值不適合直接當發光強度。", en: "Sine outputs -1 to 1; negative values are not useful as emission strength." },
      { zh: "用 Map Range 把 -1～1 轉成 0.25～5，並開啟 Clamp。", en: "Use Map Range to convert -1..1 into 0.25..5 and enable Clamp." },
    ],
  },
  {
    id: "challenge-frosted-glass",
    kind: "challenge",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "毛玻璃：讓雜訊只控制粗糙度", en: "Frosted Glass: Noise Controls Roughness" },
    description: { zh: "做出保留玻璃穿透、但表面有不均勻霧感的材質。", en: "Keep glass transmission while adding uneven surface frost." },
    objective: { zh: "使用雜訊紋理控制玻璃 BSDF 的粗糙度，玻璃仍需連到輸出。", en: "Use Noise Texture to drive Glass BSDF Roughness while keeping Glass connected to output." },
    sourceTutorialId: "tutorial_frosted_glass",
    checks: [
      { label: { zh: "玻璃 BSDF 已接到輸出", en: "Glass BSDF reaches output" }, test: (g) => hasLinkBetweenTypes(g, "shader_glass_bsdf", "bsdf", "output_material", "surface") },
      { label: { zh: "雜訊直接或經映射範圍控制玻璃粗糙度", en: "Noise drives Glass Roughness directly or through Map Range" }, test: (g) => hasLinkBetweenTypes(g, "texture_noise", "fac", "shader_glass_bsdf", "roughness") || (hasLinkBetweenTypes(g, "texture_noise", "fac", "converter_map_range", "value") && hasLinkBetweenTypes(g, "converter_map_range", "value", "shader_glass_bsdf", "roughness")) },
    ],
    hints: [
      { zh: "不要把雜訊接到玻璃顏色；霧感是表面微小粗糙變化。", en: "Do not connect Noise to glass color; frost is microscopic roughness variation." },
      { zh: "試著使用 Noise Texture 的 Fac 輸出。", en: "Try the Noise Texture Fac output." },
      { zh: "把 Noise Fac 接到 Glass BSDF 的 Roughness。", en: "Connect Noise Fac to Glass BSDF Roughness." },
    ],
  },
  {
    id: "challenge-edge-wear",
    kind: "challenge",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "邊緣磨損：讓金屬從油漆底下露出", en: "Edge Wear: Reveal Metal Through Paint" },
    description: { zh: "利用邊緣遮罩混合油漆與金屬兩種表面。", en: "Use an edge mask to mix painted and metallic surfaces." },
    objective: { zh: "完成邊緣遮罩驅動的兩層材質混合。", en: "Build a two-layer material mix driven by an edge mask." },
    sourceTutorialId: "tutorial_edge_wear_mask",
    checksFromTutorial: true,
    hints: [
      { zh: "先準備油漆與金屬兩個著色器，再思考用什麼控制混合係數。", en: "Prepare paint and metal shaders first, then choose what drives the mix factor." },
      { zh: "邊緣資訊通常需要經過 Color Ramp 強化。", en: "Edge information often needs a Color Ramp to sharpen it." },
      { zh: "參考教學的最終結構，但嘗試用自己的顏色完成。", en: "Use the tutorial's final structure as reference, but choose your own colors." },
    ],
  },
];

function guidedChallenge({ id, sourceTutorialId, level, topic, name, description, objective, hints }) {
  return {
    id,
    kind: "challenge",
    sourceTutorialId,
    checksFromTutorial: true,
    level,
    topic,
    name,
    description,
    objective,
    hints,
  };
}

const guidedChallenges = [
  guidedChallenge({
    id: "challenge-uv-mapping-control", sourceTutorialId: "tutorial_uv_mapping", topic: "mapping",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "UV 控制台：縮放並平移棋盤格", en: "UV Control: Scale and Shift a Checker" },
    description: { zh: "從座標開始，建立可調整密度與位置的棋盤格材質。", en: "Start from coordinates and build a checker material with adjustable density and position." },
    objective: { zh: "完成 Texture Coordinate → Mapping → Checker Texture → Base Color。", en: "Complete Texture Coordinate → Mapping → Checker Texture → Base Color." },
    hints: [{ zh: "先讓座標通過 Mapping，再送進紋理。", en: "Route coordinates through Mapping before the texture." }, { zh: "Scale 控制密度，Location 控制平移。", en: "Scale controls density; Location controls the offset." }],
  }),
  guidedChallenge({
    id: "challenge-gradient-palette", sourceTutorialId: "tutorial_gradient_texture", topic: "texture",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "漸層調色盤：把方向變成顏色", en: "Gradient Palette: Turn Direction into Color" },
    description: { zh: "用漸層紋理建立有方向性的雙色表面。", en: "Use a Gradient Texture to build a directional two-color surface." },
    objective: { zh: "讓漸層輸出控制材質顏色，並保留清楚的方向變化。", en: "Use the gradient output to control material color with a clear directional transition." },
    hints: [{ zh: "漸層需要向量座標才能知道方向。", en: "A gradient needs vector coordinates to know its direction." }, { zh: "先確認 Fac 真的有接到著色器的顏色輸入。", en: "Confirm Fac actually reaches the shader color input." }],
  }),
  guidedChallenge({
    id: "challenge-magic-gloss", sourceTutorialId: "tutorial_magic_texture", topic: "texture",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "迷幻亮面：扭曲抽象紋理", en: "Glossy Magic: Distorted Abstract Texture" },
    description: { zh: "用迷幻紋理與低粗糙度做出高彩度亮面。", en: "Combine Magic Texture and low roughness for a glossy abstract finish." },
    objective: { zh: "讓 Magic Texture 控制底色，增加扭曲並降低粗糙度。", en: "Drive Base Color with Magic Texture, raise Distortion, and lower Roughness." },
    hints: [{ zh: "Color 輸出適合直接拿來上色。", en: "The Color output is meant for direct coloring." }, { zh: "亮面效果要從 Roughness 著手。", en: "Use Roughness to control the glossy feel." }],
  }),
  guidedChallenge({
    id: "challenge-neon-wave", sourceTutorialId: "tutorial_neon_sign", topic: "emission",
    level: { zh: "入門挑戰", en: "Beginner Challenge" },
    name: { zh: "霓虹波紋：讓圖案控制發光", en: "Neon Waves: Let a Pattern Drive Emission" },
    description: { zh: "用波浪紋理做出有節奏的霓虹亮暗圖案。", en: "Use Wave Texture to create rhythmic neon brightness patterns." },
    objective: { zh: "完成座標、波浪紋理、發光強度與材質輸出的完整鏈。", en: "Complete the coordinate, wave, emission strength, and material output chain." },
    hints: [{ zh: "先把 Emission 正確接到 Surface。", en: "Connect Emission to Surface first." }, { zh: "Wave 的 Fac 可以直接當亮度控制值。", en: "Wave Fac can directly control brightness." }],
  }),
  guidedChallenge({
    id: "challenge-brick-relief", sourceTutorialId: "tutorial_brick_wall", topic: "surface",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "磚牆凹縫：顏色與凹凸共用一張紋理", en: "Brick Relief: Share One Texture for Color and Bump" },
    description: { zh: "同時利用 Brick Texture 的顏色與 Fac 做出磚牆層次。", en: "Use Brick Texture color and Fac together to build convincing brick depth." },
    objective: { zh: "磚塊顏色接到底色，Fac 經 Bump 接到 Normal。", en: "Send brick color to Base Color and Fac through Bump into Normal." },
    hints: [{ zh: "一個紋理可以同時送往多個輸入。", en: "One texture can feed more than one input." }, { zh: "高度資料先進 Bump，不要直接接 Normal。", en: "Height data goes through Bump before Normal." }],
  }),
  guidedChallenge({
    id: "challenge-procedural-wood", sourceTutorialId: "tutorial_wood", topic: "surface",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "程序木紋：波浪重新上色", en: "Procedural Wood: Recolor a Wave" },
    description: { zh: "用 Wave Texture 產生木紋節奏，再用 Color Ramp 上色。", en: "Create wood rhythm with Wave Texture, then recolor it with a Color Ramp." },
    objective: { zh: "完成座標 → 波浪 → 顏色漸變 → 底色。", en: "Complete Coordinates → Wave → Color Ramp → Base Color." },
    hints: [{ zh: "Fac 是灰階圖案，適合當 Color Ramp 的索引。", en: "Fac is a grayscale pattern suited to driving a Color Ramp." }, { zh: "先接線，再調整木頭的深淺色。", en: "Wire the graph first, then tune the wood colors." }],
  }),
  guidedChallenge({
    id: "challenge-voronoi-stone", sourceTutorialId: "tutorial_stone", topic: "surface",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "沃羅諾伊石材：顏色與粗糙度聯動", en: "Voronoi Stone: Link Color and Roughness" },
    description: { zh: "讓同一份細胞距離同時控制石頭分色與反光變化。", en: "Use one cellular distance signal to control both stone color and reflection variation." },
    objective: { zh: "Voronoi Distance 同時驅動 Color Ramp 與 Roughness。", en: "Use Voronoi Distance to drive both Color Ramp and Roughness." },
    hints: [{ zh: "Distance 可以分岔成兩條線。", en: "Distance can branch into two links." }, { zh: "先完成上色，再把同一值接到 Roughness。", en: "Finish coloring first, then reuse the same value for Roughness." }],
  }),
  guidedChallenge({
    id: "challenge-fresnel-carpaint", sourceTutorialId: "tutorial_mix_carpaint", topic: "pbr",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "雙層車漆：菲涅爾控制清漆", en: "Layered Car Paint: Fresnel-Controlled Clear Coat" },
    description: { zh: "混合漆面與高光層，讓邊緣反光自然增強。", en: "Mix a paint layer with a glossy layer so edge reflections strengthen naturally." },
    objective: { zh: "Principled 與 Glossy 經 Mix Shader 混合，Fac 由 Fresnel 驅動。", en: "Mix Principled and Glossy with a Fresnel-driven Mix Shader." },
    hints: [{ zh: "先把兩個著色器接到 Mix Shader。", en: "Connect both shaders to Mix Shader first." }, { zh: "Fresnel 應該控制混合比例，不是直接接顏色。", en: "Fresnel should control the mix factor, not color." }],
  }),
  guidedChallenge({
    id: "challenge-blackbody-candle", sourceTutorialId: "tutorial_blackbody_glow", topic: "emission",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "燭光色溫：1900K 暖色發光", en: "Candle Temperature: 1900K Warm Emission" },
    description: { zh: "不用手猜 RGB，改用物理色溫產生燭光。", en: "Use physical color temperature instead of guessing RGB values for candlelight." },
    objective: { zh: "Blackbody 控制 Emission 顏色，溫度調到約 1900K。", en: "Drive Emission color with Blackbody at roughly 1900K." },
    hints: [{ zh: "Blackbody 的 Color 要接到 Emission 的 Color。", en: "Connect Blackbody Color to Emission Color." }, { zh: "燭火屬於較低色溫。", en: "Candlelight uses a relatively low temperature." }],
  }),
  guidedChallenge({
    id: "challenge-metal-vs-plastic", sourceTutorialId: "tutorial_pbr_metal_vs_dielectric", topic: "pbr",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "金屬還是塑膠：同色材質對照", en: "Metal or Plastic: Same-Color Comparison" },
    description: { zh: "只改 Metallic，觀察底色如何從漫射轉移到反射。", en: "Change only Metallic and observe color move from diffuse response into reflection." },
    objective: { zh: "建立鮮豔低粗糙度材質，最後切成完整金屬。", en: "Build a vivid low-roughness material and finish at full metallic." },
    hints: [{ zh: "先固定 Base Color 與 Roughness。", en: "Hold Base Color and Roughness constant first." }, { zh: "最後只把 Metallic 從 0 推到 1。", en: "Finish by moving Metallic from 0 to 1." }],
  }),
  guidedChallenge({
    id: "challenge-roughness-study", sourceTutorialId: "tutorial_pbr_roughness_microfacets", topic: "pbr",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "粗糙度研究：把銳利反光暈開", en: "Roughness Study: Spread a Sharp Highlight" },
    description: { zh: "用同一顆金屬材質比較拋光與霧面反射。", en: "Compare polished and matte reflection using the same metal material." },
    objective: { zh: "保留金屬與底色，將粗糙度提高到霧面範圍。", en: "Keep metallic and color fixed while raising Roughness into a matte range." },
    hints: [{ zh: "不要調暗 Base Color。", en: "Do not darken Base Color." }, { zh: "高粗糙度會擴散高光，而不是單純降低亮度。", en: "High Roughness spreads highlights rather than simply dimming them." }],
  }),
  guidedChallenge({
    id: "challenge-rust-mask", sourceTutorialId: "tutorial_rust_weathering", topic: "masking",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "鏽蝕遮罩：乾淨金屬混合鏽層", en: "Rust Mask: Blend Clean Metal and Corrosion" },
    description: { zh: "把連續雜訊壓成清楚遮罩，混合乾淨金屬與粗糙鏽層。", en: "Turn smooth noise into a clear mask that blends clean metal with rough rust." },
    objective: { zh: "Noise → Color Ramp → Mix Shader Fac，並接好兩種材質。", en: "Build Noise → Color Ramp → Mix Shader Fac with both materials connected." },
    hints: [{ zh: "兩種材質先接好，再處理遮罩。", en: "Connect both materials before building the mask." }, { zh: "Color Ramp 用來控制鏽斑邊界。", en: "Use Color Ramp to control rust boundaries." }],
  }),
  guidedChallenge({
    id: "challenge-terrain-palette", sourceTutorialId: "tutorial_terrain_height_map", topic: "masking",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "地形分層：海岸、草地、岩壁與雪線", en: "Terrain Layers: Coast, Grass, Rock, and Snow" },
    description: { zh: "用多停駐點漸變把高度訊號變成完整地形配色。", en: "Turn a height signal into a full terrain palette with multiple color stops." },
    objective: { zh: "高度雜訊驅動至少五段顏色，並疊加細節紋理。", en: "Drive at least five terrain colors from height and overlay a detail texture." },
    hints: [{ zh: "先用 Color Ramp 定義高度區帶。", en: "Define height bands with a Color Ramp first." }, { zh: "細節層應該低比例混入，不要蓋掉主配色。", en: "Blend the detail layer subtly so it does not erase the main palette." }],
  }),
  guidedChallenge({
    id: "challenge-skin-sss", sourceTutorialId: "tutorial_skin_sss", topic: "shading",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "皮膚雙層：次表面散射加微量高光", en: "Layered Skin: Subsurface Plus Subtle Gloss" },
    description: { zh: "混合皮下散射與少量表層高光，避免塑膠感。", en: "Blend subsurface response with a small glossy layer without making the skin plastic." },
    objective: { zh: "SSS 與 Glossy 經 Mix Shader 混合，高光比例保持低。", en: "Mix SSS and Glossy through Mix Shader with a low glossy fraction." },
    hints: [{ zh: "先做 SSS 的膚色與 Radius。", en: "Set up SSS skin color and Radius first." }, { zh: "Glossy 只需要很少，不要各半混合。", en: "Use only a small amount of Glossy, not a 50/50 mix." }],
  }),
  guidedChallenge({
    id: "challenge-candle-wax", sourceTutorialId: "tutorial_candle_wax_glow", topic: "shading",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "半透明蠟燭：散射與發光相加", en: "Translucent Wax: Add Scattering and Glow" },
    description: { zh: "用 Add Shader 疊加蠟材質與暖色發光。", en: "Use Add Shader to layer wax scattering with warm emission." },
    objective: { zh: "SSS 與 Emission 接到 Add Shader，再接到輸出。", en: "Connect SSS and Emission into Add Shader, then to output." },
    hints: [{ zh: "這題要相加，不是二選一混合。", en: "This activity adds both effects rather than choosing between them." }, { zh: "確認使用 Add Shader，而不是 Mix Shader。", en: "Confirm you are using Add Shader, not Mix Shader." }],
  }),
  guidedChallenge({
    id: "challenge-puddle-mask", sourceTutorialId: "tutorial_puddle_wetness", topic: "masking",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "積水斑塊：乾濕材質程序混合", en: "Puddle Patches: Procedural Dry/Wet Blend" },
    description: { zh: "用沃羅諾伊與硬邊漸變控制乾地與濕地。", en: "Use Voronoi and a hard-edged ramp to control dry and wet ground." },
    objective: { zh: "乾濕兩材質經 Mix Shader 混合，Fac 由程序遮罩控制。", en: "Mix dry and wet shaders with a procedural mask driving Fac." },
    hints: [{ zh: "濕材質通常顏色更深、粗糙度更低。", en: "Wet material is usually darker and less rough." }, { zh: "用 Constant Color Ramp 讓積水邊界更清楚。", en: "Use a Constant Color Ramp for clearer puddle edges." }],
  }),
  guidedChallenge({
    id: "challenge-toon-bands", sourceTutorialId: "tutorial_toon_style_banding", topic: "stylized",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "卡通分色：三段式硬邊材質", en: "Toon Bands: Three-Step Hard Color Material" },
    description: { zh: "用菲涅爾與 Constant 漸變做出穩定色帶。", en: "Use Fresnel and a Constant ramp to create stable color bands." },
    objective: { zh: "Fresnel 驅動至少三段硬邊 Color Ramp，再接到底色。", en: "Drive a three-stop Constant Color Ramp with Fresnel, then feed Base Color." },
    hints: [{ zh: "分段效果來自 Color Ramp 的 Constant 插值。", en: "The stepped look comes from Constant interpolation." }, { zh: "Fresnel 提供由正面到邊緣的變化。", en: "Fresnel provides the front-to-edge variation." }],
  }),
  guidedChallenge({
    id: "challenge-channel-pack", sourceTutorialId: "tutorial_channel_packing", topic: "workflow",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "通道打包：一個顏色搬運三份遮罩", en: "Channel Packing: Carry Three Masks in One Color" },
    description: { zh: "把三個程序遮罩塞進 RGB，再拆開控制不同參數。", en: "Pack three procedural masks into RGB and unpack them to drive different parameters." },
    objective: { zh: "三遮罩進 Combine Color，再由 Separate Color 拆到 Roughness 與 Metallic。", en: "Pack masks with Combine Color, then unpack them into Roughness and Metallic." },
    hints: [{ zh: "R、G、B 每個通道都可以獨立存一張灰階遮罩。", en: "Each R, G, and B channel can store an independent grayscale mask." }, { zh: "Combine 與 Separate 中間必須直接相連。", en: "Combine and Separate must be connected directly." }],
  }),
  guidedChallenge({
    id: "challenge-displacement-terrain", sourceTutorialId: "tutorial_displacement_terrain", topic: "displacement",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "真位移地形：高度推動幾何", en: "True Displacement Terrain: Height Moves Geometry" },
    description: { zh: "把程序高度送到 Material Output 的 Displacement，而不是只做假凹凸。", en: "Send procedural height to Material Output Displacement instead of faking surface bump." },
    objective: { zh: "Voronoi Distance → Displacement Height → Material Output Displacement。", en: "Build Voronoi Distance → Displacement Height → Material Output Displacement." },
    hints: [{ zh: "這題不是接到 Principled 的 Normal。", en: "This does not connect to Principled Normal." }, { zh: "Displacement 節點的輸出要進 Material Output 的同名插槽。", en: "Connect the Displacement node output to the matching Material Output socket." }],
  }),
  guidedChallenge({
    id: "challenge-stained-glass", sourceTutorialId: "tutorial_stained_glass", topic: "glass",
    level: { zh: "進階挑戰", en: "Advanced Challenge" },
    name: { zh: "彩色玻璃窗：連續圖案調色盤化", en: "Stained Glass: Palette a Continuous Pattern" },
    description: { zh: "把程序紋理壓成多段色塊，驅動玻璃顏色。", en: "Quantize a procedural texture into colored regions that drive glass color." },
    objective: { zh: "建立程序圖案、顏色漸變與玻璃著色器的完整鏈。", en: "Build the full procedural pattern, color ramp, and glass shader chain." },
    hints: [{ zh: "先得到 0～1 圖案，再交給 Color Ramp 上色。", en: "Create a 0–1 pattern first, then color it with a Color Ramp." }, { zh: "最後的顏色要進玻璃著色器，不是 Principled。", en: "The final color feeds the glass shader, not Principled." }],
  }),
  guidedChallenge({
    id: "challenge-fabric-colorway", sourceTutorialId: "tutorial_dual_tone_fabric_colorway", topic: "workflow",
    level: { zh: "中階挑戰", en: "Intermediate Challenge" },
    name: { zh: "雙色織布換色：保留明暗只換色相", en: "Two-Tone Fabric Colorway: Change Hue, Keep Contrast" },
    description: { zh: "用 HSV 工作流替織布換配色，同時保留原本明暗結構。", en: "Recolor fabric through HSV while preserving its existing light/dark structure." },
    objective: { zh: "完成雙色紋理與 HSV 換色流程，輸出到材質底色。", en: "Complete the two-tone texture and HSV recoloring workflow into Base Color." },
    hints: [{ zh: "先確認紋理已經能形成兩種區域。", en: "First verify the texture creates two distinct regions." }, { zh: "換色時不要破壞 Value 明暗資訊。", en: "Preserve Value while changing the colorway." }],
  }),
];

const coreDebugLabs = [
  {
    id: "debug-disconnected-output",
    kind: "debug",
    level: { zh: "基礎除錯", en: "Basic Debugging" },
    name: { zh: "材質為什麼完全沒反應？", en: "Why Does the Material Do Nothing?" },
    description: { zh: "節點都在，但預覽仍是預設材質；找出斷掉的關鍵連線。", en: "The nodes exist, but the preview stays default. Find the missing critical link." },
    objective: { zh: "修好節點圖，讓原理化 BSDF 真正送到材質輸出。", en: "Repair the graph so Principled BSDF reaches Material Output." },
    startGraph: {
      nodes: [output, { id: "d_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.1, 0.5, 0.9, 1], metallic: 0.7, roughness: 0.22 } }],
      links: [],
    },
    targetGraph: {
      nodes: [output, { id: "d_principled", typeId: "shader_principled_bsdf", x: 520, y: 120, params: { baseColor: [0.1, 0.5, 0.9, 1], metallic: 0.7, roughness: 0.22 } }],
      links: [{ id: "d_l1", fromNode: "d_principled", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [{ label: { zh: "表面輸出已恢復", en: "Surface output is restored" }, test: (g) => hasLinkBetweenTypes(g, "shader_principled_bsdf", "bsdf", "output_material", "surface") }],
    hints: [
      { zh: "先從材質輸出往左追，看看 Surface 有沒有收到資料。", en: "Trace leftward from Material Output. Is Surface receiving anything?" },
      { zh: "著色器的 BSDF 輸出必須接到 Material Output 的 Surface。", en: "The shader's BSDF output must connect to Material Output Surface." },
    ],
  },
  {
    id: "debug-directx-normal",
    kind: "debug",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "法線貼圖的凹凸方向反了", en: "The Normal Map Looks Inverted" },
    description: { zh: "這張貼圖來自 DirectX 工作流，但節點仍使用 OpenGL 慣例。", en: "The texture came from a DirectX workflow, but the node still uses OpenGL convention." },
    objective: { zh: "把法線貼圖慣例切成 DirectX。", en: "Switch the Normal Map convention to DirectX." },
    startGraph: {
      nodes: [output, { id: "d2_p", typeId: "shader_principled_bsdf", x: 650, y: 100, params: {} }, { id: "d2_n", typeId: "vector_normal_map", x: 350, y: 260, params: { color: [0.5, 0.25, 1, 1], strength: 1, convention: "opengl" } }],
      links: [
        { id: "d2_l1", fromNode: "d2_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" },
        { id: "d2_l2", fromNode: "d2_n", fromSocket: "normal", toNode: "d2_p", toSocket: "normal" },
      ],
    },
    targetGraph: {
      nodes: [output, { id: "d2_p", typeId: "shader_principled_bsdf", x: 650, y: 100, params: {} }, { id: "d2_n", typeId: "vector_normal_map", x: 350, y: 260, params: { color: [0.5, 0.25, 1, 1], strength: 1, convention: "directx" } }],
      links: [
        { id: "d2_l1", fromNode: "d2_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" },
        { id: "d2_l2", fromNode: "d2_n", fromSocket: "normal", toNode: "d2_p", toSocket: "normal" },
      ],
    },
    checks: [{ label: { zh: "法線貼圖改為 DirectX", en: "Normal Map uses DirectX" }, test: (g) => anyNodeParamMatches(g, "vector_normal_map", "convention", (v) => v === "directx") }],
    hints: [
      { zh: "凹凸方向顛倒通常不是 Strength 的問題，而是綠色通道方向。", en: "Inverted bumps usually point to the green-channel direction, not Strength." },
      { zh: "在法線貼圖節點的 Convention 選單切換 OpenGL／DirectX。", en: "Use the Normal Map Convention menu to switch OpenGL/DirectX." },
    ],
  },
  {
    id: "debug-thin-wall",
    kind: "debug",
    level: { zh: "新版功能除錯", en: "New Feature Debugging" },
    name: { zh: "Thin Wall 開了卻完全看不出效果", en: "Thin Wall Is On but Nothing Changes" },
    description: { zh: "薄壁已啟用，但材質仍沒有任何光線穿透。", en: "Thin Wall is enabled, but no light passes through the material." },
    objective: { zh: "保留 Thin Wall，並把透射權重調到至少 0.8。", en: "Keep Thin Wall enabled and raise Transmission Weight to at least 0.8." },
    startGraph: {
      nodes: [output, { id: "d3_p", typeId: "shader_principled_bsdf", x: 500, y: 90, params: { baseColor: [0.9, 0.95, 1, 1], roughness: 0.18, thinWall: true, transmissionWeight: 0 } }],
      links: [{ id: "d3_l1", fromNode: "d3_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    targetGraph: {
      nodes: [output, { id: "d3_p", typeId: "shader_principled_bsdf", x: 500, y: 90, params: { baseColor: [0.9, 0.95, 1, 1], roughness: 0.18, thinWall: true, transmissionWeight: 1 } }],
      links: [{ id: "d3_l1", fromNode: "d3_p", fromSocket: "bsdf", toNode: "a_out", toSocket: "surface" }],
    },
    checks: [
      { label: { zh: "Thin Wall 保持開啟", en: "Thin Wall remains enabled" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "thinWall", (v) => v === true) },
      { label: { zh: "透射權重至少 0.8", en: "Transmission Weight is at least 0.8" }, test: (g) => anyNodeParamMatches(g, "shader_principled_bsdf", "transmissionWeight", (v) => v >= 0.8) },
    ],
    hints: [
      { zh: "Thin Wall 只改變透射的厚度模型，不會自行增加透射。", en: "Thin Wall changes the transmission thickness model; it does not add transmission by itself." },
      { zh: "到原理化 BSDF 的透射區塊調高 Weight。", en: "Raise Weight in Principled BSDF's Transmission section." },
    ],
  },
];

function derivedDebug({ id, sourceTutorialId, level, topic, name, description, objective, mutations, hints }) {
  return {
    id,
    kind: "debug",
    sourceTutorialId,
    checksFromTutorial: true,
    startFromTarget: true,
    mutations,
    level,
    topic,
    name,
    description,
    objective,
    hints,
  };
}

const derivedDebugLabs = [
  derivedDebug({
    id: "debug-mapping-bypass", sourceTutorialId: "tutorial_uv_mapping", topic: "mapping",
    level: { zh: "基礎除錯", en: "Basic Debugging" },
    name: { zh: "Mapping 數值有改，圖案卻完全不動", en: "Mapping Changes but the Pattern Does Not Move" },
    description: { zh: "Mapping 節點存在，但座標繞過了它。", en: "The Mapping node exists, but the coordinates bypass it." },
    objective: { zh: "把 Texture Coordinate 重新接進 Mapping 的 Vector。", en: "Reconnect Texture Coordinate into Mapping Vector." },
    mutations: [{ type: "remove-link", fromType: "input_texture_coordinate", toType: "vector_mapping" }],
    hints: [{ zh: "沿著 Checker 的 Vector 往左追。", en: "Trace left from the Checker's Vector input." }, { zh: "Mapping 必須位在座標與紋理中間。", en: "Mapping must sit between coordinates and texture." }],
  }),
  derivedDebug({
    id: "debug-neon-flat", sourceTutorialId: "tutorial_neon_sign", topic: "emission",
    level: { zh: "基礎除錯", en: "Basic Debugging" },
    name: { zh: "霓虹整片一樣亮，波紋不見了", en: "The Neon Is Flat and the Wave Pattern Vanished" },
    description: { zh: "波浪紋理正常存在，但沒有控制發光強度。", en: "The Wave Texture exists but no longer controls emission strength." },
    objective: { zh: "讓 Wave Fac 再次驅動 Emission Strength。", en: "Make Wave Fac drive Emission Strength again." },
    mutations: [{ type: "remove-link", fromType: "texture_wave", fromSocket: "fac", toType: "shader_emission", toSocket: "strength" }],
    hints: [{ zh: "先看 Emission 的 Strength 左側有沒有連線。", en: "Check whether Emission Strength has an incoming link." }, { zh: "灰階 Fac 適合直接控制強度。", en: "A grayscale Fac is suitable for driving strength." }],
  }),
  derivedDebug({
    id: "debug-brick-flat", sourceTutorialId: "tutorial_brick_wall", topic: "surface",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "磚牆有顏色，灰泥縫卻沒有凹陷", en: "Brick Color Works but Mortar Has No Depth" },
    description: { zh: "高度圖進了 Bump，但法線結果沒有送回著色器。", en: "Height reaches Bump, but its normal result never returns to the shader." },
    objective: { zh: "修復 Bump Normal → Principled Normal 的連線。", en: "Repair Bump Normal → Principled Normal." },
    mutations: [{ type: "remove-link", fromType: "vector_bump", fromSocket: "normal", toType: "shader_principled_bsdf", toSocket: "normal" }],
    hints: [{ zh: "Bump 的 Height 不是最後一步。", en: "Bump Height is not the final step." }, { zh: "Bump 的 Normal 輸出要回到著色器。", en: "Send Bump Normal back into the shader." }],
  }),
  derivedDebug({
    id: "debug-wood-gray", sourceTutorialId: "tutorial_wood", topic: "surface",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "木紋遮罩正常，材質卻仍是灰色", en: "The Wood Mask Works but the Material Is Gray" },
    description: { zh: "Color Ramp 已經上色，但結果沒有進入 Base Color。", en: "The Color Ramp is colored, but its result does not reach Base Color." },
    objective: { zh: "把 Color Ramp Color 接回 Principled Base Color。", en: "Reconnect Color Ramp Color to Principled Base Color." },
    mutations: [{ type: "remove-link", fromType: "converter_color_ramp", fromSocket: "color", toType: "shader_principled_bsdf", toSocket: "baseColor" }],
    hints: [{ zh: "從 Principled 的 Base Color 往左檢查。", en: "Trace left from Principled Base Color." }, { zh: "Fac 用來查色；真正的顏色在 Color 輸出。", en: "Fac looks up the ramp; the actual result comes from Color." }],
  }),
  derivedDebug({
    id: "debug-carpaint-no-edge", sourceTutorialId: "tutorial_mix_carpaint", topic: "pbr",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "車漆能混合，但邊緣高光不會變", en: "Car Paint Mixes but Edge Highlights Never Change" },
    description: { zh: "兩個著色器已接好，混合比例卻沒有視角資訊。", en: "Both shaders are connected, but the mix factor has no view-angle signal." },
    objective: { zh: "把 Fresnel Fac 接回 Mix Shader Fac。", en: "Reconnect Fresnel Fac to Mix Shader Fac." },
    mutations: [{ type: "remove-link", fromType: "input_fresnel", fromSocket: "fac", toType: "shader_mix_shader", toSocket: "fac" }],
    hints: [{ zh: "檢查 Mix Shader 最上方的 Fac。", en: "Inspect the Fac input at the top of Mix Shader." }, { zh: "Fresnel 不是著色器，應該接控制值插槽。", en: "Fresnel is not a shader; it belongs in a control-value socket." }],
  }),
  derivedDebug({
    id: "debug-time-no-loop", sourceTutorialId: "tutorial_scene_time_pulse", topic: "animation",
    level: { zh: "新版功能除錯", en: "New Feature Debugging" },
    name: { zh: "發光只會越來越亮，不會循環", en: "Emission Keeps Rising Instead of Looping" },
    description: { zh: "Scene Time 接線正確，但 Math 被切成一般加法。", en: "Scene Time is wired correctly, but Math was switched to ordinary addition." },
    objective: { zh: "把 Math 運算切回 Sine，恢復週期波。", en: "Switch Math back to Sine to restore a periodic wave." },
    mutations: [{ type: "set-param", nodeType: "converter_math", key: "operation", value: "add" }],
    hints: [{ zh: "Seconds 本身只會持續增加。", en: "Seconds only increases over time." }, { zh: "需要輸出 -1～1 的週期運算。", en: "Use a periodic operation that outputs -1 to 1." }],
  }),
  derivedDebug({
    id: "debug-time-unclamped", sourceTutorialId: "tutorial_scene_time_pulse", topic: "animation",
    level: { zh: "新版功能除錯", en: "New Feature Debugging" },
    name: { zh: "脈衝偶爾超出預期亮度", en: "The Pulse Sometimes Exceeds the Intended Brightness" },
    description: { zh: "映射範圍正確，但安全夾值被關閉。", en: "The mapping range is correct, but its safety clamp is disabled." },
    objective: { zh: "重新開啟 Map Range 的 Clamp。", en: "Enable Clamp on Map Range again." },
    mutations: [{ type: "set-param", nodeType: "converter_map_range", key: "clamp", value: false }],
    hints: [{ zh: "檢查 Map Range 的選項，不只看數字。", en: "Inspect Map Range options, not just its numbers." }, { zh: "Clamp 可以限制輸出不越過目標範圍。", en: "Clamp keeps output inside the target range." }],
  }),
  derivedDebug({
    id: "debug-edge-wear-everywhere", sourceTutorialId: "tutorial_edge_wear_mask", topic: "masking",
    level: { zh: "進階除錯", en: "Advanced Debugging" },
    name: { zh: "磨損金屬整片出現，沒有集中在邊緣", en: "Edge Wear Covers Everything Instead of the Edges" },
    description: { zh: "兩層材質正常，但硬邊遮罩沒有控制混合比例。", en: "Both layers work, but the hard mask no longer controls their blend." },
    objective: { zh: "把 Color Ramp Color 接回 Mix Shader Fac。", en: "Reconnect Color Ramp Color to Mix Shader Fac." },
    mutations: [{ type: "remove-link", fromType: "converter_color_ramp", fromSocket: "color", toType: "shader_mix_shader", toSocket: "fac" }],
    hints: [{ zh: "先確認兩個 Shader 輸入都還在。", en: "First confirm both shader inputs remain connected." }, { zh: "控制局部出現的位置是 Fac，不是 Shader 插槽。", en: "The local reveal is controlled by Fac, not a Shader socket." }],
  }),
  derivedDebug({
    id: "debug-frosted-glass-clear", sourceTutorialId: "tutorial_frosted_glass", topic: "glass",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "毛玻璃突然變回完全清澈", en: "Frosted Glass Suddenly Turns Clear" },
    description: { zh: "雜訊與映射範圍都在，但粗糙度沒有收到結果。", en: "Noise and Map Range remain, but Roughness no longer receives the result." },
    objective: { zh: "把 Map Range Value 接回 Glass Roughness。", en: "Reconnect Map Range Value to Glass Roughness." },
    mutations: [{ type: "remove-link", fromType: "converter_map_range", fromSocket: "value", toType: "shader_glass_bsdf", toSocket: "roughness" }],
    hints: [{ zh: "從 Glass Roughness 反向追線。", en: "Trace backward from Glass Roughness." }, { zh: "Map Range 的 Value 才是收窄後的粗糙度。", en: "Map Range Value is the narrowed roughness signal." }],
  }),
  derivedDebug({
    id: "debug-displacement-flat", sourceTutorialId: "tutorial_displacement_terrain", topic: "displacement",
    level: { zh: "進階除錯", en: "Advanced Debugging" },
    name: { zh: "高度節點都有，模型仍然完全平坦", en: "All Height Nodes Exist but the Model Stays Flat" },
    description: { zh: "Displacement 算好了，卻沒有送進 Material Output。", en: "Displacement is calculated but never reaches Material Output." },
    objective: { zh: "修復 Displacement → Material Output Displacement。", en: "Repair Displacement → Material Output Displacement." },
    mutations: [{ type: "remove-link", fromType: "vector_displacement", fromSocket: "displacement", toType: "output_material", toSocket: "displacement" }],
    hints: [{ zh: "Principled Surface 正常不代表位移也正常。", en: "A working Principled Surface does not mean displacement is connected." }, { zh: "Material Output 有獨立的 Displacement 插槽。", en: "Material Output has a separate Displacement socket." }],
  }),
  derivedDebug({
    id: "debug-channel-pack-roughness", sourceTutorialId: "tutorial_channel_packing", topic: "workflow",
    level: { zh: "進階除錯", en: "Advanced Debugging" },
    name: { zh: "通道拆開了，粗糙度卻沒有變化", en: "Channels Are Unpacked but Roughness Does Not Change" },
    description: { zh: "RGB 打包與拆包正常，但 R 通道沒有送到粗糙度。", en: "RGB packing and unpacking work, but the R channel never reaches Roughness." },
    objective: { zh: "把 Separate Color 的 R 接回 Principled Roughness。", en: "Reconnect Separate Color R to Principled Roughness." },
    mutations: [{ type: "remove-link", fromType: "converter_separate_color", fromSocket: "r", toType: "shader_principled_bsdf", toSocket: "roughness" }],
    hints: [{ zh: "確認 Separate Color 的各通道去了哪裡。", en: "Check where each Separate Color channel goes." }, { zh: "這份案例把 R 指定為 Roughness 遮罩。", en: "This activity assigns R as the Roughness mask." }],
  }),
  derivedDebug({
    id: "debug-rust-solid", sourceTutorialId: "tutorial_rust_weathering", topic: "masking",
    level: { zh: "進階除錯", en: "Advanced Debugging" },
    name: { zh: "鏽蝕變成整片，沒有隨機斑駁", en: "Rust Becomes Solid Instead of Patchy" },
    description: { zh: "混合與顏色漸變仍在，但 Noise 沒有驅動遮罩。", en: "Mixing and the ramp remain, but Noise no longer drives the mask." },
    objective: { zh: "把 Noise Fac 接回 Color Ramp Fac。", en: "Reconnect Noise Fac to Color Ramp Fac." },
    mutations: [{ type: "remove-link", fromType: "texture_noise", fromSocket: "fac", toType: "converter_color_ramp", toSocket: "fac" }],
    hints: [{ zh: "Color Ramp 沒有輸入時只會停在固定位置。", en: "A Color Ramp without input stays at one fixed lookup position." }, { zh: "Noise Fac 應該是鏽斑的來源。", en: "Noise Fac should be the source of the rust pattern." }],
  }),
  derivedDebug({
    id: "debug-skin-missing-gloss", sourceTutorialId: "tutorial_skin_sss", topic: "shading",
    level: { zh: "進階除錯", en: "Advanced Debugging" },
    name: { zh: "皮膚散射正常，表層高光卻消失", en: "Skin Scattering Works but Surface Gloss Is Gone" },
    description: { zh: "SSS 還在，Glossy 層卻沒有進入 Mix Shader。", en: "SSS remains, but the Glossy layer no longer reaches Mix Shader." },
    objective: { zh: "把 Glossy BSDF 接回 Mix Shader 的第二個 Shader。", en: "Reconnect Glossy BSDF to the second Mix Shader input." },
    mutations: [{ type: "remove-link", fromType: "shader_glossy_bsdf", fromSocket: "bsdf", toType: "shader_mix_shader", toSocket: "shader2" }],
    hints: [{ zh: "沿著 Mix Shader 的兩個 Shader 輸入檢查。", en: "Inspect both shader inputs on Mix Shader." }, { zh: "少量 Glossy 應該是第二層。", en: "The subtle Glossy response should be the second layer." }],
  }),
  derivedDebug({
    id: "debug-metal-turned-plastic", sourceTutorialId: "tutorial_pbr_metal_vs_dielectric", topic: "pbr",
    level: { zh: "中階除錯", en: "Intermediate Debugging" },
    name: { zh: "藍色金屬突然看起來像塑膠", en: "The Blue Metal Suddenly Looks Like Plastic" },
    description: { zh: "底色與粗糙度沒變，但 Metallic 被歸零。", en: "Color and Roughness are unchanged, but Metallic was reset to zero." },
    objective: { zh: "把 Metallic 恢復到 1。", en: "Restore Metallic to 1." },
    mutations: [{ type: "set-param", nodeType: "shader_principled_bsdf", key: "metallic", value: 0 }],
    hints: [{ zh: "塑膠與金屬的核心差異不是 Base Color。", en: "The core plastic/metal difference is not Base Color." }, { zh: "檢查 Principled 的 Metallic。", en: "Inspect Principled Metallic." }],
  }),
];

export const assessmentQuestions = [
  {
    question: { zh: "哪個參數主要控制高光是銳利還是模糊？", en: "Which parameter mainly controls whether highlights are sharp or blurry?" },
    options: [{ zh: "粗糙度 Roughness", en: "Roughness" }, { zh: "金屬度 Metallic", en: "Metallic" }, { zh: "Alpha", en: "Alpha" }],
    correctIndex: 0,
  },
  {
    question: { zh: "要把 Noise 的 0～1 輸出改成 0.2～5，最適合用哪個節點？", en: "Which node is best for remapping Noise from 0–1 into 0.2–5?" },
    options: [{ zh: "映射範圍 Map Range", en: "Map Range" }, { zh: "反色 Invert", en: "Invert" }, { zh: "法線 Normal", en: "Normal" }],
    correctIndex: 0,
  },
  {
    question: { zh: "DirectX 法線貼圖和 OpenGL 最主要差在哪個通道？", en: "Which channel mainly differs between DirectX and OpenGL normal maps?" },
    options: [{ zh: "綠色 Y", en: "Green Y" }, { zh: "紅色 X", en: "Red X" }, { zh: "藍色 Z", en: "Blue Z" }],
    correctIndex: 0,
  },
  {
    question: { zh: "為什麼 Scene Time 後面常接 Sine？", en: "Why is Scene Time often followed by Sine?" },
    options: [{ zh: "把時間轉成循環波", en: "Turn time into a repeating wave" }, { zh: "轉換成顏色", en: "Convert it into color" }, { zh: "停止動畫", en: "Stop animation" }],
    correctIndex: 0,
  },
  {
    question: { zh: "金屬材質的反光顏色主要來自哪裡？", en: "Where does a metal material's reflection color mainly come from?" },
    options: [{ zh: "底色 Base Color", en: "Base Color" }, { zh: "Alpha", en: "Alpha" }, { zh: "法線強度", en: "Normal Strength" }],
    correctIndex: 0,
  },
  {
    question: { zh: "某個節點沒有連到 Material Output 的路徑上，會發生什麼事？", en: "What happens if a node is not on any path to Material Output?" },
    options: [{ zh: "不影響最終材質", en: "It does not affect the final material" }, { zh: "自動接到 Surface", en: "It automatically connects to Surface" }, { zh: "讓 Blender 崩潰", en: "It crashes Blender" }],
    correctIndex: 0,
  },
];

export const conceptCards = [
  { id: "roughness", tag: { zh: "PBR", en: "PBR" }, front: { zh: "Roughness 改變的是亮度嗎？", en: "Does Roughness change brightness?" }, back: { zh: "不是。它主要改變微表面反射的分散程度：低值銳利，高值寬而模糊。", en: "No. It mainly changes microfacet reflection spread: low is sharp, high is broad and blurry." } },
  { id: "metallic", tag: { zh: "PBR", en: "PBR" }, front: { zh: "為什麼金屬反光會帶顏色？", en: "Why are metal reflections colored?" }, back: { zh: "金屬幾乎沒有漫射層，Base Color 直接染色鏡面反射；非金屬的鏡面反射通常接近白色。", en: "Metals have almost no diffuse layer, so Base Color tints specular reflection; dielectrics usually reflect near-white." } },
  { id: "fac", tag: { zh: "遮罩", en: "Masks" }, front: { zh: "Fac 輸出通常代表什麼？", en: "What does a Fac output usually represent?" }, back: { zh: "一個 0～1 的控制值，可當作混合比例、粗糙度、遮罩或其他數值輸入。", en: "A 0–1 control value used as a mix factor, roughness, mask, or another numeric input." } },
  { id: "normal-map", tag: { zh: "法線", en: "Normals" }, front: { zh: "Normal Map 真的改變模型輪廓嗎？", en: "Does a Normal Map change the model silhouette?" }, back: { zh: "不會。它只改變光照用的法線方向；要改輪廓必須使用真正的位移或幾何。", en: "No. It changes lighting normals only; silhouettes require real displacement or geometry." } },
  { id: "color-space", tag: { zh: "貼圖", en: "Textures" }, front: { zh: "法線／粗糙度貼圖為什麼要用 Non-Color？", en: "Why use Non-Color for normal/roughness maps?" }, back: { zh: "它們存的是數據，不是人眼觀看的顏色；套用色彩管理會扭曲原始數值。", en: "They store data, not display color. Color management would distort their numeric values." } },
  { id: "sine", tag: { zh: "動畫", en: "Animation" }, front: { zh: "Sine 的輸出範圍是多少？", en: "What is Sine's output range?" }, back: { zh: "-1 到 1。接到只能接受正值的輸入前，通常要先用 Map Range 重新映射。", en: "-1 to 1. Remap it before feeding inputs that should stay positive." } },
  { id: "thin-wall", tag: { zh: "Blender 5.2", en: "Blender 5.2" }, front: { zh: "Thin Wall 會自動讓材質透明嗎？", en: "Does Thin Wall automatically make a material transparent?" }, back: { zh: "不會。它把表面視為零厚度薄片；仍需透射權重或其他透光設定。", en: "No. It treats the surface as a zero-thickness sheet; transmission still needs to be enabled separately." } },
  { id: "fresnel", tag: { zh: "光線", en: "Light" }, front: { zh: "Fresnel 為什麼常用來做邊緣效果？", en: "Why is Fresnel useful for edge effects?" }, back: { zh: "表面越接近掠視角，反射比例越高，因此物體輪廓附近自然得到較大的值。", en: "Reflection rises at grazing angles, so values naturally become stronger near silhouettes." } },
];

function cloneGraphData(graphData) {
  return graphData ? JSON.parse(JSON.stringify(graphData)) : null;
}

function applyGraphMutations(graphData, mutations = []) {
  const graph = cloneGraphData(graphData);
  if (!graph) return null;
  for (const mutation of mutations) {
    if (mutation.type === "set-param") {
      const matches = graph.nodes.filter((node) => node.typeId === mutation.nodeType);
      const node = matches[mutation.index || 0];
      if (node) node.params = { ...node.params, [mutation.key]: mutation.value };
      continue;
    }
    if (mutation.type === "remove-link") {
      graph.links = graph.links.filter((link) => {
        const fromNode = graph.nodes.find((node) => node.id === link.fromNode);
        const toNode = graph.nodes.find((node) => node.id === link.toNode);
        return !(
          (!mutation.fromType || fromNode?.typeId === mutation.fromType) &&
          (!mutation.fromSocket || link.fromSocket === mutation.fromSocket) &&
          (!mutation.toType || toNode?.typeId === mutation.toType) &&
          (!mutation.toSocket || link.toSocket === mutation.toSocket)
        );
      });
    }
  }
  return graph;
}

export function resolveLearningActivity(activity, tutorials) {
  const source = activity.sourceTutorialId
    ? tutorials.find((tutorial) => tutorial.id === activity.sourceTutorialId)
    : null;
  const targetGraph = activity.targetGraph || source?.endGraph || null;
  const startGraph = activity.startGraph
    || (activity.startFromTarget ? applyGraphMutations(targetGraph, activity.mutations) : source?.startGraph)
    || null;
  let checks = activity.checks || [];
  if (activity.checksFromTutorial && source && targetGraph) {
    const target = Graph.fromJSON(targetGraph);
    checks = source.steps
      .filter((step) => {
        try {
          return Boolean(step.check(target));
        } catch {
          return false;
        }
      })
      .map((step) => ({ label: step.title, test: step.check }));
  }
  return { ...activity, source, startGraph, targetGraph, checks };
}

export const challenges = [...coreChallenges, ...guidedChallenges];
export const debugLabs = [...coreDebugLabs, ...derivedDebugLabs];
export const learningActivities = [...challenges, ...debugLabs];
