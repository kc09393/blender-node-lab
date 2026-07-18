// Socket 型別系統：定義有哪些型別、彼此的隱式轉換規則（比照 Blender），
// 以及把「已知型別的 GLSL 運算式」轉成「目標型別的 GLSL 運算式」的工具函式。

export const TYPES = {
  SHADER: "shader",
  COLOR: "color",
  VECTOR: "vector",
  FLOAT: "float",
  BOOL: "bool",
};

const TYPE_ORDER = [TYPES.FLOAT, TYPES.VECTOR, TYPES.COLOR];

// shader 型別完全獨立，不能跟任何資料型別互轉；bool 目前僅能接 bool。
export function socketsCompatible(fromType, toType) {
  if (fromType === toType) return true;
  if (fromType === TYPES.SHADER || toType === TYPES.SHADER) return false;
  if (fromType === TYPES.BOOL || toType === TYPES.BOOL) return false;
  return TYPE_ORDER.includes(fromType) && TYPE_ORDER.includes(toType);
}

// 把一段已知型別的 GLSL 運算式，轉換成目標型別的 GLSL 運算式。呼叫前應先用
// socketsCompatible 確認可以轉換。
export function castExpr(expr, fromType, toType) {
  if (fromType === toType) return expr;
  const key = `${fromType}->${toType}`;
  switch (key) {
    case "float->vector":
      return `vec3(${expr})`;
    case "float->color":
      return `vec4(vec3(${expr}), 1.0)`;
    case "vector->color":
      return `vec4(${expr}, 1.0)`;
    case "vector->float":
      return `(((${expr}).x + (${expr}).y + (${expr}).z) / 3.0)`;
    case "color->vector":
      return `(${expr}).rgb`;
    case "color->float":
      return `dot((${expr}).rgb, vec3(0.2126, 0.7152, 0.0722))`;
    default:
      throw new Error(`不支援的型別轉換: ${fromType} -> ${toType}`);
  }
}

// 把 JS 端存的預設值（未接線時使用）轉成 GLSL 常數運算式。
// vector 型別的預設值可以是 "UV"/"NORMAL" 這種特殊字串，代表「使用畫面 UV／目前法線當作座標」。
// ctxTarget 區分兩種編譯目標：
// - "fragment"（預設）：材質表面（Surface）圖，"UV"/"NORMAL" 對應 fragment shader 的
//   vUv varying／目前的可變 normal 區域變數。
// - "vertex"：Displacement 圖專用的第二輪編譯（見 compiler.js 的 compileGraph），
//   在頂點著色器裡執行，"UV"/"NORMAL" 改對應原始的 uv/objectNormal 頂點屬性
//   （fragment 端的 vUv/normal 這兩個變數在頂點階段還不存在）。
export function literalExpr(value, type, ctxTarget = "fragment") {
  switch (type) {
    case TYPES.FLOAT:
      return glslFloat(value);
    case TYPES.COLOR: {
      const [r, g, b, a] = value;
      return `vec4(${glslFloat(r)}, ${glslFloat(g)}, ${glslFloat(b)}, ${glslFloat(a ?? 1)})`;
    }
    case TYPES.VECTOR: {
      if (value === "UV") return ctxTarget === "vertex" ? "vec3(uv, 0.0)" : "vec3(vUv, 0.0)";
      if (value === "NORMAL") return ctxTarget === "vertex" ? "objectNormal" : "normal";
      const [x, y, z] = value;
      return `vec3(${glslFloat(x)}, ${glslFloat(y)}, ${glslFloat(z ?? 0)})`;
    }
    case TYPES.BOOL:
      return value ? "true" : "false";
    default:
      throw new Error(`未知的 socket 型別: ${type}`);
  }
}

function glslFloat(n) {
  const num = Number(n) || 0;
  return Number.isInteger(num) ? `${num}.0` : `${num}`;
}
