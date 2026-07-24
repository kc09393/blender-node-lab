export default {
  id: "tutorial_voronoi_mosaic",
  level: { zh: "中階", en: "Intermediate" },
  name: { zh: "沃羅諾伊馬賽克：隨機色塊拼貼", en: "Voronoi Mosaic: Random Tile Colors" },
  description: {
    zh: "沃羅諾伊紋理（Voronoi Texture）的 Color 輸出會給每個細胞一個獨立的隨機顏色，很適合做馬賽克磁磚、卵石地板這種「每一塊顏色都不太一樣」的效果——這跟石頭教學用 Distance 做斑駁色調是完全不同的技巧。",
    en: "Voronoi Texture's Color output gives each cell its own random color — great for mosaic tiles, cobblestone floors, or anything where 'each patch is a slightly different color'. This is a completely different technique from the Stone tutorial's Distance-based mottling.",
  },
  startGraph: {
    nodes: [
      { id: "t_vm_out", typeId: "output_material", x: 900, y: 200, params: {} },
      { id: "t_vm_principled", typeId: "shader_principled_bsdf", x: 600, y: 100, params: {} },
    ],
    links: [{ id: "t_vm_l1", fromNode: "t_vm_principled", fromSocket: "bsdf", toNode: "t_vm_out", toSocket: "surface" }],
  },
  endGraph: {
    nodes: [
      { id: "te_vm_out", typeId: "output_material", x: 1100, y: 200, params: {} },
      { id: "te_vm_principled", typeId: "shader_principled_bsdf", x: 820, y: 100, params: {} },
      { id: "te_vm_voronoi", typeId: "texture_voronoi", x: 320, y: 100, params: { scale: 10 } },
      { id: "te_vm_texcoord", typeId: "input_texture_coordinate", x: 80, y: 100, params: {} },
    ],
    links: [
      { id: "te_vm_l1", fromNode: "te_vm_principled", fromSocket: "bsdf", toNode: "te_vm_out", toSocket: "surface" },
      { id: "te_vm_l2", fromNode: "te_vm_voronoi", fromSocket: "color", toNode: "te_vm_principled", toSocket: "baseColor" },
      { id: "te_vm_l3", fromNode: "te_vm_texcoord", fromSocket: "generated", toNode: "te_vm_voronoi", toSocket: "vector" },
    ],
  },
  loadSteps: () => import("./voronoi_mosaic.steps.js").then((m) => m.default),
};
