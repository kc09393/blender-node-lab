// 複合材質案例：同一個成品通常不是「一條紋理接一個 BSDF」，而是多個完整層級
// 透過遮罩組合。每個案例固定拆成底材、變化層、遮罩、表面整合四段，方便比較。

const bi = (zh, en) => ({ zh, en });
const layer = (nameZh, nameEn, roleZh, roleEn) => ({
  name: bi(nameZh, nameEn),
  role: bi(roleZh, roleEn),
});

export default [
  {
    id: "peeling-paint-wood",
    name: bi("剝落油漆木頭", "Peeling Paint on Wood"),
    summary: bi("先做完整木材，再疊完整油漆；剝落遮罩只負責決定哪一層露出。", "Build complete wood and paint surfaces first; the peeling mask only decides which layer is visible."),
    layers: [
      layer("底材：程序木紋", "Base: Procedural Wood", "年輪訊號同時控制木色與微弱 Bump。", "Growth rings drive wood color and subtle Bump."),
      layer("覆蓋：非金屬油漆", "Cover: Non-metal Paint", "獨立控制漆色、Roughness 與清漆感。", "Controls paint color, Roughness, and coat independently."),
      layer("遮罩：Noise × 邊緣條件", "Mask: Noise × Edge Condition", "Color Ramp 決定剝落面積，Noise 打破規則邊界。", "Color Ramp sets peeled coverage while Noise breaks uniform edges."),
      layer("整合：Mix Shader", "Combine: Mix Shader", "木材與油漆各自形成 Shader，遮罩只接 Fac。", "Wood and paint remain complete shaders; the mask drives only Fac."),
    ],
    connection: bi("Texture Coordinate → Mapping → Wave＋Noise → 木材；Noise → Color Ramp → Mix Shader Fac；木材／油漆 → Mix Shader → Material Output", "Texture Coordinate → Mapping → Wave + Noise → wood; Noise → Color Ramp → Mix Shader Fac; wood / paint → Mix Shader → Material Output"),
    presetId: "peeling_paint_wood",
    tutorialIds: ["tutorial_wood", "tutorial_edge_wear_mask", "tutorial_layer_stack_blend"],
  },
  {
    id: "rusted-metal",
    name: bi("鏽蝕金屬", "Rusted Metal"),
    summary: bi("真正的鏽不是金屬換橘色，而是金屬表面被非金屬氧化層取代。", "Real rust is not orange metal; it is a non-metal oxide layer replacing the exposed surface."),
    layers: [
      layer("底材：乾淨金屬", "Base: Clean Metal", "Metallic=1，保留金屬反射與加工方向。", "Metallic=1 preserves metal reflection and machining direction."),
      layer("覆蓋：粗糙鏽層", "Cover: Rough Rust", "Metallic=0、高 Roughness，帶顏色與顆粒 Bump。", "Metallic=0 with high Roughness, colored grain, and Bump."),
      layer("遮罩：Noise＋高度／邊緣", "Mask: Noise + Height / Edge", "限制鏽斑只出現在合理區域，不平均鋪滿。", "Restricts rust to plausible zones instead of uniform coverage."),
      layer("整合：兩套表面混合", "Combine: Two Full Surfaces", "同一遮罩同步改變顏色、金屬度、粗糙度與凹凸。", "One mask coordinates color, metallic, roughness, and bump changes."),
    ],
    connection: bi("Object → Noise／Voronoi → Color Ramp → Mix Shader Fac；Metal BSDF／Rust BSDF → Mix Shader → Material Output", "Object → Noise / Voronoi → Color Ramp → Mix Shader Fac; Metal BSDF / Rust BSDF → Mix Shader → Material Output"),
    presetId: "rust_metal",
    tutorialIds: ["tutorial_metal", "tutorial_mix_color_grime", "tutorial_rust_weathering"],
  },
  {
    id: "frosted-scratched-glass",
    name: bi("磨砂刮痕玻璃", "Frosted Scratched Glass"),
    summary: bi("玻璃本體負責折射；霧感與刮痕應改變 Roughness／Normal，而不是把玻璃塗成灰色。", "The glass body handles refraction; frost and scratches should alter Roughness or Normal, not paint the glass gray."),
    layers: [
      layer("底材：乾淨玻璃", "Base: Clear Glass", "先用合理 IOR 與低 Roughness 建立透明本體。", "Establish the transparent body with plausible IOR and low Roughness."),
      layer("霧層：細 Noise", "Frost: Fine Noise", "把 Noise 壓到中高 Roughness，形成模糊透射。", "Compress Noise into medium-to-high Roughness for blurred transmission."),
      layer("刮痕：方向性紋理", "Scratches: Directional Pattern", "拉長的 Wave／Noise 只以低強度進入 Bump。", "Elongated Wave or Noise enters Bump at low strength."),
      layer("整合：共用玻璃 Shader", "Combine: Shared Glass Shader", "霧與刮痕控制玻璃輸入，不需要額外不透明表面。", "Frost and scratches drive glass inputs without adding an opaque surface."),
    ],
    connection: bi("UV／Object → Noise → Map Range → Glass Roughness；方向紋理 → Bump → Glass Normal；Glass → Material Output", "UV / Object → Noise → Map Range → Glass Roughness; directional pattern → Bump → Glass Normal; Glass → Material Output"),
    presetId: "frosted_scratched_glass",
    tutorialIds: ["tutorial_glass", "tutorial_frosted_glass", "tutorial_mask_strength_scaling"],
  },
  {
    id: "molten-lava-rock",
    name: bi("熔岩岩漿石", "Molten Lava Rock"),
    summary: bi("深色岩殼與高亮岩漿共用同一裂縫遮罩，但走向相反。", "Dark crust and bright magma share one crack mask but use it in opposite directions."),
    layers: [
      layer("底材：粗糙岩殼", "Base: Rough Crust", "高 Roughness、深色，細 Noise 進入 Bump。", "Dark, highly rough crust with fine Noise driving Bump."),
      layer("內層：高溫發光", "Inner Layer: Hot Emission", "Blackbody 或暖色 Ramp 控制岩漿顏色與強度。", "Blackbody or a warm Ramp controls magma color and strength."),
      layer("遮罩：裂縫訊號", "Mask: Crack Signal", "Voronoi／Noise 經 Ramp 變成窄裂縫，再視需要反轉。", "Voronoi or Noise is narrowed into cracks with a Ramp, then inverted if needed."),
      layer("整合：表面＋發光", "Combine: Surface + Emission", "遮罩讓裂縫露出發光層，岩殼保持不發光。", "The mask reveals emission through cracks while the crust stays unlit."),
    ],
    connection: bi("Object → Noise／Voronoi → Color Ramp → 裂縫遮罩；遮罩 → Mix／Emission Strength；Rock BSDF＋Emission → Add/Mix Shader → Output", "Object → Noise / Voronoi → Color Ramp → crack mask; mask → Mix / Emission Strength; Rock BSDF + Emission → Add/Mix Shader → Output"),
    presetId: "molten_lava_rock",
    tutorialIds: ["tutorial_noise_texture_tour", "tutorial_blackbody_glow", "tutorial_any_fac_as_bump_height"],
  },
  {
    id: "rain-wet-concrete",
    name: bi("雨後濕水泥", "Rain-Wet Concrete"),
    summary: bi("乾濕區仍是同一種水泥；差別主要在顏色稍暗、粗糙度下降與局部積水。", "Dry and wet zones are still the same concrete; wetness mainly darkens color, lowers roughness, and forms puddles."),
    layers: [
      layer("底材：多尺度水泥", "Base: Multi-scale Concrete", "低頻控制色塊，高頻控制孔隙與 Bump。", "Low frequency shapes color patches; high frequency shapes pores and Bump."),
      layer("濕層：深色＋低 Roughness", "Wet Layer: Darker + Low Roughness", "保留底材色相，只壓暗並集中反射。", "Keeps the substrate hue while darkening and concentrating reflection."),
      layer("遮罩：Noise × 高度", "Mask: Noise × Height", "Noise 做水邊，高度條件讓水集中在低處。", "Noise shapes water edges; height keeps water in lower areas."),
      layer("整合：同遮罩驅動多屬性", "Combine: One Mask, Multiple Properties", "同一遮罩同時混合 Base Color、Roughness 與細水波 Bump。", "One mask blends Base Color, Roughness, and subtle ripple Bump."),
    ],
    connection: bi("Object → Noise＋高度 → Multiply → Color Ramp → 濕區遮罩；遮罩同時接 Color Mix 與 Roughness Mix → Principled → Output", "Object → Noise + height → Multiply → Color Ramp → wet mask; mask drives both Color Mix and Roughness Mix → Principled → Output"),
    presetId: "wet_concrete",
    tutorialIds: ["tutorial_stone", "tutorial_puddle_wetness", "tutorial_mask_strength_scaling"],
  },
  {
    id: "iridescent-beetle-shell",
    name: bi("虹彩甲蟲殼", "Iridescent Beetle Shell"),
    summary: bi("深色甲殼提供本體，Facing／Fresnel 只在視角改變時疊上少量虹彩。", "A dark shell forms the body while Facing or Fresnel adds a small view-dependent color shift."),
    layers: [
      layer("底材：深色亮面甲殼", "Base: Dark Glossy Shell", "中低 Roughness 保留堅硬外殼反射。", "Medium-low Roughness preserves hard-shell reflection."),
      layer("變色：虹彩 Ramp", "Shift: Iridescent Ramp", "多停駐點顏色只描述角度色，不取代整個底色。", "A multi-stop Ramp defines angular color without replacing the whole base."),
      layer("遮罩：Facing／Fresnel", "Mask: Facing / Fresnel", "把視角訊號重新映射，限制變色集中在特定角度。", "Remaps view angle so the color shift occupies selected angles."),
      layer("整合：低比例混色＋清漆", "Combine: Subtle Color Mix + Coat", "虹彩低比例混進底色，清漆維持外殼高光。", "Iridescence mixes subtly into the base while Coat preserves shell highlights."),
    ],
    connection: bi("Layer Weight／Fresnel → Color Ramp → Mix Color Fac/Color；結果 → Principled Base Color；Coat → Material Output", "Layer Weight / Fresnel → Color Ramp → Mix Color Fac/Color; result → Principled Base Color; Coat → Material Output"),
    presetId: "iridescent_beetle",
    tutorialIds: ["tutorial_fresnel_tour", "tutorial_color_ramp_tour", "tutorial_opal_gem_gradient"],
  },
  {
    id: "carbon-fiber-coat",
    name: bi("碳纖維編織與透明塗層", "Carbon Fiber Weave with Clear Coat"),
    summary: bi("編織圖案負責纖維方向，深色底材負責吸光，上方清漆負責銳利反射。", "The weave defines fiber direction, the dark substrate absorbs light, and a clear coat creates sharp reflection."),
    layers: [
      layer("底材：深色非金屬", "Base: Dark Non-metal", "不要把碳纖維直接當成 Metallic=1。", "Do not treat carbon fiber itself as Metallic=1."),
      layer("紋理：交錯方向", "Pattern: Crossed Directions", "兩組 Wave／Checker 建立斜向編織。", "Two Wave or Checker signals form a diagonal weave."),
      layer("遮罩：纖維交錯", "Mask: Fiber Interlace", "Math／Color Ramp 分出上下穿插與細微明暗。", "Math or Color Ramp separates over-under strands and subtle value shifts."),
      layer("整合：Bump＋Clear Coat", "Combine: Bump + Clear Coat", "編織只做細微法線，清漆形成獨立平滑外層。", "The weave adds subtle normal detail while Coat creates a smooth outer layer."),
    ],
    connection: bi("UV → Mapping → 兩組方向紋理 → Math／Color Ramp → Base Color＋Bump；Principled Coat → Material Output", "UV → Mapping → two directional patterns → Math / Color Ramp → Base Color + Bump; Principled Coat → Material Output"),
    presetId: "carbon_fiber",
    tutorialIds: ["tutorial_uv_mapping", "tutorial_checker_texture_tour", "tutorial_layer_weight_clearcoat"],
  },
  {
    id: "bioluminescent-fungus",
    name: bi("生物發光真菌", "Bioluminescent Fungus"),
    summary: bi("有機本體仍需要粗糙表面與散射；發光只沿菌褶或斑點遮罩出現。", "The organic body still needs rough surface and scattering; emission appears only along gills or spot masks."),
    layers: [
      layer("底材：有機粗糙表面", "Base: Rough Organic Surface", "SSS／Principled 建立柔軟含水的本體。", "SSS or Principled builds a soft, moist body."),
      layer("發光：冷色 Emission", "Glow: Cool Emission", "顏色與強度分開控制，避免整顆死白。", "Color and strength are controlled separately to avoid a white blob."),
      layer("遮罩：Noise／菌褶圖案", "Mask: Noise / Gill Pattern", "Color Ramp 只保留需要發光的細線或斑點。", "Color Ramp keeps only the lines or spots that should glow."),
      layer("整合：表面＋局部發光", "Combine: Surface + Local Emission", "遮罩控制 Emission Strength，再與可見本體相加。", "The mask drives Emission Strength, which is then added to the visible body."),
    ],
    connection: bi("Object／UV → Noise／Wave → Color Ramp → Emission Strength；SSS／Principled＋Emission → Add Shader → Material Output", "Object / UV → Noise / Wave → Color Ramp → Emission Strength; SSS / Principled + Emission → Add Shader → Material Output"),
    presetId: "bioluminescent_fungus",
    tutorialIds: ["tutorial_sss_texture_driven_color", "tutorial_neon_sign", "tutorial_add_shader_tour"],
  },
  {
    id: "lace-transparency",
    name: bi("蕾絲與局部透明布料", "Lace and Locally Transparent Fabric"),
    summary: bi("先做出黑白織紋遮罩，再用它混合完整布料 Shader 與 Transparent Shader。", "Build a black-and-white weave mask first, then use it to mix a complete fabric shader with Transparent."),
    layers: [
      layer("底材：粗糙布料", "Base: Rough Fabric", "Principled／Sheen 保留纖維高光。", "Principled or Sheen preserves fiber highlights."),
      layer("空洞：Transparent Shader", "Holes: Transparent Shader", "透明是另一套 Shader，不是把 Base Color 調黑。", "Transparency is another shader, not a black Base Color."),
      layer("遮罩：交錯織紋", "Mask: Interlaced Weave", "硬邊 Color Ramp 把連續紋理切成線與洞。", "A hard Color Ramp cuts continuous texture into threads and holes."),
      layer("整合：Mix Shader", "Combine: Mix Shader", "先用 Fac=0/1 驗證 A/B，再接織紋遮罩。", "Verify A and B with Fac=0 and 1 before connecting the weave mask."),
    ],
    connection: bi("UV → 兩組 Wave／Image → Multiply → Color Ramp → Mix Shader Fac；Fabric／Transparent → Mix Shader → Material Output", "UV → two Waves / Image → Multiply → Color Ramp → Mix Shader Fac; Fabric / Transparent → Mix Shader → Material Output"),
    presetId: "lace_mesh",
    tutorialIds: ["tutorial_velvet_sheen", "tutorial_mix_sheer", "tutorial_torn_holes"],
  },
];
