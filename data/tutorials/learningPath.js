// 完整學習路徑：把全站教學由「參考庫」整理成一條真正能走完的課程。
// 每篇教學只出現一次，順序刻意從可觀察的材質現象，逐步走到座標、數學、
// 程序紋理、遮罩、表面細節、光線互動與複雜案例。新增教學時除了加入 index.js，
// 也要把它放進最合適的階段，讓主線持續涵蓋全站內容。

const step = (tutorialId, zh, en) => ({ tutorialId, note: { zh, en } });

export default [
  {
    id: "first-graph",
    title: { zh: "第一階段：先看懂材質為什麼會有不同外觀", en: "Stage 1: Why Materials Look Different" },
    summary: {
      zh: "先建立 PBR 直覺：顏色、金屬度、粗糙度、透射與座標各自控制什麼。",
      en: "Build PBR intuition first: what color, metallic, roughness, transmission, and coordinates actually control.",
    },
    steps: [
      step("tutorial_principled_bsdf_tour", "先認識材質的控制中心，之後每個案例都會回到它。", "Meet the material control center that nearly every later case returns to."),
      step("tutorial_pbr_metal_vs_dielectric", "理解金屬與非金屬的反射差異，不再靠猜 Metallic。", "Understand metal versus dielectric reflection instead of guessing the Metallic value."),
      step("tutorial_pbr_roughness_microfacets", "從微表面理解高光為什麼變寬，而不是只背滑桿效果。", "Use microfacets to understand why highlights spread instead of memorizing a slider."),
      step("tutorial_glass", "完成第一個透光材質，練習最基本的加節點與接線。", "Finish a first transmissive material while practicing the basic graph workflow."),
      step("tutorial_uv_mapping", "認識紋理座標與縮放；圖案放在哪裡，從這裡開始。", "Learn texture coordinates and scale—the starting point for pattern placement."),
      step("tutorial_checker_texture_tour", "用棋盤格把抽象座標變成看得見的格線。", "Make abstract coordinates visible with a checker grid."),
    ],
  },
  {
    id: "coordinates-vectors",
    title: { zh: "第二階段：座標、方向與向量", en: "Stage 2: Coordinates, Directions, and Vectors" },
    summary: {
      zh: "搞懂圖案如何跟著物件、如何旋轉與拉伸，以及方向資料為什麼不能當一般顏色處理。",
      en: "Learn how patterns follow, rotate, and stretch—and why direction data is not ordinary color data.",
    },
    steps: [
      step("tutorial_mapping_types_tour", "比較 Mapping 四種 Type，理解同一組數值為何會得到不同結果。", "Compare all four Mapping types and see why identical values can behave differently."),
      step("tutorial_vector_transform_spaces", "在物件、世界與相機空間之間轉換，避免貼圖跟錯座標系。", "Transform between object, world, and camera spaces so patterns follow the intended frame."),
      step("tutorial_xyz_split", "拆開 XYZ，只改一個方向，做出非等比拉伸。", "Split XYZ and alter one axis for non-uniform shaping."),
      step("tutorial_vector_rotate", "旋轉取樣方向，學會把貼圖角度轉正。", "Rotate sampling directions to orient a pattern correctly."),
      step("tutorial_vector_math_tour", "用長度、正規化與外積建立向量運算直覺。", "Build vector intuition with Length, Normalize, and Cross Product."),
      step("tutorial_compass_material", "複合案例：用向量數學做出永遠指向固定方向的羅盤。", "Capstone: use vector math to build a compass that keeps pointing in one direction."),
      step("tutorial_normal_compare", "手動比較法線方向，理解明暗判斷背後的點積概念。", "Compare normal directions and understand the dot-product idea behind lighting masks."),
      step("tutorial_vector_curves", "用曲線非線性扭曲方向資料，觀察法線如何改變反光。", "Nonlinearly reshape direction data and observe how normals alter reflection."),
    ],
  },
  {
    id: "values-colors",
    title: { zh: "第三階段：數值塑形與顏色控制", en: "Stage 3: Shaping Values and Color" },
    summary: {
      zh: "把 0～1 數值當成可塑造的訊號：調範圍、做閾值、改曲線，再把它轉成顏色。",
      en: "Treat 0–1 values as shapeable signals: remap, threshold, curve, and finally turn them into color.",
    },
    steps: [
      step("tutorial_bright_contrast", "從熟悉的亮度／對比開始，觀察線性調整如何改變資料。", "Start with familiar brightness and contrast to see a linear value adjustment."),
      step("tutorial_hsv_shift", "分開色相、飽和度與明度，比直接改 RGB 更有目的。", "Separate hue, saturation, and value for more intentional control than raw RGB."),
      step("tutorial_gamma_correction", "用次方曲線改中間調，理解非線性調整。", "Use a power curve to reshape midtones and understand nonlinear adjustment."),
      step("tutorial_invert_color", "把黑白關係反轉，快速得到互補遮罩。", "Reverse black and white to create a complementary mask."),
      step("tutorial_color_ramp_tour", "把數值變成色帶、閾值或材質調色盤。", "Turn values into bands, thresholds, or a material palette."),
      step("tutorial_float_curve", "自由畫出數值曲線，控制反轉、對比與局部變化。", "Draw a custom value curve for inversion, contrast, and local shaping."),
      step("tutorial_rgb_curves", "像修圖軟體一樣調整整體與單一色彩通道。", "Adjust the master curve and individual color channels like an image editor."),
      step("tutorial_hsv_channel_pack", "拆分再合併顏色通道，只改需要的成分。", "Separate and recombine color channels so only the intended component changes."),
      step("tutorial_map_range_tour", "把來源範圍精確映射到目標範圍，並比較不同插值。", "Precisely remap source to target ranges and compare interpolation modes."),
      step("tutorial_math_remap", "用基本運算自行組出縮放與偏移，理解 Map Range 的骨架。", "Build scale and offset from basic math to understand the skeleton of Map Range."),
      step("tutorial_clamp_node", "替數值加上安全邊界，避免遮罩、粗糙度或強度失控。", "Add safety bounds so masks, roughness, and strengths cannot run away."),
    ],
  },
  {
    id: "procedural-textures",
    title: { zh: "第四階段：程序化紋理的共同語法", en: "Stage 4: The Grammar of Procedural Textures" },
    summary: {
      zh: "不把紋理節點當黑盒子；逐一拆解尺度、細節、失真、距離、波形與輸出。",
      en: "Stop treating texture nodes as black boxes; unpack scale, detail, distortion, distance, waveform, and outputs.",
    },
    steps: [
      step("tutorial_noise_texture_tour", "最常用的隨機來源：逐一理解 Scale、Detail、Roughness 與 Distortion。", "Master the most-used random source: Scale, Detail, Roughness, and Distortion."),
      step("tutorial_gradient_texture", "最單純的連續值來源，建立『紋理就是數值場』的觀念。", "Use the simplest continuous source to see that a texture is a field of values."),
      step("tutorial_white_noise", "比較無連續性的完全隨機，知道它和 Noise Texture 的差別。", "Compare discontinuous randomness with coherent Noise Texture."),
      step("tutorial_wave_texture_tour", "拆解 Bands、Rings、方向與三種波形。", "Unpack Bands, Rings, directions, and the three waveform profiles."),
      step("tutorial_checker_color_vs_fac", "比較 Color 與 Fac，理解同一節點的輸出不一定同義。", "Compare Color and Fac to see why outputs from one node are not interchangeable."),
      step("tutorial_magic_texture", "觀察迭代與失真如何累積成複雜抽象圖案。", "Observe how iteration and distortion accumulate into complex abstract patterns."),
      step("tutorial_voronoi_distance_metrics", "比較距離算法，理解細胞形狀是怎麼被計算出來的。", "Compare distance metrics to understand how cell shapes are computed."),
      step("tutorial_brick_texture_tour", "完整拆解磚塊尺寸、錯位、砂漿與列變化。", "Fully unpack brick size, offset, mortar, and row variation."),
      step("tutorial_wave_rings_multi_look", "同一個環狀訊號變成木紋、水波與科幻環，練習重新解讀資料。", "Turn one ring signal into wood, ripples, and sci-fi bands by reinterpreting data."),
      step("tutorial_voronoi_color_subtle_blend", "把強烈色塊降成細微變化，學會控制程序紋理的存在感。", "Reduce strong cells into subtle variation and control procedural texture influence."),
      step("tutorial_voronoi_mosaic", "複合案例：把細胞顏色、邊界與材質層組成馬賽克。", "Capstone: combine cell color, boundaries, and material layers into a mosaic."),
    ],
  },
  {
    id: "mixing-masking",
    title: { zh: "第五階段：數學、遮罩與材質分層", en: "Stage 5: Math, Masks, and Material Layers" },
    summary: {
      zh: "學會回答三個問題：遮罩從哪來、如何塑形、最後要控制顏色還是著色器。",
      en: "Answer three questions: where a mask comes from, how to shape it, and whether it should control color or shaders.",
    },
    steps: [
      step("tutorial_math_operations_tour", "用四種常用 Math 運算建立遮罩的底層邏輯。", "Build mask logic with four common Math operations."),
      step("tutorial_mix_color_blend_modes_tour", "比較正片疊底、濾色與疊加，知道何時該用哪一種。", "Compare Multiply, Screen, and Overlay and learn when each belongs."),
      step("tutorial_mask_strength_scaling", "不改形狀，只縮小整體遮罩影響力。", "Reduce a mask's influence without changing its shape."),
      step("tutorial_add_shader_tour", "分清能量相加與依比例混合，避免把 Add 和 Mix 當成同一件事。", "Separate energy addition from interpolation so Add and Mix are never confused."),
      step("tutorial_fresnel_tour", "從觀看角度產生自然邊緣遮罩。", "Generate a natural edge mask from view angle."),
      step("tutorial_layer_weight_facing_vs_fresnel", "實際比較 Facing 與 Fresnel 的輸出範圍和用途。", "Directly compare Facing and Fresnel ranges and uses."),
      step("tutorial_layer_weight_clearcoat", "用層權重驅動清漆反射，建立上下層概念。", "Drive a clearcoat reflection with Layer Weight and think in stacked layers."),
      step("tutorial_mix_color_grime", "把污漬當作一層可控制的顏色資訊。", "Treat grime as a controllable color layer."),
      step("tutorial_layer_stack_blend", "多層混合依序堆疊，理解順序為什麼會改變結果。", "Stack multiple blends and see why operation order changes the result."),
      step("tutorial_edge_wear_mask", "複合案例：強化邊緣遮罩，讓油漆磨損露出金屬。", "Capstone: sharpen an edge mask so worn paint reveals metal."),
    ],
  },
  {
    id: "surface-detail",
    title: { zh: "第六階段：凹凸、法線與真正位移", en: "Stage 6: Bump, Normals, and True Displacement" },
    summary: {
      zh: "從騙過光線的假立體一路走到真的移動頂點，理解品質、輪廓與效能代價。",
      en: "Move from lighting-only fake depth to actual vertex movement, including quality, silhouette, and performance costs.",
    },
    steps: [
      step("tutorial_bump_tour", "先掌握最常用的假凹凸：高度如何轉成法線變化。", "Start with the most common fake depth: converting height into normal changes."),
      step("tutorial_any_fac_as_bump_height", "證明任何穩定的 0～1 訊號都能成為高度來源。", "Prove that any stable 0–1 signal can become a height source."),
      step("tutorial_bump_vs_displacement_compared", "同一份高度資料直接比較凹凸與位移。", "Compare bump and displacement using the exact same height data."),
      step("tutorial_displacement_terrain", "真正推動頂點，觀察輪廓和面數限制。", "Actually move vertices and observe silhouette and mesh-density limits."),
      step("tutorial_voronoi_nsphere_bump_clusters", "用 N-球半徑做圓潤凸起，理解不同 Voronoi 輸出如何當高度。", "Use N-Sphere Radius for rounded bumps and reinterpret Voronoi outputs as height."),
      step("tutorial_ridged_terrain", "用多重分形建立山脊與裂紋，進入複雜高度場。", "Build ridges and cracks with multifractal structure for a complex height field."),
      step("tutorial_terrain_height_map", "讓高度同時驅動地形配色與細節，避免訊號彼此漂移。", "Use height for both terrain color and detail so related signals stay aligned."),
      step("tutorial_detail_baking_workflow", "複合工作流：比較法線貼圖、向量位移與細節烘焙的角色。", "Workflow capstone: compare normal maps, vector displacement, and baked detail."),
    ],
  },
  {
    id: "advanced-light",
    title: { zh: "第七階段：光如何穿過、散射與疊在表面上", en: "Stage 7: Transmission, Scattering, and Surface Layers" },
    summary: {
      zh: "進入玻璃、皮膚、蠟、布料、清漆與發光；每種效果都對應不同的光線行為。",
      en: "Enter glass, skin, wax, fabric, clearcoat, and emission—each tied to a different light behavior.",
    },
    steps: [
      step("tutorial_transmission_shaders_compared", "並排比較 Glass、Refraction 與 Translucent，先分清三種穿透模型。", "Compare Glass, Refraction, and Translucent side by side."),
      step("tutorial_frosted_glass", "讓雜訊只控制粗糙度，保留透射但打散穿透方向。", "Let noise control roughness while transmission remains and directions spread."),
      step("tutorial_skin_sss", "理解光進入表面後再散出的次表面散射。", "Understand light entering a surface and scattering before exiting."),
      step("tutorial_sss_texture_driven_color", "讓紋理驅動散射顏色，做出雲霧狀玉石。", "Drive scattering color with texture to create cloudy jade."),
      step("tutorial_velvet_sheen", "用 Sheen 表現纖維在掠視角的柔亮反射。", "Use Sheen for the soft grazing-angle response of fibers."),
      step("tutorial_handbuilt_clearcoat", "拆開 Principled 的清漆概念，手工組出底材與透明反射層。", "Deconstruct Principled coat by building a base and transparent reflective layer manually."),
      step("tutorial_candle_wax_glow", "複合案例：次表面散射與發光疊成蠟燭。", "Capstone: combine subsurface scattering and emission into candle wax."),
      step("tutorial_blackbody_glow", "用 Kelvin 溫度得到物理上合理的熱發光顏色。", "Use Kelvin temperature for physically meaningful heated colors."),
      step("tutorial_wavelength_spectrum", "把波長轉成可見光譜，理解數值與顏色的對應。", "Convert wavelength to visible spectrum and connect numbers to color."),
      step("tutorial_neon_sign", "把顏色與強度分開控制，完成清楚可讀的發光材質。", "Control emission color and strength separately for a readable neon material."),
      step("tutorial_fresnel_invert_core_glow", "反轉視角遮罩，做出核心發光、邊緣透明的效果。", "Invert a view-angle mask for a glowing core with transparent edges."),
      step("tutorial_opal_gem_gradient", "複合案例：用兩組驅動訊號調出蛋白石的內部色澤。", "Capstone: use two driving signals for the internal color play of opal."),
    ],
  },
  {
    id: "texture-production",
    title: { zh: "第八階段：圖像貼圖與製作流程", en: "Stage 8: Image Textures and Production Workflow" },
    summary: {
      zh: "把網站裡的節點原理接回真實資產製作：色彩空間、通道、透明與可換色工作流。",
      en: "Reconnect node theory to real asset production: color space, channels, transparency, and recoloring workflows.",
    },
    steps: [
      step("tutorial_image_texture_tour", "認識圖像取樣、色彩空間與延伸方式。", "Learn image sampling, color space, and extension modes."),
      step("tutorial_channel_packing", "一張 RGB 貼圖塞入三份灰階資料，理解遊戲資產常見打包法。", "Pack three grayscale data maps into RGB, a common game-asset workflow."),
      step("tutorial_mix_sheer", "用遮罩在布料與透明層之間切換，做出局部網紗。", "Mask between fabric and transparency for local mesh fabric."),
      step("tutorial_torn_holes", "建立破洞遮罩並控制透明材質，理解形狀與表面分離。", "Build a torn-hole mask and separate surface shape from transparency."),
      step("tutorial_dual_tone_fabric_colorway", "保留明暗結構，只用 HSV 系統化替換布料配色。", "Preserve value structure while systematically recoloring fabric in HSV."),
    ],
  },
  {
    id: "material-recipes",
    title: { zh: "第九階段：經典材質拆解與重組", en: "Stage 9: Rebuilding Classic Materials" },
    summary: {
      zh: "開始處理多訊號、多層與多種表面特性的完整材質，不再只練單一節點。",
      en: "Build complete materials with multiple signals, layers, and surface properties—not single-node exercises.",
    },
    steps: [
      step("tutorial_metal", "以雜訊控制粗糙度，做出不死板的拉絲金屬。", "Drive roughness with noise for brushed metal that does not look uniform."),
      step("tutorial_wood", "把座標、波浪、漸變與粗糙度串成程序化木紋。", "Combine coordinates, waves, ramps, and roughness into procedural wood."),
      step("tutorial_stone", "疊加不同尺度的紋理，同時處理石材顏色與細微凹凸。", "Layer texture scales to control both stone color and fine bump."),
      step("tutorial_brick_wall", "把磚塊顏色、砂漿與凹凸組成完整牆面。", "Combine brick color, mortar, and bump into a complete wall."),
      step("tutorial_mix_carpaint", "用菲涅爾控制底漆與亮面層，建立第一個多層車漆。", "Use Fresnel to combine base paint and glossy layer into a first layered car paint."),
      step("tutorial_car_paint_flakes", "在車漆裡加入細小亮片，控制尺度、密度與反光。", "Add fine flakes to car paint and control scale, density, and reflection."),
      step("tutorial_stained_glass", "把圖案分區、調色盤化與透光行為合成彩色玻璃。", "Combine pattern regions, palette mapping, and transmission into stained glass."),
    ],
  },
  {
    id: "complex-capstones",
    title: { zh: "第十階段：複雜案例與可動材質", en: "Stage 10: Complex Capstones and Animated Materials" },
    summary: {
      zh: "最後把前九階段的原理放進情境題：風化、積水、風格化、線框與時間驅動效果。",
      en: "Finish with scenario-driven work: weathering, puddles, stylization, wireframes, and time-driven effects.",
    },
    steps: [
      step("tutorial_rust_weathering", "把金屬、鏽蝕遮罩、顏色與粗糙度組成程序化風化。", "Combine metal, rust masks, color, and roughness into procedural weathering."),
      step("tutorial_puddle_wetness", "讓同一個遮罩同時控制顏色、粗糙度與積水區域。", "Use one mask to coordinate color, roughness, and puddle regions."),
      step("tutorial_toon_style_banding", "把連續數值量化成硬邊色階，理解風格化著色。", "Quantize continuous values into hard bands for stylized shading."),
      step("tutorial_wireframe_fx", "用幾何邊線訊號建立科技感全息材質。", "Use geometric edge signals to build a holographic wireframe material."),
      step("tutorial_scene_time_pulse", "最終案例：把持續時間轉成安全循環，驅動會呼吸的發光。", "Final capstone: turn continuous time into a safe loop that drives breathing emission."),
    ],
  },
];
