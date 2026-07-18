import { hasNodeOfType, hasLinkBetweenTypes, nodeHasIncomingFromType, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  id: "tutorial_sss_texture_driven_color",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "次表面散射也能接紋理：雲霧狀玉石", en: "Subsurface Scattering Can Take a Texture Too: Cloudy Jade" },
  description: {
    zh: "次表面散射（Subsurface Scattering）的顏色（Color）插槽平常都是接一個固定顏色，但它跟其他顏色輸入一樣，也可以接紋理。這篇用雜訊紋理＋顏色漸變驅動 SSS 的顏色，做出玉石內部深淺不一的雲霧狀翠綠紋理，而不是死板的單一綠色。",
    en: "Subsurface Scattering's Color socket is usually wired to one fixed color, but like any other color input, it can take a texture too. This tutorial drives SSS's color with a Noise Texture through a Color Ramp, creating jade's cloudy internal green veining instead of one flat, lifeless green.",
  },
  startGraph: {
    nodes: [{ id: "t_stdc_out", typeId: "output_material", x: 900, y: 200, params: {} }],
    links: [],
  },
  endGraph: {
    nodes: [
      { id: "te_stdc_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_stdc_sss", typeId: "shader_subsurface_scattering", x: 820, y: 100, params: { scale: 0.5, radius: [0.25, 0.6, 0.4] } },
      {
        id: "te_stdc_ramp",
        typeId: "converter_color_ramp",
        x: 560,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.05, 0.25, 0.15, 1] },
            { position: 0.5, color: [0.15, 0.55, 0.35, 1] },
            { position: 1, color: [0.35, 0.75, 0.5, 1] },
          ],
        },
      },
      { id: "te_stdc_noise", typeId: "texture_noise", x: 300, y: 100, params: { scale: 4, detail: 5, distortion: 2 } },
    ],
    links: [
      { id: "te_stdc_l1", fromNode: "te_stdc_sss", fromSocket: "bsdf", toNode: "te_stdc_out", toSocket: "surface" },
      { id: "te_stdc_l2", fromNode: "te_stdc_ramp", fromSocket: "color", toNode: "te_stdc_sss", toSocket: "color" },
      { id: "te_stdc_l3", fromNode: "te_stdc_noise", fromSocket: "fac", toNode: "te_stdc_ramp", toSocket: "fac" },
    ],
  },
  steps: [
    {
      title: { zh: "第一步：先接一個固定的綠色", en: "Step 1: Start with a Flat Green" },
      instruction: {
        zh: "加入次表面散射（Subsurface Scattering），直接接到材質輸出（Material Output）。顏色（Color）改成綠色（例如 0.15/0.55/0.35），先看看固定單一顏色的樣子——整顆球會是很均勻、有點死板的綠色玉石感。",
        en: "Add Subsurface Scattering and connect it directly to Material Output. Set Color to green (e.g. 0.15/0.55/0.35) — first see what a single flat color looks like: a uniform, somewhat lifeless green gem.",
      },
      check: (graph) =>
        hasNodeOfType(graph, "shader_subsurface_scattering") && nodeHasIncomingFromType(graph, "output_material", "shader_subsurface_scattering"),
    },
    {
      title: { zh: "第二步：加入雜訊紋理接顏色漸變", en: "Step 2: Add Noise Texture into a Color Ramp" },
      instruction: {
        zh: "加入雜訊紋理（Noise Texture，扭曲 Distortion 調到 2 左右做出雲霧感）跟顏色漸變（Color Ramp），把雜訊的係數（Fac）接到顏色漸變的係數，停駐點設成深綠到淺綠的漸層（例如 0=深綠、0.5=中綠、1=淺綠）。",
        en: "Add a Noise Texture (set Distortion to around 2 for a cloudy feel) and a Color Ramp, connect Noise's Fac to Color Ramp's Fac, with stops going dark-to-light green (e.g. 0=dark green, 0.5=mid green, 1=light green).",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "texture_noise", "fac", "converter_color_ramp", "fac"),
    },
    {
      title: { zh: "第三步：把顏色漸變接進 SSS 的顏色插槽", en: "Step 3: Wire the Color Ramp into SSS's Color Socket" },
      instruction: {
        zh: "把顏色漸變的顏色（Color）輸出接到次表面散射的顏色（Color）輸入，取代原本的固定顏色。畫面應該會出現深淺不一、雲霧狀的翠綠紋理，而不是均勻的單一綠色——這就是「顏色插槽其實都能接紋理，不是只能填色票」的證明。",
        en: "Connect Color Ramp's Color output to Subsurface Scattering's Color input, replacing the flat color. You should now see cloudy, uneven green veining instead of a uniform tone — proof that 'color sockets accept textures too, not just a color swatch.'",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "converter_color_ramp", "color", "shader_subsurface_scattering", "color"),
    },
    {
      title: { zh: "第四步：調整 Radius，讓綠色分量走得更遠", en: "Step 4: Tune Radius So Green Travels Further" },
      instruction: {
        zh: "把各色道半徑（Radius）的 G（第二個數值）調得比 R（第一個）跟 B（第三個）都大（例如 0.25/0.6/0.4）。邊緣逆光處會透出偏綠的光暈，而不是像皮膚教學那樣偏紅——同一個節點、同樣的公式，只是換了哪個色道走得比較遠，就能做出完全不同材質的通透感。",
        en: "Set Radius's G (second value) higher than R (first) and B (third) — e.g. 0.25/0.6/0.4. Backlit edges now glow greenish instead of reddish like the skin tutorial — same node, same formula, just a different channel traveling further, giving a completely different material's sense of translucency.",
      },
      check: (graph) =>
        anyNodeParamMatches(graph, "shader_subsurface_scattering", "radius", (v) => Array.isArray(v) && v[1] > v[0] && v[1] > v[2]),
    },
  ],
};
