import { anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_pbr_roughness_microfacets",
  level: { zh: "中階", en: "Intermediate" },
  name: {
    zh: "為什麼粗糙度會讓反光暈開，而不是把顏色調暗",
    en: "Why Roughness Spreads Out Highlights Instead of Just Dimming Them",
  },
  description: {
    zh: "這篇不是教「粗糙度（Roughness）滑桿越大表面越霧」——那個滑一下就看出來了。這篇要講的是背後的原因：表面其實是由無數個微小的鏡面（微表面，microfacet）組成，粗糙度調的是這些鏡面朝向有多分散，不是直接調亮度。搞懂這個，你才會知道「金屬看起來很塑膠感」十之八九是粗糙度沒調對，不是底色錯了。",
    en: "This isn't 'turn up Roughness and the surface looks foggier' — a single drag shows you that. This one explains why: a surface is made of countless tiny mirror-like facets (microfacets), and Roughness controls how scattered their tilt is — it doesn't directly dim anything. Understand this and you'll know that a metal 'looking plastic-y' is almost always a roughness problem, not a base color problem.",
  },
  startGraph: {
    nodes: [
      { id: "t_prm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_prm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_prm_l1", fromNode: "t_prm_principled", fromSocket: "bsdf", toNode: "t_prm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_prm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      {
        id: "te_prm_principled",
        typeId: "shader_principled_bsdf",
        x: 600,
        y: 100,
        params: { baseColor: [0.85, 0.15, 0.1, 1], roughness: 0.85, metallic: 1 },
      },
    ],
    links: [{ id: "te_prm_l1", fromNode: "te_prm_principled", fromSocket: "bsdf", toNode: "te_prm_out", toSocket: "surface" }],
  },
  steps: [
    {
      title: { zh: "第一步：先做一顆拋光金屬球", en: "Step 1: Start with a Polished Metal Sphere" },
      instruction: {
        zh: "把原理化 BSDF 的底色（Base Color）改成飽和的顏色（例如紅色 0.85/0.15/0.1）、金屬度（Metallic）調到 1、粗糙度（Roughness）調到很低（例如 0.03，接近鏡面）。",
        en: "Change Principled BSDF's Base Color to a saturated color (e.g. red 0.85/0.15/0.1), set Metallic to 1, and set Roughness very low (e.g. 0.03, near-mirror).",
      },
      check: (graph) =>
        anyNodeParamMatches(
          graph,
          "shader_principled_bsdf",
          "baseColor",
          (v) => Array.isArray(v) && Math.max(v[0], v[1], v[2]) - Math.min(v[0], v[1], v[2]) > 0.3
        ) &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "metallic", (v) => v >= 0.9) &&
        anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v <= 0.05),
    },
    {
      title: { zh: "第二步：旋轉球體，注意反光是一個很小很亮的點", en: "Step 2: Rotate — Notice the Highlight Is a Tiny, Intense Spot" },
      instruction: {
        zh: "拖曳旋轉球體。你會看到打光形成的亮點又小又刺眼（幾乎死白），球體其餘大部分區域偏暗，而且如果仔細看，亮點附近隱約看得出環境反射出的形狀（不是一片死黑）。\n\n原因：表面其實不是真的平滑，是由無數個微觀尺度的小鏡面（微表面，microfacet）拼成的，粗糙度＝這些小鏡面的朝向偏離「平均表面法線」的程度。粗糙度很低時，幾乎所有小鏡面都朝同一個方向——所以一整批入射光會被集中反射到幾乎同一個方向，你才會看到又小又亮的鏡面反光，其餘角度自然就暗，因為那些角度沒有小鏡面在幫你把光反過來。",
        en: "Drag to rotate the sphere. The highlight is small and blinding (nearly pure white), while most of the rest of the surface stays dark — and if you look closely near the highlight, you can faintly make out shapes from the reflected environment (not just flat black).\n\nWhy: the surface isn't actually smooth — it's made of countless microscopic mirror-like facets (microfacets), and Roughness is how far those facets' tilts deviate from the average surface normal. At low roughness, nearly all facets point the same way, so a whole batch of incoming light gets reflected into almost the same outgoing direction — that's the small, intense mirror highlight. Everywhere else stays dark because there are no facets there to bounce light toward your eye.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v <= 0.05),
    },
    {
      title: { zh: "第三步：調高粗糙度，反光暈開成一大片柔光", en: "Step 3: Raise Roughness — the Highlight Blooms into a Soft Glow" },
      instruction: {
        zh: "把粗糙度（Roughness）調到 0.85（其他不要動）。原本又小又刺眼的亮點會消失，取而代之是一大片柔和的光暈，覆蓋球體相當大的面積，環境反射的清晰形狀也會變得模糊一片。\n\n⚠️ 注意畫面整體：雖然沒有任何一點跟剛才一樣死白刺眼，但球體整體看起來反而更亮、更均勻——這不是「粗糙度把顏色調暗了」，是同一批入射光被重新分配：粗糙度高時，微表面的朝向散布得很開，每道入射光反射出去的方向都不太一樣，於是同樣的光能量被攤開到一大片角度範圍，單一像素分到的量變少（不再刺眼），但攤開後總共照亮的面積變大很多。",
        en: "Set Roughness to 0.85 (leave everything else alone). The tiny blinding highlight disappears, replaced by a large, soft glow covering a much bigger area of the sphere, and the crisp reflected environment shapes turn into a blur.\n\n⚠️ Look at the overall picture: even though no single point is as blinding as before, the sphere as a whole now reads brighter and more evenly lit — that's not 'roughness dimmed the color', it's the same batch of incoming light being redistributed. At high roughness, microfacet tilts are scattered widely, so each incoming ray bounces off in a slightly different direction — the same light energy gets spread across a much wider range of angles. Each pixel gets less (so nothing blinds you), but the total lit area grows a lot.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v >= 0.8),
    },
    {
      title: { zh: "第四步：粗糙度才是「材質手感」的關鍵，不是底色", en: "Step 4: Roughness Is the Real Key to 'Material Feel', Not Base Color" },
      instruction: {
        zh: "很多人做金屬材質時，第一直覺是「調底色」，但底色只決定反光被染成什麼顏色（見同系列教學「為什麼金屬的反光有顏色」），真正決定「這個表面摸起來/看起來是拋光的還是霧面的」的是粗糙度。同一顆球，粗糙度從 0.03 跳到 0.85，視覺質感的差異遠大於隨便換一個底色。\n\n如果拿不準某種材質的粗糙度該填多少，不用用猜的——「材質參考表」頁面整理了鏡面／拋光金屬／消光塑膠／橡膠等常見材質的粗糙度數值範圍，可以直接查。",
        en: "When making a metal material, most people's first instinct is to tweak Base Color — but Base Color only decides what color the reflection gets tinted (see the companion tutorial 'Why Metal Reflections Are Colored'). What actually determines whether a surface reads as polished or matte is Roughness. Going from 0.03 to 0.85 on the same sphere changes the visual feel far more than swapping the base color ever would.\n\nIf you're unsure what roughness value a material should use, don't guess — the Reference page has a table of typical roughness ranges for mirror/polished metal, matte plastic, rubber, and more, ready to look up.",
      },
      check: (graph) => anyNodeParamMatches(graph, "shader_principled_bsdf", "roughness", (v) => v >= 0.8),
    },
  ],
  quiz: [
    {
      question: {
        zh: "為什麼提高粗糙度（Roughness）會讓金屬反光「暈開」變成一大片柔光，而不是單純把整體顏色調暗？",
        en: "Why does raising Roughness make a metal's highlight 'bloom' into a large soft glow, instead of simply dimming the overall color?",
      },
      options: [
        {
          zh: "因為表面由無數個微小鏡面（微表面）構成，粗糙度愈高代表這些鏡面朝向愈分散，同一批入射光因此被反射到更廣的角度範圍，而不是全部集中往同一方向",
          en: "The surface is made of countless microfacets; higher roughness scatters their tilt more, so the same batch of incoming light gets reflected across a wider range of angles instead of all toward one direction",
        },
        { zh: "因為粗糙度數值會直接乘上 Base Color 的 RGB 讓它變暗", en: "The roughness value directly multiplies Base Color's RGB to darken it" },
        { zh: "因為粗糙度愈高，材質的金屬度（Metallic）會被自動調低", en: "Higher roughness automatically lowers Metallic" },
        { zh: "因為粗糙度只影響凹凸感，跟反光範圍無關", en: "Roughness only affects bumpiness and has nothing to do with highlight spread" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "粗糙度不是亮度滑桿，是微表面朝向的離散程度：粗糙度低時幾乎所有微小鏡面都對齊同一方向，光被集中反射成一個又小又亮的點；粗糙度高時微表面朝向四散，同樣的光能量被攤開到更大範圍，單點變暗但整體覆蓋面積變大——這就是為什麼調高粗糙度後畫面看起來『更亮更均勻』而不是死暗一片。",
        en: "Roughness isn't a brightness slider — it's how scattered the microfacet tilts are. At low roughness, nearly all facets align the same way, concentrating light into one small, bright spot. At high roughness, facet tilts scatter widely, spreading the same light energy across a much larger area — dimmer per pixel, but covering more of the surface. That's why cranking roughness up makes the sphere look 'brighter and more even', not simply darker.",
      },
    },
  ],
};
