export default {
  id: "liquid_chrome",
  name: { zh: "液態鉻", en: "Liquid Chrome" },
  description: {
    zh: "菲涅爾接一條三色顏色漸變（藍→白→粉）直接當底色——液態金屬感全靠這個隨視角變化的漸層色，不是靠粗糙度或凹凸。",
    en: "Fresnel feeds a 3-color Color Ramp (blue→white→pink) straight into Base Color — the liquid-metal look comes entirely from this angle-dependent color shift, not roughness or bump.",
  },
  graph: {
    nodes: [
      { id: "chrome_out", typeId: "output_material", x: 760, y: 160, params: {} },
      {
        id: "chrome_principled",
        typeId: "shader_principled_bsdf",
        x: 500,
        y: 160,
        params: { roughness: 0.025, metallic: 1, alpha: 1 },
      },
      { id: "chrome_fresnel", typeId: "input_fresnel", x: 0, y: 100, params: { ior: 1.6 } },
      {
        id: "chrome_ramp",
        typeId: "converter_color_ramp",
        x: 240,
        y: 100,
        params: {
          stops: [
            { position: 0, color: [0.5, 0.62, 0.92, 1] },
            { position: 0.5, color: [0.85, 0.87, 0.9, 1] },
            { position: 1, color: [0.95, 0.55, 0.78, 1] },
          ],
        },
      },
    ],
    links: [
      { id: "chrome_l1", fromNode: "chrome_fresnel", fromSocket: "fac", toNode: "chrome_ramp", toSocket: "fac" },
      { id: "chrome_l2", fromNode: "chrome_ramp", fromSocket: "color", toNode: "chrome_principled", toSocket: "baseColor" },
      { id: "chrome_l3", fromNode: "chrome_principled", fromSocket: "bsdf", toNode: "chrome_out", toSocket: "surface" },
    ],
  },
};
