// 預設材質的分類——只用來讓沙盒的「載入預設材質」下拉選單分組顯示，跟材質本身的資料
// （data/presets/*.js）完全獨立。刻意不在每個 preset 檔案裡加 category 欄位：
// 材質數量一多，手動歸類難免有些主題重疊、見仁見智，集中寫在這一個檔案裡，之後
// 調整分類或加新材質時只要改這裡，不用一個個進去改每份 preset 檔案。
export default [
  {
    id: "basics",
    label: { zh: "基礎材質", en: "Basics" },
    presetIds: [
      "glossy_plastic", "brushed_metal", "glass", "procedural_wood", "neon_emission", "checker_toy", "frosted_scratched_glass",
      "polished_concrete", "crackle_porcelain", "galvanized_zinc",
    ],
  },
  {
    id: "organic",
    label: { zh: "生物有機", en: "Organic & Creature" },
    presetIds: [
      "skin", "velvet", "coral_reef", "wet_flesh", "lizard_skin", "snake_scales",
      "butterfly_wing", "bioluminescent_fungus", "frog_skin", "peacock_feather",
    ],
  },
  {
    id: "weathered",
    label: { zh: "風化老舊", en: "Weathered & Aged" },
    presetIds: [
      "rust_metal", "rusty_chain", "peeling_paint_wood", "copper_patina",
      "old_leather_book", "cracked_mud", "sandstone_cliff", "barnacle_rock",
      "salt_flat_desert", "aged_parchment",
    ],
  },
  {
    id: "gems",
    label: { zh: "寶石礦石", en: "Gems & Minerals" },
    presetIds: ["agate", "obsidian_glass", "marble_countertop", "cracked_ice", "jade_stone", "crystal_ball", "moon_surface"],
  },
  {
    id: "liquid",
    label: { zh: "液態金屬", en: "Liquid & Molten" },
    presetIds: ["liquid_chrome", "soap_bubble", "lava", "molten_lava_rock", "molten_gold", "chrome_skull"],
  },
  {
    id: "scifi",
    label: { zh: "科幻奇幻", en: "Sci-Fi & Fantasy" },
    presetIds: [
      "holographic", "alien_meteorite", "dragon_scale_armor", "toxic_slime", "galaxy_nebula",
      "holographic_foil", "circuit_board", "solar_panel", "iridescent_beetle", "aurora",
      "chainmail_mesh", "neon_glass_tube",
    ],
  },
  {
    id: "fabric",
    label: { zh: "布料工藝", en: "Fabric & Craft" },
    presetIds: ["camo_fabric", "stained_wood_inlay", "denim_fabric", "terracotta_clay", "cork_board"],
  },
];
