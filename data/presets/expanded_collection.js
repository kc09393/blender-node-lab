// 第二批實用材質。共用建圖器只統一「座標→程序紋理→色帶／粗糙度／凹凸」的正確骨架；
// 每個案例仍有獨立的紋理類型、比例、色盤與 PBR 參數，方便學習者比較同一工作流如何跨材質重用。
const collection = [
  ["painted_plaster", "粉刷灰泥牆", "Painted Plaster", "低對比雜訊同時控制牆面色差與細微凹凸，避免純色牆像塑膠板。", "Low-contrast noise drives both tint and micro-bump so a painted wall does not read like flat plastic.", "noise", 5, [[0.32,0.29,0.24,1],[0.62,0.57,0.48,1]], .72, .9, .16],
  ["terrazzo_tile", "淺色磨石子", "Light Terrazzo", "高尺度沃羅諾伊切出碎石顆粒，硬邊色帶把骨材嵌入暖白水泥底。", "High-scale Voronoi cells form aggregate chips; a hard ramp embeds them in warm white cement.", "voronoi", 28, [[0.12,0.1,0.08,1],[0.82,0.78,0.68,1],[0.45,0.19,0.12,1]], .58, .5, .2],
  ["asphalt_road", "粗粒瀝青路面", "Coarse Asphalt", "細密雜訊製造黑色碎石顆粒，較強凹凸與高粗糙度保留道路的乾硬質感。", "Dense noise creates dark aggregate; stronger bump and high roughness keep the road dry and gritty.", "noise", 42, [[0.015,0.018,0.022,1],[0.09,0.095,0.1,1]], .9, 1.5, .5],
  ["limestone_wall", "石灰岩牆面", "Limestone Wall", "大尺度雜訊建立沉積色帶，小尺度凹凸模擬多孔石灰岩而不破壞輪廓。", "Broad noise creates sediment variation while fine bump suggests porous limestone without changing silhouette.", "noise", 8, [[0.34,0.27,0.16,1],[0.74,0.65,0.46,1]], .76, .75, .24],
  ["wet_concrete", "雨後濕水泥", "Rain-Wet Concrete", "深灰雜訊同時降低局部粗糙度，形成水膜尚未完全乾燥的斑駁反光。", "Dark noise also lowers local roughness, producing patchy reflections from a concrete surface that is still drying.", "noise", 6, [[0.07,0.075,0.08,1],[0.3,0.31,0.32,1]], .24, .55, .12],
  ["terracotta_roof_tile", "陶土屋瓦", "Terracotta Roof Tile", "波浪紋理形成燒製方向感，橘紅色帶配合中等粗糙度呈現戶外陶土。", "Wave texture adds firing direction; an orange-red ramp and medium roughness sell outdoor terracotta.", "wave", 7, [[0.16,0.025,0.008,1],[0.7,0.19,0.045,1]], .62, .65, .2],
  ["weathered_stucco", "風化外牆粉刷", "Weathered Stucco", "扭曲雜訊把褪色區與砂粒凹凸綁在一起，適合老屋外牆近景。", "Distorted noise ties faded patches to sandy bump, suited to close shots of aging exterior walls.", "noise", 11, [[0.19,0.17,0.13,1],[0.62,0.55,0.39,1]], .82, 1.1, .38],
  ["bathroom_tile", "釉面浴室磁磚", "Glazed Bathroom Tile", "棋盤格提供規律分塊，低粗糙度與清漆層做出容易清潔的釉面反光。", "A checker supplies regular blocks; low roughness and a coat layer create clean glazed reflections.", "checker", 5, [[0.035,0.18,0.24,1],[0.78,0.9,0.92,1]], .16, .2, .05, {coatWeight:1,coatRoughness:.12}],
  ["dark_terrazzo", "深色磨石子", "Dark Terrazzo", "深色水泥底混入不規則亮色骨材，用高尺度細胞圖案避免規則拼貼感。", "Dark cement holds irregular light aggregate; high-scale cells avoid a repeated tiled appearance.", "voronoi", 34, [[0.018,0.02,0.025,1],[0.55,0.48,0.34,1],[0.2,0.34,0.38,1]], .48, .45, .16],
  ["granite_facade", "花崗岩外牆", "Granite Facade", "三色細胞紋理模擬石英、長石與深色礦物，粗糙度維持戶外未拋光狀態。", "A three-color cellular pattern suggests quartz, feldspar and dark minerals with an unpolished exterior finish.", "voronoi", 45, [[0.025,0.03,0.035,1],[0.48,0.43,0.39,1],[0.76,0.68,0.57,1]], .7, .55, .18],

  ["matte_black_plastic", "霧黑消光塑膠", "Matte Black Plastic", "極小明度變化搭配高粗糙度，保留黑色產品外殼的輪廓而不變成純黑洞。", "Tiny value variation and high roughness preserve the shape of a black product shell without turning it into a void.", "noise", 18, [[0.004,0.005,0.007,1],[0.035,0.04,0.05,1]], .76, .25, .05],
  ["frosted_acrylic", "霧面壓克力", "Frosted Acrylic", "半透明薄壁搭配細雜訊粗糙度，模擬燈罩與展示盒常見的乳霧塑膠。", "Thin-wall transmission plus fine roughness noise mimics milky acrylic used for lamps and display cases.", "noise", 26, [[0.55,0.68,0.78,1],[0.92,0.96,1,1]], .38, .18, .04, {transmissionWeight:.72,thinWall:true,ior:1.49}],
  ["anodized_aluminum", "陽極鋁", "Anodized Aluminum", "金屬底色保留染色反射，細長波紋只輕微擾動粗糙度，接近加工鋁表面。", "Metallic tinted reflections remain intact while fine bands subtly disturb roughness like machined anodized aluminum.", "wave", 75, [[0.018,0.09,0.16,1],[0.05,0.32,0.52,1]], .28, .22, .035, {metallic:1,anisotropy:.45}],
  ["ceramic_glaze", "高光陶瓷釉", "Glossy Ceramic Glaze", "陶土底色覆上低粗糙清漆，高光清楚但不誤設為金屬。", "A clay base sits under a low-roughness coat, producing crisp highlights without incorrectly making it metallic.", "noise", 4, [[0.22,0.035,0.018,1],[0.72,0.23,0.08,1]], .2, .18, .05, {coatWeight:1,coatRoughness:.08}],
  ["rubber_grip", "止滑橡膠握把", "Rubber Grip", "高頻雜訊產生止滑顆粒，深色介電材質配合高粗糙度吸收大部分高光。", "High-frequency noise creates grip granules; a dark dielectric with high roughness suppresses most highlights.", "noise", 55, [[0.006,0.008,0.01,1],[0.055,0.065,0.07,1]], .86, 1.35, .42],
  ["powder_coated_metal", "粉體烤漆金屬", "Powder-Coated Metal", "底層是金屬但表面塗層呈介電反射，細顆粒凹凸是辨識粉體烤漆的關鍵。", "The substrate is metal but the coating reflects as a dielectric; fine pebble bump is the key powder-coat cue.", "noise", 70, [[0.045,0.07,0.025,1],[0.19,0.36,0.08,1]], .5, .7, .25],
  ["translucent_packaging", "半透明包裝塑膠", "Translucent Packaging", "薄壁透射與低飽和色調模擬食品或化妝品包裝，不把它當成厚實玻璃。", "Thin-wall transmission and low saturation mimic food or cosmetic packaging without treating it as thick glass.", "noise", 12, [[0.62,0.72,0.8,1],[0.9,0.96,1,1]], .2, .08, .02, {transmissionWeight:.88,thinWall:true,ior:1.46}],
  ["carbon_fiber", "碳纖維編織", "Carbon Fiber Weave", "高密度棋盤格近似交錯束帶，再用清漆層補上樹脂表面的深亮反射。", "A dense checker approximates interlaced bundles, while a coat layer adds the deep resin reflection.", "checker", 32, [[0.004,0.006,0.008,1],[0.045,0.055,0.06,1]], .2, .28, .05, {coatWeight:1,coatRoughness:.1}],

  ["silk_fabric", "絲綢布料", "Silk Fabric", "細密單向波紋與高 Sheen 權重共同形成絲綢沿掠射角變亮的柔滑反光。", "Fine directional bands and strong sheen create silk's smooth grazing-angle glow.", "wave", 90, [[0.12,0.008,0.025,1],[0.72,0.055,0.16,1]], .32, .12, .025, {sheenWeight:.8,sheenRoughness:.24}],
  ["wool_fabric", "羊毛織物", "Wool Fabric", "高頻雜訊負責纖維團塊，Sheen 補上毛羽在輪廓處的柔亮反應。", "High-frequency noise forms fiber clumps while sheen adds the soft rim response of fuzzy wool.", "noise", 60, [[0.045,0.035,0.025,1],[0.28,0.22,0.16,1]], .88, .8, .3, {sheenWeight:.65,sheenRoughness:.75}],
  ["lace_mesh", "蕾絲網布", "Lace Mesh", "細胞距離形成孔洞節奏，半透明與高粗糙度保留纖維而不是玻璃感。", "Cell distance establishes the hole rhythm; partial transparency and high roughness preserve a fiber look instead of glass.", "voronoi", 18, [[0.015,0.012,0.018,1],[0.72,0.68,0.75,1]], .74, .35, .16, {alpha:.72,sheenWeight:.4}],
  ["knit_fabric", "針織布料", "Knitted Fabric", "扭曲波紋暗示重複線圈，顏色與凹凸共用訊號讓織紋不會漂移。", "Distorted bands suggest repeated loops; sharing one signal for color and bump keeps the knit aligned.", "wave", 38, [[0.025,0.06,0.12,1],[0.15,0.38,0.7,1]], .78, .75, .28, {sheenWeight:.5,sheenRoughness:.6}],
  ["reflective_sportswear", "反光機能布", "Reflective Sportswear", "深色布底加入高 Sheen 與細帶狀反光，模擬運動服在邊緣突然發亮。", "A dark textile base combines high sheen with fine bands to mimic sportswear flashing at grazing angles.", "wave", 48, [[0.006,0.01,0.018,1],[0.08,0.28,0.42,1]], .42, .2, .08, {sheenWeight:1,sheenRoughness:.2}],

  ["tree_bark", "粗糙樹皮", "Rough Tree Bark", "拉長波紋加扭曲形成縱向裂槽，深淺棕色與強凹凸共同描述老樹皮。", "Stretched distorted bands form vertical fissures; brown variation and strong bump describe old bark.", "wave", 9, [[0.018,0.007,0.002,1],[0.24,0.065,0.018,1]], .9, 1.6, .55],
  ["moss_rock", "苔蘚岩石", "Mossy Rock", "細胞斑塊在深石色與苔綠間切換，粗糙表面讓潮濕植物層仍保有厚度感。", "Cell patches switch between dark stone and moss green; rough bump gives the damp growth a sense of thickness.", "voronoi", 9, [[0.025,0.03,0.028,1],[0.12,0.32,0.055,1],[0.32,0.38,0.18,1]], .86, 1.0, .36],
  ["snow_crust", "結晶雪殼", "Crusted Snow", "高亮低彩度底色混入細晶顆粒，適度次表面與粗糙度避免像白色塑膠。", "A bright low-chroma base receives fine crystalline breakup; mild subsurface and roughness avoid white plastic.", "noise", 38, [[0.42,0.55,0.7,1],[0.92,0.97,1,1]], .55, .42, .13, {subsurfaceWeight:.18,subsurfaceScale:.012}],
  ["wet_mud", "濕泥地", "Wet Mud", "大塊雜訊同時控制深褐色與低粗糙水窪，亮暗變化來自水膜而非金屬度。", "Broad noise controls dark brown color and low-roughness puddles; highlights come from water film, not metallic.", "noise", 4, [[0.018,0.008,0.003,1],[0.19,0.07,0.018,1]], .3, 1.05, .35, {coatWeight:.38,coatRoughness:.06}],
  ["ocean_foam", "海面泡沫", "Ocean Foam", "沃羅諾伊邊界近似泡沫網格，藍綠底色配合少量發光讓薄浪花保持可讀性。", "Voronoi boundaries suggest a foam network; blue-green color and slight emission keep thin wave crests readable.", "voronoi", 13, [[0.005,0.055,0.08,1],[0.58,0.88,0.9,1]], .24, .35, .11, {transmissionWeight:.3,emissionStrength:.18}],

  ["magic_crystal", "魔法水晶", "Magic Crystal", "高彩度細胞紋理同時驅動透射與發光色，薄膜參數增加彩色邊緣，但仍標示為即時近似。", "Saturated cells drive transmissive and emissive color; thin film adds colored edges while remaining an honest live approximation.", "voronoi", 7, [[0.03,0.01,0.22,1],[0.12,0.72,1,1],[0.9,0.12,0.75,1]], .12, .25, .06, {transmissionWeight:.72,emissionStrength:.65,thinFilmThickness:420}],
  ["pixel_energy", "像素能量護盾", "Pixel Energy Shield", "硬邊棋盤格配合強發光與薄壁透射，做出風格化科幻能量表面。", "A hard checker combines strong emission with thin-wall transmission for a stylized sci-fi energy surface.", "checker", 18, [[0.0,0.025,0.08,1],[0.0,0.75,1,1]], .08, .05, .01, {transmissionWeight:.6,thinWall:true,emissionStrength:3.5}],
];

function createPreset([id, zh, en, descriptionZh, descriptionEn, pattern, scale, colors, roughness, bumpStrength, bumpDistance, extras = {}]) {
  const prefix = `x_${id.replace(/[^a-z0-9]/g, "_")}`;
  const patternType = { noise: "texture_noise", wave: "texture_wave", voronoi: "texture_voronoi", checker: "texture_checker" }[pattern];
  const patternParams = pattern === "noise"
    ? { scale, detail: 6, roughness: .62, distortion: scale > 20 ? .25 : 1.2 }
    : pattern === "wave"
      ? { scale, distortion: 4, detail: 5, detailScale: 2.2, detailRoughness: .6 }
      : pattern === "voronoi"
        ? { scale, randomness: .85, feature: "f1", distanceMetric: "euclidean" }
        : { scale, color1: colors[0], color2: colors.at(-1) };
  const principledParams = { roughness, ...extras };
  const nodes = [
    { id: `${prefix}_out`, typeId: "output_material", x: 1120, y: 180, params: {} },
    { id: `${prefix}_coord`, typeId: "input_texture_coordinate", x: -320, y: 180, params: {} },
    { id: `${prefix}_mapping`, typeId: "vector_mapping", x: -80, y: 180, params: { scale: [1, 1, 1] } },
    { id: `${prefix}_pattern`, typeId: patternType, x: 180, y: 120, params: patternParams },
    { id: `${prefix}_ramp`, typeId: "converter_color_ramp", x: 440, y: 40, params: { interpolation: pattern === "checker" ? "constant" : "ease", stops: colors.map((color, index) => ({ position: colors.length === 1 ? 0 : index / (colors.length - 1), color })) } },
    { id: `${prefix}_range`, typeId: "converter_map_range", x: 440, y: 330, params: { fromMin: 0, fromMax: 1, toMin: Math.max(.02, roughness - .12), toMax: Math.min(1, roughness + .12), clamp: true } },
    { id: `${prefix}_bump`, typeId: "vector_bump", x: 700, y: 400, params: { strength: bumpStrength, distance: bumpDistance, height: 1 } },
    { id: `${prefix}_principled`, typeId: "shader_principled_bsdf", x: 820, y: 120, params: principledParams },
  ];
  const facSocket = pattern === "voronoi" ? "distance" : "fac";
  const links = [
    { id: `${prefix}_l1`, fromNode: `${prefix}_coord`, fromSocket: "generated", toNode: `${prefix}_mapping`, toSocket: "vector" },
    { id: `${prefix}_l2`, fromNode: `${prefix}_mapping`, fromSocket: "vector", toNode: `${prefix}_pattern`, toSocket: "vector" },
    { id: `${prefix}_l3`, fromNode: `${prefix}_pattern`, fromSocket: facSocket, toNode: `${prefix}_ramp`, toSocket: "fac" },
    { id: `${prefix}_l4`, fromNode: `${prefix}_ramp`, fromSocket: "color", toNode: `${prefix}_principled`, toSocket: "baseColor" },
    { id: `${prefix}_l5`, fromNode: `${prefix}_pattern`, fromSocket: facSocket, toNode: `${prefix}_range`, toSocket: "value" },
    { id: `${prefix}_l6`, fromNode: `${prefix}_range`, fromSocket: "value", toNode: `${prefix}_principled`, toSocket: "roughness" },
    { id: `${prefix}_l7`, fromNode: `${prefix}_pattern`, fromSocket: facSocket, toNode: `${prefix}_bump`, toSocket: "height" },
    { id: `${prefix}_l8`, fromNode: `${prefix}_bump`, fromSocket: "normal", toNode: `${prefix}_principled`, toSocket: "normal" },
    { id: `${prefix}_l9`, fromNode: `${prefix}_principled`, fromSocket: "bsdf", toNode: `${prefix}_out`, toSocket: "surface" },
  ];
  if (Number(extras.emissionStrength) > 0) {
    links.push({ id: `${prefix}_l10`, fromNode: `${prefix}_ramp`, fromSocket: "color", toNode: `${prefix}_principled`, toSocket: "emissionColor" });
  }
  return { id, name: { zh, en }, description: { zh: descriptionZh, en: descriptionEn }, graph: { nodes, links } };
}

export default collection.map(createPreset);
