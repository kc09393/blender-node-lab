export default {
  id: "velvet",
  name: { zh: "天鵝絨布料", en: "Velvet Fabric" },
  description: {
    zh: "原理化 BSDF 的布料底色疊上絨光 BSDF，混合比例由菲涅爾驅動——絨布特有的邊緣微光只在逆光/側邊角度才會出現。",
    en: "Principled BSDF's fabric base is layered with Sheen BSDF, blended by Fresnel — so velvet's characteristic edge glow only shows up at grazing angles.",
  },
  graph: {
    nodes: [
      { id: "vel_out", typeId: "output_material", x: 800, y: 160, params: {} },
      {
        id: "vel_principled",
        typeId: "shader_principled_bsdf",
        x: 200,
        y: 60,
        params: { baseColor: [0.32, 0.05, 0.12, 1], roughness: 0.85, metallic: 0 },
      },
      { id: "vel_sheen", typeId: "shader_sheen_bsdf", x: 200, y: 300, params: { color: [0.9, 0.55, 0.6, 1], roughness: 0.6 } },
      { id: "vel_fresnel", typeId: "input_fresnel", x: 200, y: 480, params: { ior: 1.6 } },
      { id: "vel_mix", typeId: "shader_mix_shader", x: 520, y: 200, params: { fac: 0.3 } },
    ],
    links: [
      { id: "vel_l1", fromNode: "vel_principled", fromSocket: "bsdf", toNode: "vel_mix", toSocket: "shader1" },
      { id: "vel_l2", fromNode: "vel_sheen", fromSocket: "bsdf", toNode: "vel_mix", toSocket: "shader2" },
      { id: "vel_l3", fromNode: "vel_fresnel", fromSocket: "fac", toNode: "vel_mix", toSocket: "fac" },
      { id: "vel_l4", fromNode: "vel_mix", fromSocket: "bsdf", toNode: "vel_out", toSocket: "surface" },
    ],
  },
};
