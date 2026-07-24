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
  loadSteps: () => import("./velvet_sheen.steps.js").then((m) => m.default),
};
