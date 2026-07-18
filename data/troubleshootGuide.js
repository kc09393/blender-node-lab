// 疑難排解指南：彙整開發這個網站過程中真的踩過的坑（見 project memory 各篇「踩過的坑」段落），
// 不是憑空想像使用者可能會遇到什麼問題。每個 fix 都對應到專案裡實際驗證過的原因，
// 能連到教學的一律連，不能連的（架構限制/刻意簡化）就誠實講清楚不是 bug。
//
// item.tutorialId 是可選的 —— 指向 data/tutorials/*.js 的 id，供頁面渲染「看這篇教學 →」連結。
// item.presetId 是可選的 —— 指向 data/presets/*.js 的 id，供頁面渲染「看這個預設材質 →」連結。
// item.linkHref 是可選的通用站內連結（例如指到 reference.html），只在前兩者都不適用時才用。
// 三者互斥，一個 item 最多用其中一種。

const troubleshootGuide = [
  {
    id: "all_black",
    symptom: { zh: "畫面整顆球（或物體）是死黑色", en: "The sphere (or object) renders completely black" },
    items: [
      {
        cause: {
          zh: "材質輸出節點的 Base Color 插槽沒有接任何東西，或者以為 Emission 會自動發光但強度其實是 0",
          en: "Nothing is wired into the Material Output's Base Color socket, or you expected Emission to glow but its Strength is actually 0",
        },
        fix: {
          zh: "檢查材質輸出節點的 Base Color 是否真的有連線；如果要自體發光，要接到 Emission Color 並確認 Emission Strength 大於 0。",
          en: "Check whether Base Color on the Material Output is actually wired up. For self-glow, connect to Emission Color and make sure Emission Strength is greater than 0.",
        },
      },
      {
        cause: {
          zh: "向量數學（Vector Math）用外積（Cross Product）時，Vector 2 還停留在預設值 (0,0,0)——任何向量跟零向量外積永遠是零向量",
          en: "Vector Math is set to Cross Product but Vector 2 is left at its default (0,0,0) — the cross product of any vector with the zero vector is always zero",
        },
        fix: {
          zh: "把 Vector 2 改成非零方向（例如 (0,1,0)），外積才會算出有意義的結果。",
          en: "Change Vector 2 to a non-zero direction (e.g. (0,1,0)) so the cross product actually produces something.",
        },
        tutorialId: "tutorial_vector_math_tour",
      },
      {
        cause: {
          zh: "Math 節點用 Floor（無條件捨去）處理範圍只有 0-1 的輸入（例如雜訊的 Fac），floor(0~1) 永遠等於 0",
          en: "A Math node uses Floor on an input that only ranges 0-1 (like a Noise node's Fac) — floor(0~1) is always 0",
        },
        fix: {
          zh: "想要離散階梯效果，改用 Snap（吸附，本身就有間隔參數，在 0-1 範圍內就能正常分階）；或先用 Math 相乘把數值範圍放大，Floor 才有意義。",
          en: "For discrete steps, use Snap instead — it has its own interval parameter and works fine within 0-1. Or scale the value up first with Multiply so Floor has something to bite into.",
        },
        tutorialId: "tutorial_math_operations_tour",
      },
      {
        cause: {
          zh: "純金屬（Metallic = 1）在打光角度沒對到高光時，整顆球看起來明顯比非金屬暗很多，容易誤以為材質壞了",
          en: "A pure metal (Metallic = 1) looks much darker than a dielectric when the lighting angle doesn't hit a highlight, which can look like something's broken",
        },
        fix: {
          zh: "這其實是正確的物理現象，不是 bug——金屬沒有「光鑽進去再散射出來」這條路徑，只剩打光角度剛好對到的幾個亮點。轉動角度或換個網格檢查，會看到高光確實存在只是範圍很窄。",
          en: "This is correct physics, not a bug — metals have no subsurface-scattering path, so all you see are a few narrow highlights where the lighting angle lines up. Rotate the view or switch mesh to confirm the highlight is really there.",
        },
        tutorialId: "tutorial_pbr_metal_vs_dielectric",
      },
    ],
  },
  {
    id: "all_white",
    symptom: { zh: "畫面死白、或過曝看不出紋理細節", en: "The render is blown out white, with no visible texture detail" },
    items: [
      {
        cause: {
          zh: "雜訊紋理（Noise Texture）切到 Multifractal／Hybrid Multifractal／Ridged Multifractal／Hetero Terrain 這幾種非 fBM 類型——它們的輸出不會像 fBM 一樣自動落在 0-1，典型值常常落在 1.0 附近甚至更高",
          en: "Noise Texture is set to Multifractal, Hybrid Multifractal, Ridged Multifractal, or Hetero Terrain — unlike fBM these don't auto-normalize to 0-1, and typical output often sits around 1.0 or higher",
        },
        fix: {
          zh: "接一個顏色漸變（Color Ramp），把停駐點往右移（例如改成 0.1／0.6／1.3）重新校準範圍，不要沿用 fBM 習慣的 0/1 預設位置。",
          en: "Pipe it through a Color Ramp and shift the stops to the right (e.g. 0.1 / 0.6 / 1.3) to recalibrate the range — don't assume the fBM-style 0/1 defaults will work.",
        },
        tutorialId: "tutorial_ridged_terrain",
      },
      {
        cause: {
          zh: "顏色漸變（Color Ramp）色段設太窄，或用了緩動（Ease）插值，導致紋理被平滑到幾乎看不出變化",
          en: "The Color Ramp's stops are too close together, or it's using Ease interpolation, smoothing the pattern until it's nearly invisible",
        },
        fix: {
          zh: "改用線性（Linear）插值，並把兩個停駐點的間距放寬一點，讓過渡不要壓縮在極窄的範圍內。",
          en: "Switch to Linear interpolation and widen the gap between stops so the transition isn't squeezed into a tiny range.",
        },
      },
      {
        cause: {
          zh: "發光（Emission）強度設太高——尤其是直接沿用別的材質已經調好的數值，換一個顏色套用後整個表面被色調映射（Tone Mapping）吃成死白",
          en: "Emission Strength is set too high — especially when reusing a value tuned for a different material — and tone mapping crushes the whole surface to white once applied with a different color",
        },
        fix: {
          zh: "Emission Strength 不是複製別的材質的數值就一定能用，同樣的數字在不同顏色/不同場景下過曝程度不一樣。實際看渲染結果再微調，通常抓在 2-4 之間比較容易同時維持亮度感跟看得出顏色層次，真的需要「幾乎刺眼發光」的效果才拉到 6 以上。",
          en: "Copying an Emission Strength from another material doesn't guarantee it'll work — the same number blows out differently depending on color and scene. Tune it by eye against the actual render; 2-4 usually keeps both a sense of brightness and visible color, and only go above 6 if you specifically want a blinding glow.",
        },
        presetId: "neon_glass_tube",
      },
    ],
  },
  {
    id: "compile_broken",
    symptom: { zh: "接了線之後畫面完全沒反應，或整張圖匯入後少了東西", en: "Wiring nodes together does nothing, or an imported graph is missing pieces" },
    items: [
      {
        cause: {
          zh: "節點插槽名稱（socket key）拼錯——最容易誤踩的例子是白噪聲（White Noise）紋理的浮點輸出叫 value，不是很多人直覺猜的 fac",
          en: "A socket key is misspelled — the classic trap is White Noise Texture's float output being called value, not the fac many people guess by habit",
        },
        fix: {
          zh: "打開節點百科核對這個節點實際的輸出插槽名稱，不要憑印象接線；沙盒裡插槽點旁邊顯示的文字就是正確名稱。",
          en: "Check the node's real output socket name in the Encyclopedia instead of guessing — the label next to each socket dot in the Sandbox is the source of truth.",
        },
      },
      {
        cause: {
          zh: "某些著色器節點沒有 Normal 插槽——例如玻璃 BSDF（Glass BSDF）、半透射 BSDF（Translucent BSDF）、次表面散射（Subsurface Scattering）都沒有，硬把 Bump 的輸出接上去會直接編譯錯誤",
          en: "Some shader nodes have no Normal socket at all — Glass BSDF, Translucent BSDF, and Subsurface Scattering are examples — so forcing a Bump output into them fails to compile",
        },
        fix: {
          zh: "打開節點百科看清楚該節點實際有哪些輸入插槽再接線；沒有 Normal 插槽的節點本身就不支援凹凸細節，這是節點的設計限制，不是接錯線。想幫皮膚/蠟燭這類用 SSS 的材質加毛孔或紋理細節，可以改把 Bump 接到同一張材質圖裡另一層（例如 Glossy）的 Normal 插槽，再用 Mix Shader 疊上去。",
          en: "Check the node's actual input sockets in the Encyclopedia before wiring. If there's no Normal socket, that node simply doesn't support bump detail — it's a design limit, not a wiring mistake. To add pores or texture detail to an SSS-based material like skin or wax, wire Bump into another layer's Normal socket instead (e.g. a Glossy layer) and blend it in with a Mix Shader.",
        },
        presetId: "frog_skin",
      },
      {
        cause: {
          zh: "匯入自己存的 JSON 節點圖，卻發現部分節點或連線消失了",
          en: "Importing a saved JSON graph silently drops some nodes or links",
        },
        fix: {
          zh: "通常是節點型別 ID 或連線的插槽名稱打錯字——載入邏輯對壞資料是靜默跳過、不會跳出錯誤視窗。重新確認 JSON 裡每個 typeId 跟 socket 名稱都跟節點百科一致。",
          en: "This usually means a node's type ID or a link's socket name is misspelled — the loader silently skips bad entries instead of throwing an error. Double-check every typeId and socket name against the Encyclopedia.",
        },
      },
    ],
  },
  {
    id: "link_blocked",
    symptom: { zh: "想接一條線卻被擋下、跳出錯誤訊息", en: "Trying to wire a connection gets blocked with an error message" },
    items: [
      {
        cause: {
          zh: "在位移（Displacement）插槽的鏈路上接了菲涅爾（Fresnel）這類「需要打光後、片元著色器才算得出來」的節點",
          en: "A node that only makes sense after lighting in the fragment shader — like Fresnel — is wired into the chain feeding Displacement",
        },
        fix: {
          zh: "這是刻意的架構限制，不是 bug——位移運算發生在頂點著色器階段，只有純數值運算的節點才能用在這裡。改用雜訊、Math、顏色漸變等純數值節點驅動位移。",
          en: "This is an intentional architectural limit, not a bug — displacement runs in the vertex shader stage, so only pure numeric nodes can feed it. Drive displacement with Noise, Math, Color Ramp, and similar numeric-only nodes instead.",
        },
      },
    ],
  },
  {
    id: "bump_displacement_no_effect",
    symptom: { zh: "凹凸（Bump）或位移（Displacement）好像完全沒作用", en: "Bump or Displacement doesn't seem to do anything" },
    items: [
      {
        cause: {
          zh: "凹凸（Bump）節點的輸出沒有接到材質輸出的 Normal 插槽，只接到 BaseColor 之類的地方",
          en: "The Bump node's output isn't wired into the Material Output's Normal socket — it's connected somewhere like BaseColor instead",
        },
        fix: {
          zh: "Bump 節點只有接到 Normal 插槽才會影響光影明暗，這是最容易忽略的一步。",
          en: "Bump only affects shading when its output reaches the Normal socket — this is the step people miss most often.",
        },
        tutorialId: "tutorial_bump_tour",
      },
      {
        cause: {
          zh: "凹凸（Bump）強度調到最大，物體的輪廓看起來還是很平滑、沒有真的凸出來",
          en: "Bump Strength is cranked to max but the object's silhouette still looks perfectly smooth",
        },
        fix: {
          zh: "這是正常現象——Bump 只是「騙過光照」讓表面看起來凹凸，不會改變真正的幾何形狀；要讓輪廓真的凸出，要用位移（Displacement）。兩者可以同時用在同一份高度資料上，各自負責不同層次的細節。",
          en: "This is expected — Bump only fakes lighting to make a surface look uneven, it never changes the actual geometry. To get a real silhouette bulge, use Displacement instead. Both can share the same height data at once, each handling a different level of detail.",
        },
        tutorialId: "tutorial_bump_vs_displacement_compared",
      },
    ],
  },
  {
    id: "slider_no_effect",
    symptom: { zh: "調了某個滑桿/參數，畫面完全沒有變化", en: "Dragging a slider or changing a parameter produces zero visible change" },
    items: [
      {
        cause: {
          zh: "疊層權重（Layer Weight）節點的 Blend 滑桿調了老半天，但用的其實是 Facing 那個輸出",
          en: "Layer Weight's Blend slider is being adjusted, but the graph is actually using its Facing output",
        },
        fix: {
          zh: "Blend 滑桿只影響 Fresnel 輸出，Facing 輸出的公式完全沒有用到 Blend 參數。想調整過渡曲線的陡峭程度，要確定接的是 Fresnel 輸出，不是 Facing。",
          en: "Blend only affects the Fresnel output — Facing's formula never reads the Blend parameter at all. To control the falloff curve, make sure you're using the Fresnel output, not Facing.",
        },
        tutorialId: "tutorial_layer_weight_facing_vs_fresnel",
      },
      {
        cause: {
          zh: "折射 BSDF（Refraction BSDF）的 IOR 插槽怎麼調畫面都沒變化",
          en: "Refraction BSDF's IOR socket doesn't seem to change the render no matter what value is typed in",
        },
        fix: {
          zh: "這是本沙盒誠實記錄的簡化限制——這裡的折射用「透明度只跟粗糙度有關」的簡化實作，沒有真的讓光線彎曲，所以 IOR 目前沒有可見效果。玻璃 BSDF（Glass BSDF）改用 Fresnel 驅動透明度，IOR 在那裡才有作用。",
          en: "This is an honestly-documented simplification — Refraction here uses a simplified model where transparency depends only on Roughness, without actually bending light, so IOR has no visible effect. Glass BSDF drives transparency with Fresnel instead, where IOR does matter.",
        },
        tutorialId: "tutorial_transmission_shaders_compared",
      },
      {
        cause: {
          zh: "攝影機資料（Camera Data）、卡通 BSDF（Toon BSDF）、Shader to RGB 這幾個節點接上去完全沒反應",
          en: "Camera Data, Toon BSDF, or Shader to RGB are wired in but produce no visible change at all",
        },
        fix: {
          zh: "這幾個節點在本沙盒裡刻意不支援即時預覽（節點百科上會標示原因）——不是漏接，是架構限制或刻意的教學設計選擇。",
          en: "These nodes are intentionally not wired up for live preview in this sandbox (the Encyclopedia entry explains why for each) — it's not a missed connection, it's an architectural limit or a deliberate teaching choice.",
        },
      },
    ],
  },
  {
    id: "doesnt_match_blender",
    symptom: { zh: "跟 Blender 裡做出來的顏色/畫面不一樣", en: "The colors or overall look don't match what Blender produces" },
    items: [
      {
        cause: {
          zh: "同樣的參數數值，這裡渲染出來的顏色/亮度跟 Blender 裡看到的不完全一樣",
          en: "The same parameter values render to a slightly different color or brightness here versus in Blender",
        },
        fix: {
          zh: "這是預期中的差異，不是 bug——兩邊用的是完全不同的渲染引擎跟色調映射（tone mapping）曲線，畫面顏色不會像素級一致。但每個節點的數學公式都對照 Blender 原始碼校對過，同樣參數下「數值關係」（例如同樣 Fac 下 Multiply 一定比 Screen 暗）在兩邊是一致的——這才是遷移到 Blender 時真正該相信的部分。",
          en: "This is an expected difference, not a bug — the two use entirely different rendering engines and tone-mapping curves, so pixel-identical output was never the goal. Every node's math has been checked against Blender's source, so the relationships between values (e.g. Multiply is always darker than Screen at the same Fac) transfer correctly — that's what you should actually trust when moving to Blender.",
        },
        linkHref: "reference.html",
      },
    ],
  },
];

export default troubleshootGuide;
