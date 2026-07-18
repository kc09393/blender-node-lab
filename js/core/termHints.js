// 常見但對新手不直覺的參數名詞小辭典。用 socket/setting 的 key 對應到一句話解釋，
// 讓同一個詞（例如 IOR、Roughness）在所有節點裡都能得到一致的說明，不用每個節點各寫一次。
// nodeCard.js 會依這裡的 key 幫欄位標籤加上滑鼠懸停提示（title）。
export const TERM_HINTS = {
  ior: {
    zh: "折射率（Index of Refraction）：光線進入這個材質時彎曲、反射的程度。真空/空氣 ≈ 1、水 ≈ 1.33、玻璃 ≈ 1.45-1.52、鑽石 ≈ 2.42。數值越大，反射效果越強。",
    en: "Index of Refraction: how much light bends and reflects entering this material. Vacuum/air ≈ 1, water ≈ 1.33, glass ≈ 1.45-1.52, diamond ≈ 2.42. Higher values mean stronger reflections.",
  },
  roughness: {
    zh: "粗糙度：0 = 完全光滑如鏡子、1 = 完全霧面無光澤，中間值介於兩者之間。",
    en: "Roughness: 0 = perfectly smooth like a mirror, 1 = fully matte with no shine.",
  },
  metallic: {
    zh: "金屬度：0 = 一般非金屬材質（塑膠、木頭、皮膚）、1 = 純金屬。金屬的反光顏色會被底色染色，非金屬則不會。",
    en: "Metallic: 0 = ordinary non-metal (plastic, wood, skin), 1 = pure metal. Metals tint their reflections with the base color; non-metals don't.",
  },
  fac: {
    zh: "Fac（Factor 的縮寫）：混合比例，通常是 0 到 1 之間的數值，決定兩個輸入各佔多少比重。",
    en: "Fac (short for Factor): a blend ratio, usually 0 to 1, deciding how much weight each input gets.",
  },
  scale: {
    zh: "縮放：數值越大，花紋看起來越密集（重複次數越多）；數值越小，花紋越稀疏、越大片。",
    en: "Scale: higher values make the pattern denser (more repetitions); lower values make it sparser and larger.",
  },
  distortion: {
    zh: "扭曲：讓原本規律的圖案加入一些不規則的變化，數值越大扭曲越明顯。",
    en: "Distortion: adds irregular variation to an otherwise regular pattern — higher values distort it more.",
  },
  blend: {
    zh: "混合強度：控制邊緣效果的過渡範圍，數值越大，效果越集中在貼近邊緣（側面）的地方。",
    en: "Blend: controls how the edge effect transitions — higher values concentrate the effect closer to the silhouette edge.",
  },
  alpha: {
    zh: "透明度：1 = 完全不透明、0 = 完全透明看不見。",
    en: "Alpha: 1 = fully opaque, 0 = fully invisible/transparent.",
  },
  emissionStrength: {
    zh: "發光強度：數值越大，物體看起來越亮，過大會變成死白色（過曝）。",
    en: "Emission Strength: higher values make the surface glow brighter; too high blows out to pure white.",
  },
  strength: {
    zh: "強度：數值越大，效果越明顯。",
    en: "Strength: higher values make the effect more pronounced.",
  },
  mortarSize: {
    zh: "灰泥縫寬度：控制磚塊之間縫隙的粗細，數值越大縫隙越寬。",
    en: "Mortar Size: how thick the gap between bricks is — higher values mean wider gaps.",
  },
  height: {
    zh: "高度：一個 0-1 的灰階數值，數值越大代表這裡「看起來」越凸起（只是視覺上的光影效果，不會真的改變形狀）。",
    en: "Height: a 0-1 grayscale value — higher means it looks more raised here (a lighting illusion only; it doesn't change the actual geometry).",
  },
  operation: {
    zh: "運算方式：決定這個節點怎麼處理輸入的數值/向量，例如相加、相乘、取最大值等。",
    en: "Operation: decides how this node combines its inputs — add, multiply, take the maximum, etc.",
  },
  rotation: {
    zh: "旋轉：以角度（度數）表示，正值通常代表逆時針旋轉。",
    en: "Rotation: expressed in degrees — positive values usually rotate counter-clockwise.",
  },
  location: {
    zh: "位置：把座標往某個方向平移，例如把貼圖整體往右移一點。",
    en: "Location: shifts the coordinate in a direction — e.g. nudging a texture to the right.",
  },
  center: {
    zh: "中心點：旋轉會以這個點為圓心，而不是預設的原點 (0,0,0)。",
    en: "Center: rotation pivots around this point instead of the default origin (0,0,0).",
  },
  axis: {
    zh: "軸：旋轉時繞著轉的方向，例如 (0,0,1) 代表繞著 Z 軸（垂直方向）旋轉。",
    en: "Axis: the direction to rotate around — e.g. (0,0,1) means rotating around the Z axis (vertical).",
  },
  angle: {
    zh: "角度：以度數表示要旋轉多少，正值通常代表逆時針。",
    en: "Angle: how much to rotate, in degrees — positive is usually counter-clockwise.",
  },
  vector1: {
    zh: "向量：一組三個數值 (X, Y, Z)，可以代表座標、方向或位移。",
    en: "Vector: a set of three values (X, Y, Z) — can represent a coordinate, direction, or offset.",
  },
  vector2: {
    zh: "向量：一組三個數值 (X, Y, Z)，可以代表座標、方向或位移。",
    en: "Vector: a set of three values (X, Y, Z) — can represent a coordinate, direction, or offset.",
  },
};

export function getTermHint(key, lang) {
  const entry = TERM_HINTS[key];
  if (!entry) return null;
  return entry[lang] || entry.zh;
}
