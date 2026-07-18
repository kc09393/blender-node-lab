import { hasNodeOfType, nodeHasIncomingFromType, hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_velvet_sheen",
  level: { zh: "進階", en: "Advanced" },
  name: { zh: "Sheen BSDF：天鵝絨布料", en: "Sheen BSDF: Velvet Fabric" },
  description: {
    zh: "絨光 BSDF（Sheen BSDF）單獨使用看不出效果，一定要疊在別的材質上面才有意義。用菲涅爾（Fresnel）控制疊加比例，做出布料逆光時邊緣才會出現的絨毛微光。",
    en: "Sheen BSDF does nothing meaningful on its own — it only matters layered on top of another material. Use Fresnel to control the blend so the fuzzy edge glow only shows up at grazing/backlit angles, like real fabric.",
  },
  startGraph: {
    nodes: [
      { id: "t_vel_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vel_principled", typeId: "shader_principled_bsdf", x: 0, y: 60, params: { baseColor: [0.3, 0.05, 0.12, 1], roughness: 0.85 } },
    ],
    links: [{ id: "t_vel_l0", fromNode: "t_vel_principled", fromSocket: "bsdf", toNode: "t_vel_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vel_out", typeId: "output_material", x: 1100, y: 220, params: {} },
      { id: "te_vel_mix", typeId: "shader_mix_shader", x: 800, y: 160, params: {} },
      { id: "te_vel_principled", typeId: "shader_principled_bsdf", x: 500, y: 40, params: { baseColor: [0.3, 0.05, 0.12, 1], roughness: 0.85 } },
      { id: "te_vel_sheen", typeId: "shader_sheen_bsdf", x: 500, y: 280, params: { roughness: 0.75 } },
      { id: "te_vel_fresnel", typeId: "input_fresnel", x: 500, y: 460, params: {} },
    ],
    links: [
      { id: "te_vel_l1", fromNode: "te_vel_mix", fromSocket: "bsdf", toNode: "te_vel_out", toSocket: "surface" },
      { id: "te_vel_l2", fromNode: "te_vel_principled", fromSocket: "bsdf", toNode: "te_vel_mix", toSocket: "shader1" },
      { id: "te_vel_l3", fromNode: "te_vel_sheen", fromSocket: "bsdf", toNode: "te_vel_mix", toSocket: "shader2" },
      { id: "te_vel_l4", fromNode: "te_vel_fresnel", fromSocket: "fac", toNode: "te_vel_mix", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：加入 Sheen BSDF", en: "Step 1: Add a Sheen BSDF" },
      instruction: {
        zh: "從「著色器 Shader」分類拖入絨光 BSDF（Sheen BSDF），顏色（Color）可以維持接近白色/淡粉色，先不用接線——單獨接到輸出你會發現球體幾乎是全黑的，這是因為它的底色設計成全黑，只靠邊緣光貢獻亮度。",
        en: "Drag in a Sheen BSDF from the Shader category. Keep Color near white/light pink for now — don't wire it up yet. If you connected it alone to Output you'd see an almost-black sphere, since its base color is designed to be pure black, contributing brightness only through the edge glow.",
      },
      check: (graph) => hasNodeOfType(graph, "shader_sheen_bsdf"),
    },
    {
      title: { zh: "第二步：用 Mix Shader 疊在布料底色上", en: "Step 2: Layer It Over the Fabric Base with Mix Shader" },
      instruction: {
        zh: "拖入混合著色器（Mix Shader），上面接原本的原理化 BSDF（Principled BSDF，布料底色），下面接絨光 BSDF（Sheen BSDF），接到材質輸出（Material Output）取代原本的直接連線。這時候 Fac 固定值就能看到邊緣多了一圈亮光。",
        en: "Drag in a Mix Shader, connect the existing Principled BSDF (fabric base) to the top and Sheen BSDF to the bottom, then wire it to Material Output, replacing the direct connection. Even with a fixed Fac, you should already see a bright rim appear.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_mix_shader") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_principled_bsdf") &&
        nodeHasIncomingFromType(graph, "shader_mix_shader", "shader_sheen_bsdf") &&
        nodeHasIncomingFromType(graph, "output_material", "shader_mix_shader"),
    },
    {
      title: { zh: "第三步：用 Fresnel 讓絨毛光只出現在邊緣", en: "Step 3: Use Fresnel to Confine the Glow to the Edges" },
      instruction: {
        zh: "加入菲涅爾（Fresnel）節點（輸入 Input 分類），把它的係數（Fac）輸出接到混合著色器（Mix Shader）的 Fac。現在正面看得到布料底色，只有側邊/逆光的邊緣才會透出絨毛光暈——這才是天鵝絨真正的樣子。",
        en: "Add a Fresnel node (Input category) and connect its Fac output to Mix Shader's Fac. Now the fabric base color shows head-on, and the fuzzy glow only appears at grazing/backlit edges — that's what real velvet looks like.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_fresnel", "fac", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第四步：調高 Sheen Roughness 讓光暈更柔和", en: "Step 4: Raise Sheen Roughness for a Softer Glow" },
      instruction: {
        zh: "把絨光 BSDF（Sheen BSDF）的粗糙度（Roughness）調到 0.7 以上，邊緣光暈會變得更寬、更柔和，比較接近真實絨布蓬鬆的質感，而不是一圈銳利的亮邊。",
        en: "Raise Sheen BSDF's Roughness above 0.7 — the edge glow becomes wider and softer, closer to the plush look of real velvet instead of a sharp bright rim.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_sheen_bsdf", "roughness", (v) => typeof v === "number" && v >= 0.7),
    },
  ],
  quiz: [
    {
      question: {
        zh: "絨光 BSDF（Sheen BSDF）單獨接到材質輸出、不疊在任何其他材質上面時，效果如何？",
        en: "If Sheen BSDF is wired straight to Material Output, with nothing else layered under it, what happens?",
      },
      options: [
        { zh: "會產生完整逼真的絨布材質", en: "It produces a complete, realistic velvet material" },
        { zh: "幾乎看不出效果，因為它設計上就是要疊加在別的材質上才有意義", en: "It barely does anything — it's designed to only matter layered on top of another material" },
        { zh: "整顆球會變全黑", en: "The whole sphere turns solid black" },
        { zh: "整顆球會變透明", en: "The whole sphere becomes transparent" },
      ],
      correctIndex: 1,
      explanation: {
        zh: "Sheen BSDF 模擬的是布料纖維逆光時的微弱邊緣光暈，這個效果本身很微弱、單獨看幾乎沒有存在感，一定要用 Mix Shader／Add Shader 疊在原本的底材質上面，才會呈現「平常看起來正常、逆光時邊緣才泛起絨毛微光」的效果。",
        en: "Sheen BSDF simulates the faint edge glow from backlit fabric fibers — that effect alone is subtle and barely noticeable by itself. It needs to be layered on top of a base material with Mix Shader or Add Shader to produce the 'looks normal head-on, glows faintly at backlit edges' look.",
      },
    },
  ],
};
