import { hasLinkBetweenTypes, anyNodeParamMatches } from "../../js/core/tutorialChecks.js";

export default {
  steps: [
    {
      title: { zh: "第一步：用 Fresnel 輸出驅動清漆層", en: "Step 1: Drive a Clearcoat with the Fresnel Output" },
      instruction: {
        zh: "加入光澤 BSDF（Glossy BSDF，粗糙度調到 0.05）跟混合著色器（Mix Shader），把原本的原理化 BSDF 跟光澤 BSDF 分別接到兩個著色器輸入，混合著色器接到材質輸出。\n\n加入層權重（Layer Weight），把它的 Fresnel 輸出接到混合著色器的 Fac。Blend 先保持預設 0.5。",
        en: "Add a Glossy BSDF (Roughness 0.05) and a Mix Shader; connect the existing Principled BSDF and the Glossy BSDF to its two Shader inputs, then wire Mix Shader to Material Output.\n\nAdd a Layer Weight node and connect its Fresnel output to Mix Shader's Fac. Leave Blend at the default 0.5 for now.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_layer_weight", "fresnel", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第二步：把 Blend 拉高，看邊緣效果變集中", en: "Step 2: Raise Blend and Watch the Edge Effect Concentrate" },
      instruction: {
        zh: "把層權重的 Blend 拉到接近 1（例如 0.9）。清漆反光會變得只集中在極端側邊的一小圈範圍，中間大部分區域幾乎看不到——這是因為 Blend 在 Fresnel 輸出的公式裡實際上是在調整一個等效的 IOR 數值，數值越大，過渡曲線的「膝點」越靠近邊緣。",
        en: "Raise Layer Weight's Blend close to 1 (e.g. 0.9). The clearcoat highlight now concentrates into a thin ring right at the extreme edges, barely visible everywhere else — because Blend actually adjusts an equivalent IOR value inside the Fresnel output's formula; higher values push the transition's 'knee' closer to the silhouette.",
      },
      check: (graph) => anyNodeParamMatches(graph, "input_layer_weight", "blend", (v) => v >= 0.8),
    },
    {
      title: { zh: "第三步：換成 Facing 輸出，比較差異", en: "Step 3: Switch to the Facing Output and Compare" },
      instruction: {
        zh: "把混合著色器的 Fac 改接層權重的 Facing 輸出（取代原本接的 Fresnel）。畫面過渡感會變得均勻很多，不再有剛剛那種銳利的邊緣「膝點」——因為 Facing 的公式就是單純的「1 減去法線與視角的夾角餘弦」，是一個固定不變的曲線，完全不吃 Blend 這個參數。",
        en: "Reconnect Mix Shader's Fac to Layer Weight's Facing output instead (replacing Fresnel). The transition becomes much more even, without the sharp edge 'knee' from before — because Facing's formula is simply '1 minus the cosine of the angle between the normal and view direction', a fixed curve that doesn't use Blend at all.",
      },
      check: (graph) => hasLinkBetweenTypes(graph, "input_layer_weight", "facing", "shader_mix_shader", "fac"),
    },
    {
      title: { zh: "第四步：確認 Blend 現在不再有作用", en: "Step 4: Confirm Blend No Longer Does Anything" },
      instruction: {
        zh: "試著把 Blend 調回很低的數值（例如 0.1）。畫面應該完全沒有變化——這就證實了 Facing 輸出真的不受 Blend 影響。實務上：想要「效果強度可以自己調」就用 Fresnel 輸出；只是想要一個簡單、不需要調整的漸層就用 Facing。",
        en: "Try dragging Blend back down to a low value (e.g. 0.1). The result should look identical — confirming Facing really doesn't respond to Blend. In practice: use Fresnel when you want a tunable effect strength; use Facing when you just want a simple gradient with nothing to adjust.",
      },
      check: (graph) => anyNodeParamMatches(graph, "input_layer_weight", "blend", (v) => v <= 0.2),
    },
  ],
  quiz: [
    {
      question: {
        zh: "層權重（Layer Weight）的 Blend 滑桿，會影響它的哪一個輸出？",
        en: "Which of Layer Weight's outputs does the Blend slider actually affect?",
      },
      options: [
        { zh: "只影響 Fresnel", en: "Only Fresnel" },
        { zh: "只影響 Facing", en: "Only Facing" },
        { zh: "兩個都影響", en: "Both" },
        { zh: "兩個都不影響", en: "Neither" },
      ],
      correctIndex: 0,
      explanation: {
        zh: "Facing 的公式是固定的 1-abs(dot(N,ViewDir))，完全沒有用到 Blend 參數；Blend 只會改變 Fresnel 那條曲線的形狀（數值越大，效果越集中在邊緣）。想調整過渡曲線陡峭程度，一定要確定接的是 Fresnel 輸出，不是 Facing。",
        en: "Facing's formula is a fixed 1-abs(dot(N,ViewDir)) that never reads the Blend parameter at all; Blend only reshapes the Fresnel curve (higher values concentrate the effect more at the edges). To control the falloff's steepness, make sure you're using the Fresnel output, not Facing.",
      },
    },
  ],
};
