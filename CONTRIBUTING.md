# Contributing

這是一個純靜態網站，沒有 build step、沒有框架，所以貢獻方式也很單純：加資料檔、重新整理頁面看結果。

## 本機開發

```bash
python -m http.server 5173
```

打開 `http://localhost:5173/index.html`。改完 `data/` 底下的檔案記得整頁重新整理（巢狀 import 不會被強制重抓）。

## 新增一個節點

在 `data/nodes/*.js`（依分類挑檔案：`color.js`／`converter.js`／`input.js`／`output.js`／`shader.js`／`texture.js`／`vector.js`）加一筆物件，格式參考同檔案裡的其他節點：

- `id`／`category`：唯一識別碼與分類
- `name`／`summary`／`docBeginner`／`docPro`：雙語（`{ zh, en }`）文件，分新手與進階兩層
- `inputs`／`outputs`：socket 定義
- `supported`：能否在沙盒即時預覽中編譯渲染；`false` 代表只在百科列出文件（例如需要毛髮幾何、體積資料等這個沙盒沒有的資訊）
- `glsl.emit()`：只有 `supported: true` 才需要，回傳這個節點的 GLSL 輸出運算式

不用動節點編輯器或編譯器核心。

## 新增一個預設材質

在 `data/presets/*.js` 加一個檔案，匯出 `{ id, name, description, graph }`（`graph` 是 `{ nodes, links }` 的節點圖 JSON），再到 `data/presets/index.js` import 並加進陣列。

## 新增一個教學

在 `data/tutorials/*.js` 加一個檔案，包含 `id`／`level`／`name`／`description`／`startGraph`／`endGraph`／`steps`（每一步有 `title`／`instruction`／`check(graph)`），可以參考 `data/tutorials/glass.js` 的完整範例。寫完到 `data/tutorials/index.js` import 並加進陣列。

## 送出前檢查

打開 `dev-regression-test.html` 跑一次全站資料完整性回歸測試（結構檢查＋編譯檢查），確認新增的資料沒有讓任何項目變成「❌ 失敗」。CI 也會在 PR 上自動跑這個檢查。
