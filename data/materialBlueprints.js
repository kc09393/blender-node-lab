// 材質拆解器：把「我想做某種材質」翻譯成可重複使用的接線思路。
// 這不是固定答案清單，而是教使用者依序回答：座標從哪來、用什麼產生訊號、
// 如何塑形、要控制哪個表面性質、最後如何送進輸出。

const bi = (zh, en) => ({ zh, en });
const node = (kind, roleZh, roleEn, nameZh, nameEn, whyZh, whyEn) => ({
  kind,
  role: bi(roleZh, roleEn),
  name: bi(nameZh, nameEn),
  why: bi(whyZh, whyEn),
});
const param = (nameZh, nameEn, valueZh, valueEn) => ({ name: bi(nameZh, nameEn), value: bi(valueZh, valueEn) });
const issue = (symptomZh, symptomEn, causeZh, causeEn, fixZh, fixEn) => ({
  symptom: bi(symptomZh, symptomEn),
  cause: bi(causeZh, causeEn),
  fix: bi(fixZh, fixEn),
});

export const materialThinkingFlow = [
  bi("座標：圖案黏在哪裡？", "Coordinates: what does the pattern follow?"),
  bi("訊號：用圖片、雜訊、波浪還是細胞？", "Signal: image, noise, waves, or cells?"),
  bi("塑形：怎麼改範圍、對比與邊界？", "Shaping: how should range, contrast, and edges change?"),
  bi("表面：它控制顏色、粗糙度、金屬、透光還是凹凸？", "Surface: color, roughness, metal, transmission, or bump?"),
  bi("輸出：著色器是否真的走到材質輸出？", "Output: does the shader actually reach Material Output?"),
];

export default [
  {
    id: "plastic-rubber",
    preview: "plastic",
    name: bi("塑膠與橡膠", "Plastic and Rubber"),
    cue: bi("先看高光寬窄與表面是否有細顆粒；它們通常不是金屬。", "Read highlight width and fine surface grain first; these are usually non-metallic."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件座標／UV", "Object Coordinates / UV", "素色可省略；有模具紋或印刷時才需要。", "Optional for a solid color; needed for molded grain or printing."),
      node("signal", "訊號", "Signal", "常數顏色＋細雜訊", "Solid Color + Fine Noise", "顏色決定塑料本體，細雜訊只負責微小不均。", "Color defines the body; fine noise adds only subtle variation."),
      node("shape", "塑形", "Shaping", "映射範圍", "Map Range", "把雜訊壓在小範圍，避免表面像石頭。", "Compress noise into a narrow range so it does not look like stone."),
      node("surface", "表面", "Surface", "原理化 BSDF", "Principled BSDF", "Metallic 保持 0，以 Roughness 與 IOR 決定塑膠或橡膠手感。", "Keep Metallic at 0; Roughness and IOR distinguish plastic from rubber."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "BSDF 接到 Surface。", "Connect BSDF to Surface."),
    ],
    parameters: [
      param("金屬度", "Metallic", "0", "0"),
      param("粗糙度", "Roughness", "亮塑膠 0.1～0.3；橡膠 0.6～0.9", "Glossy plastic 0.1–0.3; rubber 0.6–0.9"),
      param("折射率", "IOR", "約 1.46～1.52", "About 1.46–1.52"),
    ],
    variants: [
      bi("加高頻 Bump＝霧面模具紋。", "Add high-frequency Bump for molded matte grain."),
      bi("用遮罩混合兩組 Roughness＝手摸區與未磨損區。", "Mask between two Roughness values for handled and untouched zones."),
    ],
    tutorialIds: ["tutorial_principled_bsdf_tour", "tutorial_pbr_roughness_microfacets", "tutorial_mask_strength_scaling"],
    presetIds: ["glossy_plastic", "matte_black_plastic", "rubber_grip"],
  },
  {
    id: "metal",
    preview: "metal",
    name: bi("金屬與拉絲金屬", "Metal and Brushed Metal"),
    cue: bi("金屬沒有一般漫射層；Base Color 會染色反射，高光方向可透露加工紋。", "Metal lacks a normal diffuse layer; Base Color tints reflection and highlight direction reveals machining."),
    chain: [
      node("coordinate", "座標", "Coordinates", "UV／物件座標", "UV / Object Coordinates", "拉絲需要穩定方向，先決定紋理沿哪一軸。", "Brushing needs a stable direction, so choose its axis first."),
      node("signal", "訊號", "Signal", "波浪紋理＋雜訊", "Wave Texture + Noise", "波浪給方向，雜訊打破過度規律。", "Waves provide direction; noise breaks perfect regularity."),
      node("shape", "塑形", "Shaping", "映射範圍／顏色漸變", "Map Range / Color Ramp", "把紋理限制成輕微粗糙度變化。", "Limit the pattern to subtle roughness variation."),
      node("surface", "表面", "Surface", "原理化 BSDF", "Principled BSDF", "Metallic 設為 1；色彩代表金屬反射色而不是塗料。", "Set Metallic to 1; color represents metal reflectance, not paint."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "BSDF 接到 Surface。", "Connect BSDF to Surface."),
    ],
    parameters: [
      param("金屬度", "Metallic", "1", "1"),
      param("粗糙度", "Roughness", "鏡面 0～0.05；拉絲 0.2～0.4", "Mirror 0–0.05; brushed 0.2–0.4"),
      param("各向異性", "Anisotropy", "拉絲可從 0.3～0.7 開始", "Start around 0.3–0.7 for brushing"),
    ],
    variants: [
      bi("降低 Roughness＝拋光；增加細長紋＝拉絲。", "Lower Roughness for polish; add fine directional bands for brushing."),
      bi("加入非金屬鏽層並用遮罩混合＝風化金屬。", "Mix in a non-metal rust layer with a mask for weathered metal."),
    ],
    tutorialIds: ["tutorial_pbr_metal_vs_dielectric", "tutorial_metal", "tutorial_car_paint_flakes"],
    presetIds: ["brushed_metal", "anodized_aluminum", "liquid_chrome"],
  },
  {
    id: "coated-paint",
    preview: "paint",
    name: bi("烤漆、清漆與塗層", "Paint, Clearcoat, and Coatings"),
    cue: bi("先分清底材與上方透明亮面層；刮痕通常只破壞其中一層。", "Separate the base from the transparent glossy layer above it; scratches often damage only one layer."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件座標", "Object Coordinates", "程序磨損跟著物件，避免移動物件時圖案漂移。", "Keep procedural wear attached to the object."),
      node("signal", "訊號", "Signal", "雜訊＋菲涅爾／層權重", "Noise + Fresnel / Layer Weight", "雜訊決定瑕疵，視角訊號決定邊緣反射。", "Noise places imperfections; view-angle signals shape edge reflection."),
      node("shape", "塑形", "Shaping", "顏色漸變", "Color Ramp", "把柔和訊號壓成可控制的塗層邊界。", "Turn soft signals into controllable coating boundaries."),
      node("surface", "表面", "Surface", "兩個 BSDF＋混合著色器", "Two BSDFs + Mix Shader", "底漆與清漆分層；遮罩決定哪一層露出。", "Layer base paint and coat; the mask decides what is revealed."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "混合後的 Shader 接到 Surface。", "Connect the mixed Shader to Surface."),
    ],
    parameters: [
      param("底材", "Base", "Metallic 依底材；油漆通常 0", "Metallic follows substrate; paint is usually 0"),
      param("清漆粗糙度", "Coat Roughness", "約 0.03～0.2", "About 0.03–0.2"),
      param("遮罩", "Mask", "黑＝A、白＝B", "Black = A, white = B"),
    ],
    variants: [
      bi("細白雜訊只進清漆 Roughness＝橘皮漆面。", "Fine noise into coat Roughness creates orange-peel paint."),
      bi("邊緣遮罩露出 Metallic=1 的底層＝掉漆。", "An edge mask revealing a Metallic=1 base creates chipped paint."),
    ],
    tutorialIds: ["tutorial_layer_weight_clearcoat", "tutorial_handbuilt_clearcoat", "tutorial_edge_wear_mask"],
    presetIds: ["powder_coated_metal", "ceramic_glaze", "peeling_paint_wood"],
  },
  {
    id: "glass-liquid",
    preview: "glass",
    name: bi("玻璃、液體與半透明材質", "Glass, Liquids, and Translucency"),
    cue: bi("透光不等於 Alpha；先判斷是折射、模糊透射，還是只讓光穿過。", "Transmission is not Alpha; decide whether you need refraction, blurred transmission, or simple translucency."),
    chain: [
      node("coordinate", "座標", "Coordinates", "通常不需要／UV", "Usually None / UV", "均勻玻璃可直接從著色器開始；污漬才需要座標。", "Uniform glass can start at the shader; dirt requires coordinates."),
      node("signal", "訊號", "Signal", "常數／低強度雜訊", "Constant / Low-strength Noise", "雜訊只用於霧感、刮痕或厚度差。", "Use noise only for frost, scratches, or thickness variation."),
      node("shape", "塑形", "Shaping", "映射範圍", "Map Range", "把雜訊限制在合理 Roughness，避免整片失去透射。", "Keep noise inside a useful Roughness range so transmission remains."),
      node("surface", "表面", "Surface", "Glass BSDF／原理化透射", "Glass BSDF / Principled Transmission", "IOR 控折射，Roughness 控穿透影像模糊程度。", "IOR controls refraction; Roughness controls transmitted blur."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "透光 Shader 接到 Surface；不是接 Alpha。", "Connect the transmissive Shader to Surface, not Alpha."),
    ],
    parameters: [
      param("折射率", "IOR", "水 1.33；玻璃約 1.52；鑽石 2.42", "Water 1.33; glass about 1.52; diamond 2.42"),
      param("粗糙度", "Roughness", "清玻璃 0～0.08；毛玻璃 0.35～0.8", "Clear 0–0.08; frosted 0.35–0.8"),
      param("薄壁", "Thin Wall", "只適合零厚度薄片近似", "Use only for zero-thickness sheet approximation"),
    ],
    variants: [
      bi("Noise → Roughness＝毛玻璃；Noise → Color 不會產生同一效果。", "Noise → Roughness makes frost; Noise → Color does not."),
      bi("玻璃與透明 Shader 用遮罩混合＝破洞或貼花區。", "Mask between Glass and Transparent for holes or decal areas."),
    ],
    tutorialIds: ["tutorial_glass", "tutorial_transmission_shaders_compared", "tutorial_frosted_glass"],
    presetIds: ["glass", "frosted_scratched_glass", "translucent_packaging"],
  },
  {
    id: "skin-wax",
    preview: "skin",
    name: bi("皮膚、蠟與乳狀材質", "Skin, Wax, and Milky Materials"),
    cue: bi("重點不是透明，而是光進入表面後在內部走一段距離再出來。", "The key is not transparency but light traveling under the surface before exiting."),
    chain: [
      node("coordinate", "座標", "Coordinates", "UV／物件座標", "UV / Object Coordinates", "圖片皮膚用 UV；程序蠟紋可用物件座標。", "Use UV for image skin; Object Coordinates for procedural wax."),
      node("signal", "訊號", "Signal", "圖像／低頻雜訊", "Image / Low-frequency Noise", "控制膚色、血色或蠟內部濃淡。", "Control skin tone, blood variation, or wax density."),
      node("shape", "塑形", "Shaping", "顏色漸變＋映射範圍", "Color Ramp + Map Range", "分開控制顏色與散射量，不要讓同一訊號失控。", "Control color and scattering amount separately."),
      node("surface", "表面", "Surface", "SSS／原理化 BSDF＋微高光", "SSS / Principled + Subtle Gloss", "散射形成柔軟內部感，高光保留表皮油脂或蠟面。", "Scattering gives internal softness while gloss preserves the outer surface."),
      node("output", "輸出", "Output", "加法／混合 → 材質輸出", "Add / Mix → Material Output", "先組好表皮與散射，再送進 Surface。", "Combine skin surface and scatter before Surface output."),
    ],
    parameters: [
      param("散射半徑", "SSS Radius", "紅色通常走得比藍色遠", "Red usually travels farther than blue"),
      param("散射尺度", "SSS Scale", "依模型真實尺寸調整", "Tune to the model's real scale"),
      param("表面粗糙度", "Surface Roughness", "皮膚約 0.3～0.5", "Skin around 0.3–0.5"),
    ],
    variants: [
      bi("增加暖色散射與微弱發光＝蠟燭。", "Add warm scattering and subtle emission for candle wax."),
      bi("低頻雜訊驅動 SSS 顏色＝玉石或乳白石。", "Low-frequency noise driving SSS color creates jade or milky stone."),
    ],
    tutorialIds: ["tutorial_skin_sss", "tutorial_sss_texture_driven_color", "tutorial_candle_wax_glow"],
    presetIds: ["skin", "wet_flesh", "jade_stone"],
  },
  {
    id: "fabric",
    preview: "fabric",
    name: bi("布料、絨面與網紗", "Fabric, Velvet, and Mesh"),
    cue: bi("布料通常粗糙，輪廓處有纖維柔光；織紋方向必須跟 UV 或物件軸一致。", "Fabric is usually rough with soft fiber response at edges; weave direction must follow UV or object axes."),
    chain: [
      node("coordinate", "座標", "Coordinates", "UV", "UV", "織紋有明確方向，UV 最容易精準控制。", "Weaves are directional, making UV the most controllable choice."),
      node("signal", "訊號", "Signal", "交錯波浪／圖像紋理", "Crossed Waves / Image Texture", "兩組不同方向的細紋近似經緯線。", "Fine bands in two directions approximate warp and weft."),
      node("shape", "塑形", "Shaping", "顏色漸變＋低強度 Bump", "Color Ramp + Low-strength Bump", "保留纖維層次，但不要改壞整體輪廓。", "Keep fiber relief without damaging the overall silhouette."),
      node("surface", "表面", "Surface", "原理化 BSDF＋Sheen", "Principled BSDF + Sheen", "高 Roughness 控布面，Sheen 補上掠視角纖維反射。", "High Roughness shapes cloth; Sheen adds grazing-angle fiber reflection."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "布料 Shader 接到 Surface。", "Connect the fabric Shader to Surface."),
    ],
    parameters: [
      param("粗糙度", "Roughness", "約 0.7～1", "About 0.7–1"),
      param("光澤權重", "Sheen Weight", "約 0.2～0.8", "About 0.2–0.8"),
      param("凹凸強度", "Bump Strength", "保持細微，避免像繩索", "Keep subtle to avoid rope-like relief"),
    ],
    variants: [
      bi("Sheen 提高、底色變深＝天鵝絨。", "Raise Sheen and darken the base for velvet."),
      bi("織紋遮罩混合 Transparent＝網紗或蕾絲。", "Mix Transparent with a weave mask for mesh or lace."),
    ],
    tutorialIds: ["tutorial_velvet_sheen", "tutorial_dual_tone_fabric_colorway", "tutorial_torn_holes"],
    presetIds: ["velvet", "denim_fabric", "lace_mesh"],
  },
  {
    id: "wood",
    preview: "wood",
    name: bi("木材與年輪", "Wood and Growth Rings"),
    cue: bi("木紋不是隨機噪點：它有生長方向、長波形與小尺度孔隙。", "Wood is not random speckle; it has growth direction, long waves, and fine pores."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件座標＋映射", "Object Coordinates + Mapping", "先讓年輪沿模型正確方向生長。", "Orient growth rings along the correct model axis."),
      node("signal", "訊號", "Signal", "波浪紋理＋雜訊失真", "Wave Texture + Noise Distortion", "波浪提供年輪，雜訊讓它不會像機器畫的。", "Waves form rings; noise keeps them organic."),
      node("shape", "塑形", "Shaping", "顏色漸變", "Color Ramp", "把連續波形變成深淺木色與硬軟邊界。", "Map the waveform into wood colors and edge hardness."),
      node("surface", "表面", "Surface", "原理化 BSDF＋Bump", "Principled BSDF + Bump", "同一訊號可低強度控制顏色、粗糙度與凹凸。", "Reuse the signal subtly for color, roughness, and bump."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "BSDF 接到 Surface。", "Connect BSDF to Surface."),
    ],
    parameters: [
      param("波浪類型", "Wave Type", "Rings 做年輪；Bands 做直紋", "Rings for growth rings; Bands for linear grain"),
      param("尺度", "Scale", "先定主紋，再補高頻細節", "Set main grain first, then add fine detail"),
      param("粗糙度", "Roughness", "原木 0.6～0.8；上漆木 0.2～0.4", "Raw 0.6–0.8; varnished 0.2–0.4"),
    ],
    variants: [
      bi("同一木紋訊號輕微接 Bump＝木孔。", "Feed the same grain subtly into Bump for pores."),
      bi("再疊低頻遮罩混合深色＝受潮或老化。", "Layer a low-frequency dark mask for damp or aged wood."),
    ],
    tutorialIds: ["tutorial_wave_texture_tour", "tutorial_wood", "tutorial_layer_stack_blend"],
    presetIds: ["procedural_wood", "stained_wood_inlay", "cork_board"],
  },
  {
    id: "stone-concrete",
    preview: "stone",
    name: bi("石材、水泥與地形", "Stone, Concrete, and Terrain"),
    cue: bi("大尺度決定地層與色塊，小尺度決定孔洞與粗糙；兩者不要用同一頻率。", "Large scale defines strata and color regions; small scale defines pores and roughness. Keep their frequencies separate."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件／生成座標", "Object / Generated Coordinates", "適合無接縫程序紋理，也方便統一尺度。", "Useful for seamless procedural texture and consistent scale."),
      node("signal", "訊號", "Signal", "低頻 Noise＋Voronoi＋高頻 Noise", "Low Noise + Voronoi + High Noise", "分工處理地層、裂紋與微孔。", "Separate strata, cracks, and pores into different signals."),
      node("shape", "塑形", "Shaping", "顏色漸變＋Math", "Color Ramp + Math", "先把每個訊號調乾淨，再疊加或相乘。", "Shape each signal cleanly before adding or multiplying."),
      node("surface", "表面", "Surface", "原理化 BSDF＋Bump／Displacement", "Principled + Bump / Displacement", "微細節用 Bump；會改輪廓的高度才用位移。", "Use Bump for microdetail and Displacement only when silhouette must change."),
      node("output", "輸出", "Output", "Surface＋Displacement", "Surface + Displacement", "表面與位移走不同輸入，不能互接。", "Surface and Displacement use separate output sockets."),
    ],
    parameters: [
      param("粗糙度", "Roughness", "多半 0.7～1", "Usually 0.7–1"),
      param("凹凸", "Bump", "小尺度、低距離", "Small scale, low distance"),
      param("位移", "Displacement", "需要足夠網格密度", "Requires enough mesh density"),
    ],
    variants: [
      bi("高度經 Color Ramp 分段上色＝海岸、草地、岩石、雪。", "Ramp height into coast, grass, rock, and snow bands."),
      bi("Voronoi Distance to Edge 強化＝裂縫或石塊邊界。", "Sharpen Voronoi Distance to Edge for cracks or block boundaries."),
    ],
    tutorialIds: ["tutorial_noise_texture_tour", "tutorial_voronoi_nsphere_bump_clusters", "tutorial_terrain_height_map"],
    presetIds: ["polished_concrete", "granite_facade", "sandstone_cliff"],
  },
  {
    id: "weathering",
    preview: "rust",
    name: bi("鏽蝕、污漬與邊緣磨損", "Rust, Grime, and Edge Wear"),
    cue: bi("風化不是單純換顏色；金屬度、粗糙度與凹凸也要跟著同一遮罩改變。", "Weathering is not just color; metallic, roughness, and bump should respond to the same mask."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件座標", "Object Coordinates", "污漬與鏽斑固定在物件表面。", "Keep grime and rust attached to the object."),
      node("signal", "訊號", "Signal", "Noise／Voronoi＋菲涅爾", "Noise / Voronoi + Fresnel", "隨機訊號做斑駁，視角訊號近似邊緣。", "Random signals make patches; view angle approximates edges."),
      node("shape", "塑形", "Shaping", "顏色漸變＋Multiply", "Color Ramp + Multiply", "先硬化斑塊，再與邊緣或高度條件相乘。", "Sharpen patches, then multiply by edge or height conditions."),
      node("surface", "表面", "Surface", "混合兩套完整表面", "Mix Two Complete Surfaces", "乾淨金屬與非金屬鏽層各有自己的顏色、粗糙度和凹凸。", "Clean metal and non-metal rust each need color, roughness, and bump."),
      node("output", "輸出", "Output", "混合著色器 → 材質輸出", "Mix Shader → Material Output", "遮罩接 Fac，兩層 Shader 接 A/B。", "Mask drives Fac; the two shaders feed A and B."),
    ],
    parameters: [
      param("乾淨層", "Clean Layer", "Metallic=1、較低 Roughness", "Metallic=1, lower Roughness"),
      param("鏽層", "Rust Layer", "Metallic=0、Roughness 約 0.7～1", "Metallic=0, Roughness about 0.7–1"),
      param("遮罩對比", "Mask Contrast", "控制鏽斑邊界與覆蓋率", "Controls rust boundary and coverage"),
    ],
    variants: [
      bi("遮罩接 Roughness 但不改 Metallic＝只是髒金屬，不是真鏽。", "If only Roughness changes, it is dirty metal rather than true rust."),
      bi("Edge mask 與 Noise 相乘＝只在邊緣出現不規則磨損。", "Multiply edge mask by Noise for irregular edge-only wear."),
    ],
    tutorialIds: ["tutorial_mix_color_grime", "tutorial_edge_wear_mask", "tutorial_rust_weathering"],
    presetIds: ["rust_metal", "copper_patina", "weathered_stucco"],
  },
  {
    id: "wet-surface",
    preview: "wet",
    name: bi("濕表面、積水與油污", "Wet Surfaces, Puddles, and Oil"),
    cue: bi("濕潤最明顯的不是變藍，而是顏色變深、粗糙度下降、反射變集中。", "Wetness is not blue tint; it darkens color, lowers roughness, and concentrates reflection."),
    chain: [
      node("coordinate", "座標", "Coordinates", "物件／世界座標", "Object / World Coordinates", "物件污漬用 Object；跨場景水位可用 World。", "Use Object for attached stains; World for a shared scene water level."),
      node("signal", "訊號", "Signal", "低頻 Noise＋高度條件", "Low-frequency Noise + Height Condition", "雜訊做積水邊界，高度讓水更常停在低處。", "Noise shapes puddle edges; height favors low areas."),
      node("shape", "塑形", "Shaping", "顏色漸變＋Map Range", "Color Ramp + Map Range", "控制水區覆蓋率與邊緣軟硬。", "Control wet coverage and edge softness."),
      node("surface", "表面", "Surface", "同一遮罩驅動 Base Color 與 Roughness", "One Mask Drives Base Color and Roughness", "水區顏色稍深、Roughness 明顯較低；必要時再混合清漆層。", "Wet zones are darker and much smoother; add a coat layer if needed."),
      node("output", "輸出", "Output", "原理化／混合著色器 → 輸出", "Principled / Mix Shader → Output", "先確認遮罩同時進到所有相關屬性。", "Ensure the mask reaches every related property."),
    ],
    parameters: [
      param("乾區粗糙度", "Dry Roughness", "依底材，通常 0.6～1", "Depends on base, often 0.6–1"),
      param("濕區粗糙度", "Wet Roughness", "約 0.05～0.25", "About 0.05–0.25"),
      param("濕區顏色", "Wet Color", "同色系略暗，不是固定藍色", "Slightly darker base hue, not fixed blue"),
    ],
    variants: [
      bi("加入薄膜／彩虹色＝油膜。", "Add thin-film iridescence for oil sheen."),
      bi("水區再接低強度 Bump＝細小水波。", "Add low-strength Bump inside wet areas for ripples."),
    ],
    tutorialIds: ["tutorial_mask_strength_scaling", "tutorial_puddle_wetness", "tutorial_layer_stack_blend"],
    presetIds: ["wet_concrete", "wet_mud", "ocean_foam"],
  },
  {
    id: "gem-iridescent",
    preview: "gem",
    name: bi("寶石、蛋白石與虹彩", "Gemstones, Opal, and Iridescence"),
    cue: bi("寶石通常同時包含透射、內部色彩變化與高 IOR；虹彩則強烈依觀看角度改色。", "Gems combine transmission, internal color variation, and high IOR; iridescence changes strongly with view angle."),
    chain: [
      node("coordinate", "座標", "Coordinates", "生成座標＋法線／菲涅爾", "Generated + Normal / Fresnel", "一組描述內部位置，一組描述觀看角度。", "One signal describes internal position, another view angle."),
      node("signal", "訊號", "Signal", "Noise／Voronoi＋Facing", "Noise / Voronoi + Facing", "程序紋理做內含物，視角訊號做變色。", "Procedural texture makes inclusions; view angle drives color shift."),
      node("shape", "塑形", "Shaping", "兩組顏色漸變", "Two Color Ramps", "內部色與角度色分開調，再以低比例混合。", "Tune internal and angle colors separately, then blend subtly."),
      node("surface", "表面", "Surface", "高 IOR 玻璃／原理化透射＋清漆", "High-IOR Glass / Transmission + Coat", "保留清晰外殼反射，同時讓內部色澤可見。", "Keep a clear shell reflection while revealing internal color."),
      node("output", "輸出", "Output", "混合後 Shader → 材質輸出", "Combined Shader → Material Output", "最後再檢查是否因混合過強而失去透射。", "Verify that excessive mixing has not destroyed transmission."),
    ],
    parameters: [
      param("折射率", "IOR", "石英 1.54；紅藍寶 1.77；鑽石 2.42", "Quartz 1.54; sapphire/ruby 1.77; diamond 2.42"),
      param("粗糙度", "Roughness", "拋光寶石通常 0～0.12", "Polished gems usually 0–0.12"),
      param("混色比例", "Color Blend", "先從 0.05～0.25 開始", "Start around 0.05–0.25"),
    ],
    variants: [
      bi("低頻彩色雲霧＋SSS＝玉石。", "Low-frequency colored clouds plus SSS create jade."),
      bi("Facing 經彩虹 Ramp＝視角虹彩或薄膜。", "Facing through a rainbow ramp creates view-dependent iridescence."),
    ],
    tutorialIds: ["tutorial_color_ramp_tour", "tutorial_opal_gem_gradient", "tutorial_fresnel_tour"],
    presetIds: ["agate", "jade_stone", "magic_crystal"],
  },
  {
    id: "emission-fx",
    preview: "emission",
    name: bi("發光、霓虹與動態特效", "Emission, Neon, and Animated FX"),
    cue: bi("把『哪裡發光』與『發多亮』分開；動畫訊號要先限制範圍再接強度。", "Separate where emission appears from how bright it is; constrain animation before driving strength."),
    chain: [
      node("coordinate", "座標", "Coordinates", "UV／物件座標／場景時間", "UV / Object / Scene Time", "空間座標決定圖案位置，時間提供動畫相位。", "Spatial coordinates place the pattern; time provides animation phase."),
      node("signal", "訊號", "Signal", "波浪／Noise／Sine", "Wave / Noise / Sine", "紋理決定發光區，Sine 讓亮度循環。", "Texture selects glowing zones; Sine cycles intensity."),
      node("shape", "塑形", "Shaping", "顏色漸變＋Map Range＋Clamp", "Color Ramp + Map Range + Clamp", "把 -1～1 或任意紋理整理成安全的顏色與強度。", "Turn -1–1 or arbitrary texture into safe color and intensity ranges."),
      node("surface", "表面", "Surface", "Emission／Add Shader", "Emission / Add Shader", "發光可單獨輸出，也可加在可見底材上。", "Emission can stand alone or be added over a visible base."),
      node("output", "輸出", "Output", "材質輸出", "Material Output", "Shader 接 Surface；網站發光不會照亮旁邊物體。", "Connect Shader to Surface; site emission does not light nearby objects."),
    ],
    parameters: [
      param("強度", "Strength", "先從 1～5，依曝光再調", "Start at 1–5, then tune for exposure"),
      param("時間循環", "Time Loop", "Seconds → Sine → Map Range", "Seconds → Sine → Map Range"),
      param("色溫", "Temperature", "燭火約 1800～2200K", "Candle flame about 1800–2200K"),
    ],
    variants: [
      bi("Blackbody 控色＋Noise 控強度＝火焰或熔岩。", "Blackbody for color plus Noise for strength creates flame or lava."),
      bi("Fresnel 反轉後接 Emission＝核心亮、邊緣淡。", "Invert Fresnel into Emission for a bright core and soft edge."),
    ],
    tutorialIds: ["tutorial_neon_sign", "tutorial_blackbody_glow", "tutorial_scene_time_pulse"],
    presetIds: ["neon_emission", "neon_glass_tube", "pixel_energy"],
  },
  {
    id: "stylized",
    preview: "toon",
    name: bi("卡通、全息與風格化材質", "Toon, Hologram, and Stylized Materials"),
    cue: bi("風格化不是忽略原理，而是刻意把連續光影量化、反轉或只保留特定訊號。", "Stylization uses the same principles but deliberately quantizes, inverts, or isolates signals."),
    chain: [
      node("coordinate", "座標", "Coordinates", "法線／Facing／線框", "Normal / Facing / Wireframe", "先選一個能代表造型或觀看角度的訊號。", "Choose a signal representing shape or view angle."),
      node("signal", "訊號", "Signal", "Dot Product／Fresnel／Wireframe", "Dot Product / Fresnel / Wireframe", "把幾何資訊轉成可用的 0～1 遮罩。", "Convert geometric information into a usable 0–1 mask."),
      node("shape", "塑形", "Shaping", "常數顏色漸變／Math", "Constant Color Ramp / Math", "硬切成兩到四段，或反轉只保留輪廓。", "Cut into two to four hard bands or invert to keep only silhouettes."),
      node("surface", "表面", "Surface", "原理化／Emission／Transparent", "Principled / Emission / Transparent", "依風格選擇受光、純色發光或局部透明。", "Choose lit shading, flat emission, or local transparency."),
      node("output", "輸出", "Output", "混合結果 → 材質輸出", "Mixed Result → Material Output", "所有風格層仍需形成一條完整輸出路徑。", "Every stylized layer still needs a complete output path."),
    ],
    parameters: [
      param("色階數", "Band Count", "常見 2～4 段", "Usually 2–4 bands"),
      param("邊界", "Edges", "Constant Ramp 做硬邊；Ease 做柔邊", "Constant Ramp for hard edges; Ease for soft"),
      param("發光", "Emission", "用遮罩限制，不要整片爆亮", "Constrain with a mask instead of glowing everywhere"),
    ],
    variants: [
      bi("硬邊 Ramp＋受光訊號＝卡通分色。", "Hard ramp plus lighting signal creates toon bands."),
      bi("Wireframe＋Emission＋Transparent＝全息線框。", "Wireframe plus Emission and Transparent creates a hologram."),
    ],
    tutorialIds: ["tutorial_toon_style_banding", "tutorial_wireframe_fx", "tutorial_fresnel_invert_core_glow"],
    presetIds: ["holographic", "galaxy_nebula", "checker_toy"],
  },
];

// 看到成品不對時，先用症狀縮小問題範圍；每一則都區分「原因」與「修法」，
// 避免使用者只記住某個數字，卻不知道錯在訊號、表面或輸出哪一層。
export const materialDiagnostics = {
  "plastic-rubber": [
    issue("看起來像金屬，不像塑膠", "Looks metallic instead of plastic", "Metallic 大於 0，或環境沒有能映在塑膠高光上的亮面。", "Metallic is above 0, or the environment lacks bright shapes for plastic highlights.", "先把 Metallic 歸零，再用 Roughness 調高光寬度；確認場景有面光或 HDRI。", "Reset Metallic to 0, shape highlight width with Roughness, and provide an area light or HDRI."),
    issue("細紋像石頭坑洞", "Fine grain looks like stone craters", "高頻 Noise 的對比、Bump Strength 或 Distance 太高。", "High-frequency Noise contrast, Bump Strength, or Distance is too high.", "先把 Bump 拔掉確認底材，再把訊號壓回很窄的範圍，以近距離才看得到為準。", "Disconnect Bump to verify the base, then compress the signal until it is visible only up close."),
  ],
  metal: [
    issue("金屬整顆黑掉", "The metal turns nearly black", "金屬主要反射環境；沒有亮區可反射時，不會像有漫射層的塑膠一樣自己亮。", "Metal reflects its environment; without bright surroundings it does not self-light like a diffuse plastic.", "先加入大面積亮光或 HDRI，再判斷 Base Color 與 Roughness。", "Add a large bright source or HDRI before judging Base Color and Roughness."),
    issue("拉絲只有斑點，沒有方向", "Brushing is speckled with no direction", "紋理沒有沿穩定座標軸拉長，或只有 Noise 沒有方向性波形。", "The texture is not stretched along a stable axis, or uses Noise without a directional wave.", "用 Mapping 對準軸向，讓 Wave/Bands 提供主方向，Noise 只負責打破規律。", "Align an axis with Mapping, use Wave/Bands for direction, and let Noise only break regularity."),
  ],
  "coated-paint": [
    issue("清漆層幾乎看不見", "The clear coat is barely visible", "底層與上層粗糙度太接近，或沒有掠視角高光可供比較。", "Base and coat roughness are too similar, or there is no grazing highlight for comparison.", "降低 Coat Roughness，旋轉光源觀察邊緣，再逐步增加瑕疵。", "Lower Coat Roughness, rotate the light to inspect edges, then add imperfections gradually."),
    issue("掉漆變成整片換色", "Chipped paint becomes a full color swap", "遮罩未經 Color Ramp 收斂，或把視角邊緣直接當成真實磨損。", "The mask is not tightened with a Color Ramp, or a view-angle rim is treated as real wear.", "先單獨預覽黑白遮罩，用 Ramp 控覆蓋率，再乘上 Noise 打散規律邊緣。", "Preview the mask in black and white, control coverage with a Ramp, then multiply by Noise."),
  ],
  "glass-liquid": [
    issue("只有變淡，沒有玻璃折射", "It only fades instead of refracting", "調的是 Alpha 或 Transparent，而不是透射／Glass Shader。", "Alpha or Transparent is being changed instead of Transmission or a Glass Shader.", "改用 Glass BSDF 或 Principled Transmission，設定合理 IOR，並保留可反射的環境。", "Use Glass BSDF or Principled Transmission, set a plausible IOR, and keep an environment to reflect."),
    issue("玻璃發黑或邊緣怪異", "Glass turns dark or has broken edges", "模型法線、重疊面或厚度不合理；高 Roughness 也可能吃掉清晰透射。", "Normals, overlapping faces, or thickness are wrong; high Roughness can also erase clear transmission.", "先用有厚度、法線朝外的簡單模型測試，再逐一恢復粗糙度與污漬。", "Test on a simple solid with outward normals, then restore roughness and dirt one at a time."),
  ],
  "skin-wax": [
    issue("像塑膠，沒有柔軟內部感", "It looks plastic with no subsurface softness", "SSS Weight 太低、Scale 不符合模型尺寸，或只有表面高光。", "SSS Weight is too low, Scale does not match object size, or only surface gloss is present.", "先用單色與柔光校正 SSS Scale，再加回膚色紋理與微高光。", "Calibrate SSS Scale under soft light with a solid color, then restore skin texture and micro-gloss."),
    issue("像整塊發亮的蠟，細節消失", "It looks like glowing wax and loses detail", "散射距離或發光太強，把表面法線與顏色變化洗掉。", "Scattering distance or emission is too strong and washes out normals and color variation.", "降低 SSS Scale／Emission，保留一層較清晰的表面高光作為外殼。", "Reduce SSS Scale or Emission and retain a sharper surface highlight as the outer shell."),
  ],
  fabric: [
    issue("布料像亮塑膠", "The fabric looks like glossy plastic", "Roughness 太低，Sheen 或纖維方向感沒有建立。", "Roughness is too low and Sheen or fiber direction is missing.", "先提高 Roughness，再從低值加入 Sheen；最後才疊細微織紋 Bump。", "Raise Roughness first, add Sheen gradually, and only then layer subtle weave Bump."),
    issue("織紋拉伸或移動後漂浮", "The weave stretches or floats when moved", "使用不適合的座標，或 UV 比例與布料方向不一致。", "The wrong coordinate source is used, or UV scale does not follow the fabric direction.", "用棋盤格檢查 UV，再讓兩組交錯紋沿 U/V 軸排列。", "Check UVs with a checker, then align the two crossed patterns along U and V."),
  ],
  wood: [
    issue("木紋像規則斑馬線", "The grain looks like regular zebra stripes", "只使用 Wave，沒有低頻扭曲與尺度分工。", "Only Wave is used, without low-frequency distortion or separate scales.", "用低頻 Noise 扭曲座標，主年輪與細孔使用不同頻率。", "Distort coordinates with low-frequency Noise and use separate frequencies for rings and pores."),
    issue("切面方向完全錯誤", "The cut direction is completely wrong", "Mapping 軸沒有配合模型的生長方向。", "The Mapping axis does not match the model's growth direction.", "先用 Gradient 或分離 XYZ 顯示座標方向，再旋轉 Mapping；最後才接回木紋。", "Visualize axes with Gradient or Separate XYZ, rotate Mapping, then reconnect the wood pattern."),
  ],
  "stone-concrete": [
    issue("只是彩色噪點，不像石頭", "It is colored noise rather than stone", "同一份 Noise 同時包辦所有尺度，而且只改 Base Color。", "One Noise signal handles every scale and only changes Base Color.", "分開大色塊、裂縫與微孔，讓其中一部分同時控制 Roughness 或 Bump。", "Separate broad color, cracks, and pores, and let some of them also affect Roughness or Bump."),
    issue("位移沒反應或整個炸開", "Displacement is flat or explodes", "網格密度不足、Scale 過高，或高度沒有先限制到安全範圍。", "Mesh density is insufficient, Scale is too high, or height was not constrained first.", "先用 Bump 驗證高度訊號，再細分網格並從極小 Displacement Scale 開始。", "Verify the height with Bump, subdivide the mesh, and start with a tiny Displacement Scale."),
  ],
  weathering: [
    issue("鏽層仍然像亮金屬", "The rust still looks metallic", "只有顏色變橘，Metallic 與 Roughness 沒有跟遮罩一起改。", "Only color turns orange; Metallic and Roughness do not follow the mask.", "把鏽層設為 Metallic 0、高 Roughness，再用同一遮罩混合完整的兩套表面。", "Make rust Metallic 0 with high Roughness, then mask between two complete surfaces."),
    issue("鏽蝕平均鋪滿整個物件", "Rust covers the object uniformly", "遮罩對比不足，或沒有結合位置、縫隙與隨機條件。", "Mask contrast is weak or lacks positional, crevice, and random conditions.", "先用 Color Ramp 定覆蓋率，再乘上 Noise 與高度／邊緣條件；逐層預覽。", "Set coverage with a Color Ramp, multiply by Noise and height or edge conditions, and preview each layer."),
  ],
  "wet-surface": [
    issue("只是顏色變深，沒有濕亮感", "It only darkens without looking wet", "濕區遮罩沒有同時降低 Roughness。", "The wet mask does not also lower Roughness.", "讓同一遮罩同時混合較深 Base Color 與較低 Roughness，並用大光源檢查反射。", "Use the same mask for darker Base Color and lower Roughness, then check reflection under a large light."),
    issue("積水像藍色油漆", "Puddles look like blue paint", "用藍色代表水，卻沒有處理高度、反射與薄層界面。", "Blue color is used to represent water without height, reflection, or a thin interface.", "保留底材色系，只略微壓暗；以高度條件、低 Roughness 與必要的薄清漆層建立濕感。", "Keep the base hue and darken slightly; use height, low Roughness, and an optional thin coat."),
  ],
  "gem-iridescent": [
    issue("寶石看起來像透明塑膠", "The gem looks like transparent plastic", "IOR、透射與外殼高光沒有形成清楚的內外層次。", "IOR, transmission, and shell highlights do not create distinct inner and outer layers.", "先做無紋理的乾淨高 IOR 寶石，再低比例加入內含物與顏色變化。", "Build a clean high-IOR gem first, then add inclusions and color variation at low strength."),
    issue("虹彩整片都是彩虹色", "Iridescence becomes a flat rainbow", "Facing/Fresnel 沒有重新塑形，或彩色訊號混合比例過高。", "Facing or Fresnel is not remapped, or the colored signal is mixed too strongly.", "單獨預覽視角遮罩，用 Ramp 壓縮變色區，再從 5%～25% 混入。", "Preview the view-angle mask, compress it with a Ramp, then blend at roughly 5%–25%."),
  ],
  "emission-fx": [
    issue("整片死白，紋理不見了", "Everything clips to white and the pattern disappears", "Emission Strength、曝光或動畫範圍過高。", "Emission Strength, exposure, or the animation range is too high.", "先用 Emission-only 檢查 0～1 遮罩，Clamp 後再映射到較小強度。", "Inspect the 0–1 mask with emission-only output, Clamp it, then map to a modest strength."),
    issue("有顏色但不像在發光", "It has color but does not feel emissive", "訊號只接到 Base Color，或發光區與不發光底材沒有亮度對比。", "The signal reaches only Base Color, or glowing and non-glowing regions lack luminance contrast.", "把遮罩接到 Emission Color／Strength，保留較暗底材；注意網站發光不會照亮旁邊物體。", "Drive Emission Color or Strength with the mask and keep a darker base; site emission does not light nearby objects."),
  ],
  stylized: [
    issue("色階只剩一整片顏色", "The bands collapse into one flat color", "送進 Ramp 的訊號範圍太窄，所有值都落在同一停駐點。", "The Ramp input range is too narrow, so every value lands on one stop.", "先把訊號接 Emission 看灰階，用 Map Range 拉滿 0～1，再設定 2～4 個 Constant 色階。", "View the signal as grayscale emission, expand it to 0–1 with Map Range, then set 2–4 Constant bands."),
    issue("全息透明後整個物件消失", "The hologram vanishes after adding transparency", "Mix Factor 方向反了，或 Emission／Transparent 沒有形成完整 Shader 輸出。", "The Mix Factor is reversed, or Emission and Transparent do not form a complete shader output.", "把 Fac 暫時設 0 和 1 檢查 A/B，再接回 Wireframe 或 Fresnel 遮罩。", "Set Fac to 0 and 1 to verify A and B, then reconnect the Wireframe or Fresnel mask."),
  ],
};
