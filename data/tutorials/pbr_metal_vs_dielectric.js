import { anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_pbr_metal_vs_dielectric",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "為什麼金屬的反光有顏色，塑膠的沒有", en: "Why Metal Reflections Are Colored, But Plastic's Aren't" },
  description: {
    zh: "這篇不是教你「金屬度（Metallic）這個滑桿是幹嘛的」——那個很多教學都提過。這篇要講的是背後的物理原因：為什麼把同一個底色（Base Color）分別套在塑膠跟金屬上，塑膠的反光永遠是白的，金屬的反光卻是有色的。理解這個，你才會知道 Metallic 幾乎不該填 0.5 這種中間值，它其實是在切換兩種完全不同的反光模型，不是「調多金屬」的連續刻度。",
    en: "This isn't 'here's what the Metallic slider does' — plenty of tutorials cover that already. This one explains the physics behind it: why the same Base Color produces a plastic with a white highlight, but a metal with a colored one. Understanding this tells you Metallic almost never belongs at 0.5 — it's switching between two fundamentally different reflection models, not a continuous 'how metal-like' dial.",
  },
  startGraph: {
    nodes: [
      { id: "t_pmd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_pmd_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_pmd_l1", fromNode: "t_pmd_principled", fromSocket: "bsdf", toNode: "t_pmd_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_pmd_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "te_pmd_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.1, 0.3, 0.9, 1], roughness: 0.15, metallic: 1 },
      },
    ],
    links: [{ id: "te_pmd_l1", fromNode: "te_pmd_principled", fromSocket: "bsdf", toNode: "te_pmd_out", toSocket: "surface" }],
  },
  steps: [
    {
      title: { zh: "第一步：先做一顆鮮豔的塑膠球", en: "Step 1: Start with a Vividly Colored Plastic Sphere" },
      instruction: {
        zh: "把原理化 BSDF 的底色（Base Color）改成很飽和的顏色（例如藍色 0.1/0.3/0.9，避免用灰白色，等一下才看得出差異）、粗糙度（Roughness）調低（例如 0.15，讓反光的光斑清楚一點）、金屬度（Metallic）維持 0。",
        en: "Change Principled BSDF's Base Color to a highly saturated color (e.g. blue 0.1/0.3/0.9 — avoid gray/white, or you won't see the difference later), lower Roughness (e.g. 0.15, so the specular highlight reads clearly), and keep Metallic at 0.",
      },
      check: (graph) =>
        anyNodeParamMatches(
          graph,
          "shader_principled_bsdf",
          "baseColor",
          (v) => Array.isArray(v) && Math.max(v[0], v[1], v[2]) - Math.min(v[0], v[1], v[2]) > 0.3
        ) &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v <= 0.2) &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v <= 0.1),
    },
    {
      title: { zh: "第二步：旋轉球體，注意反光的顏色", en: "Step 2: Rotate the Sphere and Watch the Highlight Color" },
      instruction: {
        zh: "拖曳旋轉球體，找到打光形成的亮點（高光）。仔細看：不管底色是什麼顏色，這個亮點幾乎都是白色/淺灰色的，不會被底色染色。\n\n這不是本沙盒的簡化，是真實物理：塑膠、木頭、皮膚這類「非金屬」（dielectric）材質，表面直接反射的光只占入射光的一小部分（大約 4%），而且這一小部分反射對所有顏色的光都一視同仁（不挑色），所以反光永遠接近白色。\n\n你平常看到的底色，其實是光「鑽進材質、被內部色素吸收/散射、再跑出來」的顏色，是完全不同的一條路徑。",
        en: "Drag to rotate the sphere and find the bright specular highlight. Look closely: no matter what Base Color you picked, that highlight is nearly white/light gray — never tinted by the base color.\n\nThis isn't a sandbox simplification, it's real physics: for dielectrics (non-metals) like plastic, wood, or skin, only a small fraction of incoming light (~4%) reflects directly off the surface, and that fraction doesn't discriminate by wavelength — so the highlight is always close to white.\n\nThe color you normally see comes from an entirely different path: light entering the material, bouncing around pigments, and re-emerging.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v <= 0.1),
    },
    {
      title: { zh: "第三步：切成金屬，同樣的顏色現在染到反光上了", en: "Step 3: Switch to Metal — Now the Same Color Tints the Reflection" },
      instruction: {
        zh: "把金屬度（Metallic）調到 1（其他都不要動）。畫面會馬上明顯變暗。\n\n⚠️ 先不用緊張，這是預期的：金屬完全沒有「鑽進材質再出來」這條路徑（金屬內部的自由電子幾乎立刻就把光吸收掉），所以底色不再代表散射出來的顏色，而是直接變成反射光本身的顏色。\n\n旋轉球體看反光的地方：現在應該會帶著明顯的藍色調，不再是白色。",
        en: "Set Metallic to 1 (leave everything else alone). The sphere should get noticeably darker overall.\n\n⚠️ That's expected, not a bug: metals have no 'light enters and re-emerges' path at all (free electrons inside the metal absorb the light almost instantly), so Base Color no longer represents scattered light — it directly becomes the color of the reflection itself.\n\nRotate again and look at the highlights: they should now carry an obvious blue tint instead of being white.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v >= 0.9),
    },
    {
      title: { zh: "第四步：為什麼 Metallic 幾乎不該填中間值", en: "Step 4: Why Metallic Almost Never Belongs Between 0 and 1" },
      instruction: {
        zh: "現實中一個表面要嘛是金屬、要嘛不是，沒有「一半金屬」這種材料——所以正式製作材質時，Metallic 幾乎永遠是精確的 0 或精確的 1，很少填 0.5 這種中間值。\n\n中間值只有兩種合理用途：(1) 兩種材質交界處的過渡遮罩（例如油漆剝落露出底下金屬，就是這次教學系列另一篇「邊緣磨損」在做的事）；(2) 材質本身有一層極薄的非金屬塗層蓋在金屬上（例如烤漆車身、指甲油）。\n\n如果你發現自己在某個材質上把 Metallic 固定填 0.3、0.6 這種數字（不是由紋理/遮罩驅動），通常代表要嘛應該乾脆是 0 或 1、要嘛該用兩層材質疊加而不是硬調一個中間值。",
        en: "In reality a surface is either metal or it isn't — there's no such thing as 'half metal' material. So in real production, Metallic is almost always exactly 0 or exactly 1, rarely a middle value.\n\nA fractional value only makes sense in two situations: (1) a transition mask between two materials (like paint chipping to reveal metal underneath — exactly what the 'Edge Wear' tutorial in this series does), or (2) a very thin non-metal coating over a metal (car paint clear coat, nail polish).\n\nIf you find yourself hard-coding Metallic to 0.3 or 0.6 on a material (not driven by a texture/mask), that's usually a sign it should just be 0 or 1, or that you need two layered materials instead of one fudged middle value.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v >= 0.9),
    },
  ],
  quiz: [
    {
      question: {
        zh: "為什麼非金屬（塑膠、木頭、皮膚）材質的高光反光通常是白色，而不是底色本身的顏色？",
        en: "Why is the specular highlight on a non-metal (plastic, wood, skin) usually white, instead of the base color?",
      },
      options: [
        { zh: "因為非金屬的表面反射只占入射光約 4%，而且對所有波長一視同仁", en: "Non-metal surface reflection is only ~4% of incoming light, and doesn't discriminate by wavelength" },
        { zh: "因為渲染引擎預設會把所有高光染成白色", en: "The renderer defaults to tinting all highlights white" },
        { zh: "因為粗糙度太低，顏色來不及顯示出來", en: "Roughness is too low for the color to show" },
        { zh: "因為底色本身其實一直是白色，只是看起來有顏色", en: "The base color is actually always white and just appears colored" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "非金屬表面直接反射的光很少（約 4%）且不挑波長，所以那一小撮反光看起來永遠接近白色；平常看到的底色，是光鑽進材質、被色素吸收/散射後再跑出來的完全不同路徑，不會出現在表面反射的高光上。",
        en: "Dielectric surfaces reflect very little light directly (~4%) and don't favor any wavelength, so that thin sliver of reflection always looks close to white. The color you normally see comes from an entirely different path — light entering the material, scattering off pigments, and re-emerging — which never shows up in the surface highlight itself.",
      },
    },
  ],
};
