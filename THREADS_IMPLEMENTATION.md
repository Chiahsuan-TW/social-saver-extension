# Threads 適配器實作與資料結構統一

## ✅ 已完成的工作

### 1. 簡化資料結構 (`src/core/protocol.ts`)

移除 `additionalData` 欄位，只保留核心資料：

```typescript
interface RawPayload {
  platform: 'instagram' | 'threads';
  originUrl: string;    // 貼文 URL
  imgUrl: string;       // 圖片 URL（如果有）
  timestamp: number;    // 抓取時間戳
}
```

### 2. 更新 Instagram 適配器 (`src/platforms/instagram.ts`)

統一邏輯，與 Threads 保持一致：

- **貼文連結**：從所有 `a[href]` 中篩選包含 `/p/` 或 `/reel/` 的連結
- **圖片提取**：從第一個 `picture` 元素下的 `img` 取得 `src`
- **無內文**：不再提取 `alt` 文字

### 3. 新增 Threads 適配器 (`src/platforms/threads.ts`)

完整實作 Threads 平台抓取邏輯：

- **貼文連結**：從所有 `a[href]` 中篩選包含 `/t/` 或 `threads.net` 的連結
- **圖片提取**：從第一個 `picture` 元素下的 `img` 取得 `src`
- **無圖回傳空字串**：如果沒有 `picture` 元素，`imgUrl` 為空字串

### 4. 更新 Content Script (`src/content/index.ts`)

支援多平台自動識別：

- **自動選擇適配器**：根據當前 URL 自動選擇 Instagram 或 Threads 適配器
- **統一抓取邏輯**：兩個平台使用相同的抓取流程
- **錯誤處理**：無法識別平台時回報錯誤

### 5. 更新 CSV 匯出 (`src/ui/SidePanel.vue`)

簡化 CSV 欄位，只包含核心資料：

```
Platform, Post URL, Image URL, Timestamp
```

## 📊 兩個平台的資料結構對齊

| 欄位 | Instagram | Threads | 說明 |
|------|-----------|---------|------|
| `platform` | "instagram" | "threads" | 平台識別 |
| `originUrl` | 貼文連結（/p/ 或 /reel/） | 貼文連結（/t/） | 貼文 URL |
| `imgUrl` | 第一個 picture > img src | 第一個 picture > img src | 圖片 URL |
| `timestamp` | Date.now() | Date.now() | 抓取時間 |

## 🔄 抓取邏輯對比

### Instagram

```javascript
// 1. 找所有 a tag 的 href
postLinks = el.querySelectorAll('a[href]')
// 篩選: href 包含 /p/ 或 /reel/

// 2. 找第一個 picture 下的 img src
picture = container.querySelector('picture')
imgUrl = picture.querySelector('img').src
```

### Threads

```javascript
// 1. 找所有 a tag 的 href
postLinks = el.querySelectorAll('a[href]')
// 篩選: href 包含 /t/ 或 threads.com

// 2. 找第一個 picture 下的 img src
picture = container.querySelector('picture')
imgUrl = picture.querySelector('img').src
// 如果沒有 picture，imgUrl = ''
```

## 🧪 測試指南

### Instagram 測試

1. 前往 `https://www.instagram.com/[username]/saved/`
2. 開啟側邊欄，點擊「開始抓取」
3. 檢查抓取的資料：
   - `platform` 應為 `"instagram"`
   - `originUrl` 應包含 `/p/` 或 `/reel/`
   - `imgUrl` 應為圖片 URL（如果有）

### Threads 測試

1. 前往 `https://www.threads.com/@[username]` 或收藏頁面
2. 開啟側邊欄，點擊「開始抓取」
3. 檢查抓取的資料：
   - `platform` 應為 `"threads"`
   - `originUrl` 應包含 `/t/` 或完整的 threads.net URL
   - `imgUrl` 應為圖片 URL（如果有，否則為空字串）

### CSV 匯出測試

1. 抓取一些資料後，點擊「匯出 CSV」
2. 檢查下載的 CSV 檔案：
   - 檔名格式：`social_export_[timestamp].csv`
   - 欄位：Platform, Post URL, Image URL, Timestamp
   - 沒有多餘的欄位

## 📝 注意事項

### Threads 連結格式

Threads 的貼文連結可能有多種格式：
- `/t/xxx` - 相對路徑
- `https://www.threads.net/t/xxx` - 完整 URL
- `https://www.threads.net/@username/post/xxx` - 其他格式

目前的實作篩選包含 `/t/` 或 `threads.net` 的連結，如果發現有其他格式需要調整。

### 圖片提取邏輯

兩個平台都使用 `picture` 元素包裹圖片：
- Instagram 和 Threads 都使用 `<picture><img></picture>` 結構
- 如果沒有 `picture` 元素，說明該貼文沒有圖片
- `imgUrl` 會是空字串，這是正常的（純文字貼文）

## 🔍 除錯建議

### 檢查適配器選擇

在 Console 中檢查：
```javascript
// 應該顯示 "開始抓取 instagram 貼文..." 或 "開始抓取 threads 貼文..."
```

### 檢查抓取資料

在停止或匯出時，可以在 Console 查看資料結構：
```javascript
// 資料應該只包含: platform, originUrl, imgUrl, timestamp
```

### 常見問題

1. **沒有抓到資料**
   - 檢查 `article` 元素是否存在
   - 檢查 `a[href]` 的連結格式是否符合篩選條件

2. **imgUrl 都是空的**
   - 檢查是否有 `picture` 元素
   - 檢查 DOM 結構是否與預期一致

3. **重複抓取**
   - 去重機制使用 `originUrl` 作為唯一識別
   - 確認 URL 格式一致（不要有大小寫或協議差異）

## 📦 檔案清單

已修改的檔案：
- ✅ `src/core/protocol.ts` - 簡化資料結構
- ✅ `src/platforms/instagram.ts` - 更新提取邏輯
- ✅ `src/platforms/threads.ts` - **新增** Threads 適配器
- ✅ `src/content/index.ts` - 支援多平台
- ✅ `src/ui/SidePanel.vue` - 更新 CSV 欄位
- ✅ `src/types/chrome.d.ts` - 重新添加類型聲明

## 🚀 下一步建議

1. 測試兩個平台的實際抓取功能
2. 根據實際 DOM 結構微調選擇器
3. 優化錯誤處理和使用者提示
4. 考慮加入 JSON 匯出選項

