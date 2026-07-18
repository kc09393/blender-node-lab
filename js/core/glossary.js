// 中文說明文字裡常常直接寫節點的英文名稱（例如「拖入 Mix Shader」），但節點面板在中文模式下
// 只會顯示中文名稱（「混合著色器」），畫面上完全找不到「Mix Shader」這幾個字——這個小工具在
// 顯示中文說明文字時，自動把提到的英文節點名稱加上中文名稱的括號註記，讓使用者能對照面板找到節點。
// 只處理「節點名稱」（跟畫面上可拖曳的方塊一一對應），不含 socket/參數名稱，那個命名空間太大、
// 每個節點各自獨立命名，全部自動比對容易誤判。
import { listNodeTypes } from "./nodeRegistry.js";

let termsCache = null;
function getTerms() {
  if (termsCache) return termsCache;
  const seen = new Map();
  for (const typeDef of listNodeTypes()) {
    const en = typeDef.name?.en;
    const zh = typeDef.name?.zh;
    if (!en || !zh || en === zh) continue; // 中英文相同（例如縮寫）不需要註記
    if (!seen.has(en)) seen.set(en, zh);
  }
  // 長字串優先比對，避免「Principled BSDF」被短的「BSDF」提早截斷比對到。
  termsCache = [...seen.entries()].sort((a, b) => b[0].length - a[0].length);
  return termsCache;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let combinedRegex = null;
function getCombinedRegex() {
  if (combinedRegex) return combinedRegex;
  const terms = getTerms();
  if (terms.length === 0) return null;
  combinedRegex = new RegExp(`\\b(${terms.map(([en]) => escapeRegex(en)).join("|")})\\b(?![（(])`, "g");
  return combinedRegex;
}

const termMapCache = new Map();
function zhFor(en) {
  if (termMapCache.size === 0) {
    for (const [e, z] of getTerms()) termMapCache.set(e, z);
  }
  return termMapCache.get(en);
}

// 只在中文模式下才需要註記；英文模式的文字本來就是英文，不用額外處理。
// (?![（(]) 避免對已經手動加過中文註記的文字（例如教學步驟）重複註記一次。
// 註記故意用半形括號 ()，不用全形（）——原文裡常常本來就有一層全形括號的補充說明
// （例如「...（未套用 Bump 計算）」），註記如果也用全形括號會變成全形括號互相巢狀、
// 看起來很擠；半形括號跟全形括號分屬不同視覺層次，巢狀也不會混在一起。
export function glossNodeNames(text, lang) {
  if (lang !== "zh" || !text) return text;
  const re = getCombinedRegex();
  if (!re) return text;
  re.lastIndex = 0;
  return text.replace(re, (match) => `${match}(${zhFor(match)})`);
}
