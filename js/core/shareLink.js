// 把節點圖編碼進網址參數，讓使用者可以直接分享一個連結給別人（點開就看到同一份材質圖）。
// 優先用瀏覽器原生 CompressionStream 壓縮（deflate-raw，沒有格式標頭，體積最小），
// 舊瀏覽器沒有這個 API 時退回純 base64（網址會長一點，但功能一樣能用）。
// 版本前綴（"1"=壓縮／"0"=原始）讓舊連結在瀏覽器升級後依然解得開，不用管解碼那端用的是哪種瀏覽器。

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encodeGraphToShareParam(graph) {
  const json = JSON.stringify(graph.toJSON());
  if (typeof CompressionStream === "function") {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      const buf = await new Response(stream).arrayBuffer();
      return "1" + bytesToBase64Url(new Uint8Array(buf));
    } catch {
      // 壓縮失敗（極罕見）就退回原始編碼，不讓分享功能整個失效。
    }
  }
  return "0" + bytesToBase64Url(new TextEncoder().encode(json));
}

// 網址參數是不可信任的外部輸入（可能被手動改過、截斷、或來自更新版本的編碼），
// 任何一步失敗都回傳 null，呼叫端就當作沒有分享資料處理，不讓頁面掛掉。
export async function decodeShareParam(param) {
  if (!param || param.length < 2) return null;
  const version = param[0];
  const payload = param.slice(1);
  try {
    const bytes = base64UrlToBytes(payload);
    if (version === "1") {
      if (typeof DecompressionStream !== "function") return null;
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      const buf = await new Response(stream).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }
    if (version === "0") {
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch {
    return null;
  }
  return null;
}
