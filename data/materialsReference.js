// 真實世界材質數值參考表——IOR／粗糙度／金屬反射率顏色。跟節點百科（解釋某個節點怎麼用）
// 不同，這裡是「調材質時想不起來玻璃的 IOR 是多少、金要填什麼顏色」時查的速查表，
// 數字是公開的物理量測值（業界特效/遊戲界常用的參考數據），不是本專案自己量測的。
// 獨立成資料檔維護，跟 categories.js／nodeIndex.js／learningPath.js 同一套模式。

export const iorTable = [
  { name: { zh: "空氣", en: "Air" }, ior: 1.0 },
  { name: { zh: "冰", en: "Ice" }, ior: 1.31 },
  { name: { zh: "水", en: "Water" }, ior: 1.33 },
  { name: { zh: "壓克力／塑膠", en: "Acrylic / Plastic" }, ior: 1.49 },
  { name: { zh: "植物油", en: "Vegetable Oil" }, ior: 1.47 },
  { name: { zh: "窗玻璃", en: "Window Glass" }, ior: 1.52 },
  { name: { zh: "石英", en: "Quartz" }, ior: 1.54 },
  { name: { zh: "琥珀", en: "Amber" }, ior: 1.55 },
  { name: { zh: "聚碳酸酯（PC 塑膠）", en: "Polycarbonate" }, ior: 1.58 },
  { name: { zh: "祖母綠", en: "Emerald" }, ior: 1.58 },
  { name: { zh: "紅寶石／藍寶石", en: "Ruby / Sapphire" }, ior: 1.77 },
  { name: { zh: "鑽石", en: "Diamond" }, ior: 2.42 },
];

export const roughnessTable = [
  { name: { zh: "鏡面／拋光鉻", en: "Mirror / Polished Chrome" }, range: [0, 0.05] },
  { name: { zh: "平靜水面", en: "Calm Water" }, range: [0, 0.05] },
  { name: { zh: "拋光金屬", en: "Polished Metal" }, range: [0.05, 0.15] },
  { name: { zh: "光滑塑膠", en: "Glossy Plastic" }, range: [0.1, 0.3] },
  { name: { zh: "拉絲金屬", en: "Brushed Metal" }, range: [0.2, 0.4] },
  { name: { zh: "上漆木頭", en: "Varnished Wood" }, range: [0.2, 0.4] },
  { name: { zh: "皮膚", en: "Skin" }, range: [0.3, 0.5] },
  { name: { zh: "消光塑膠", en: "Matte Plastic" }, range: [0.4, 0.6] },
  { name: { zh: "氧化／生鏽金屬", en: "Oxidized / Rusted Metal" }, range: [0.5, 0.8] },
  { name: { zh: "原木", en: "Raw Wood" }, range: [0.6, 0.8] },
  { name: { zh: "橡膠", en: "Rubber" }, range: [0.6, 0.9] },
  { name: { zh: "布料", en: "Fabric" }, range: [0.7, 1.0] },
  { name: { zh: "水泥／石材", en: "Concrete / Stone" }, range: [0.8, 1.0] },
];

// 純金屬（Metallic=1）時 Base Color 該填的顏色——這是金屬本身在正視角的反射率顏色
// （F0），不是「看起來的顏色印象」，所以會比直覺想的更接近灰階、更不飽和。
export const metalColorTable = [
  { name: { zh: "金", en: "Gold" }, color: [1.0, 0.86, 0.57] },
  { name: { zh: "銀", en: "Silver" }, color: [0.95, 0.93, 0.88] },
  { name: { zh: "銅", en: "Copper" }, color: [0.95, 0.64, 0.54] },
  { name: { zh: "鐵", en: "Iron" }, color: [0.56, 0.57, 0.58] },
  { name: { zh: "鋁", en: "Aluminum" }, color: [0.91, 0.92, 0.92] },
  { name: { zh: "鉻", en: "Chrome" }, color: [0.55, 0.56, 0.55] },
  { name: { zh: "鈦", en: "Titanium" }, color: [0.76, 0.73, 0.69] },
  { name: { zh: "黃銅", en: "Brass" }, color: [0.91, 0.78, 0.42] },
];
