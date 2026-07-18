// 把節點存的圖片（data URL，來自使用者上傳的檔案）轉成 THREE.Texture，並快取起來，
// 避免每次重新編譯 shader 都重新建立/重新解碼圖片。
import * as THREE from "three";

const cache = new Map(); // nodeId -> { src, texture }
let fallbackTexture = null;

// 還沒上傳圖片時，回傳一張 1x1 的中灰色貼圖，避免 sampler2D uniform 綁到 null 造成 WebGL 警告。
function getFallbackTexture() {
  if (fallbackTexture) return fallbackTexture;
  const data = new Uint8Array([200, 200, 200, 255]);
  fallbackTexture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  fallbackTexture.needsUpdate = true;
  return fallbackTexture;
}

// Extension（延展模式）對照 Three.js 的 wrap 常數；Clip 沒有原生對應的 wrap 模式，
// 交給節點自己的 GLSL 判斷 UV 是否落在 0-1 之外來處理，這裡先用 ClampToEdge 當底層 wrap，
// 避免超出範圍時去取樣到重複/鏡像貼圖造成的邊緣色彩污染。
function wrapModeFor(extension) {
  if (extension === "mirror") return THREE.MirroredRepeatWrapping;
  if (extension === "extend" || extension === "clip") return THREE.ClampToEdgeWrapping;
  return THREE.RepeatWrapping;
}

function applyTextureSettings(texture, node) {
  const wrap = wrapModeFor(node.params.extension);
  const filter = node.params.interpolation === "closest" ? THREE.NearestFilter : THREE.LinearFilter;
  // Non-Color：資料貼圖（法線/粗糙度/高度圖等）存的是數值不是顏色，不能做 sRGB→線性解碼，
  // 否則法線方向、粗糙度值會整體偏移。對應 Blender Image Texture 的 Color Space 選項。
  const colorSpace = node.params.colorSpace === "non_color" ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (
    texture.wrapS !== wrap ||
    texture.wrapT !== wrap ||
    texture.magFilter !== filter ||
    texture.minFilter !== filter ||
    texture.colorSpace !== colorSpace
  ) {
    texture.wrapS = wrap;
    texture.wrapT = wrap;
    texture.magFilter = filter;
    texture.minFilter = filter;
    texture.colorSpace = colorSpace;
    texture.needsUpdate = true;
  }
}

export function getTextureForNode(node) {
  // material.onBeforeCompile 是 Three.js 之後才非同步呼叫的 callback，呼叫當下這個節點
  // 有可能已經被使用者刪掉了（例如剛加入 Image Texture 馬上又刪除）；沒有這層防呆
  // 會在編譯排程的空檔期直接丟出 TypeError，而不是很單純地退回預設灰色貼圖。
  if (!node) return getFallbackTexture();
  const src = node.params.src;
  if (!src) return getFallbackTexture();
  const existing = cache.get(node.id);
  if (existing && existing.src === src) {
    // 延展模式／插值可能在同一張圖片上被改動過，快取命中時也要重新套用，
    // 不然使用者切換 Extension/Interpolation 下拉選單會完全沒反應。
    applyTextureSettings(existing.texture, node);
    return existing.texture;
  }

  const texture = new THREE.Texture();
  applyTextureSettings(texture, node);
  const img = new Image();
  img.onload = () => {
    texture.image = img;
    texture.needsUpdate = true;
  };
  img.src = src;
  cache.set(node.id, { src, texture });
  return texture;
}

export function clearTextureCache() {
  cache.clear();
}
