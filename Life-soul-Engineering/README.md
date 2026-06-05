# 24種靈魂使命測評系統

88道問題 × 24種使命 × 精準向量評分

## 部署步驟（5分鐘上線）

### 方法一：Vercel 一鍵部署（推薦）

1. 把這個資料夾上傳到 GitHub（新建一個 repository）
2. 前往 [vercel.com](https://vercel.com)，用 GitHub 帳號登入
3. 點「New Project」→ 選你剛上傳的 repository
4. 框架自動偵測為 Next.js，直接點「Deploy」
5. 約 1-2 分鐘後取得網址，完成！

### 方法二：本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 打開 http://localhost:3000
```

### 方法三：Claude Code 部署

在你的終端機：
```bash
claude code
# 然後告訴 Claude：幫我把這個 Next.js 專案部署到 Vercel
```

---

## 專案結構

```
soul-mission/
├── pages/
│   ├── _app.js          # App wrapper
│   └── index.js         # 主要測評頁面（所有邏輯在這裡）
├── lib/
│   ├── data.js          # 24份報告內容 + 方向資料
│   ├── questions.js     # Phase 2 三個方向的26題×3
│   └── svgUtils.js      # 神聖幾何 SVG 元件
├── styles/
│   └── globals.css      # 全域樣式
├── package.json
└── next.config.js
```

---

## 修改內容

### 修改報告文字
打開 `lib/data.js`，找到對應的使命名稱，直接修改：
- `summary` — 核心摘要（2-3句）
- `traits` — 個性特質（每行一點）
- `mission` — 使命執行方式
- `work` — 適合工作
- `love` — 愛情描述
- `mentor` — 貴人種類
- `wealth` — 財富方式
- `crystal` — 水晶礦石
- `animal` — 守護動物
- `color` — 靈魂顏色（hex）
- `bg` — 卡片背景色（hex）
- `soulColor` — 顏色名稱文字

### 修改問題
- Phase 1（方向探索）：`lib/data.js` 的 `P1_QUESTIONS`
- Phase 2（深度探索）：`lib/questions.js` 的 `P2_D1 / P2_D2 / P2_D3`

### 修改標題 / SEO
打開 `pages/index.js`，找到 `<Head>` 區塊修改。

---

## 技術說明

- **框架**：Next.js 14（Pages Router）
- **字體**：Cinzel + Noto Serif TC（Google Fonts）
- **評分**：三軸向量評分，每題選項直接標記使命權重
- **雙重使命**：第一名與第二名分差 ≤8分時自動觸發
- **無 API 依賴**：所有報告固定儲存在本地，秒速出結果

---

## 未來可加入的功能

- [ ] 分享報告卡片（生成 OG image）
- [ ] Email 收集（Mailchimp / ConvertKit 整合）
- [ ] 付費解鎖深度內容（Stripe）
- [ ] 使命相容度計算
- [ ] 多語言支援（英文版）
