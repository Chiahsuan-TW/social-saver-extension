# Instagram 適配器實作說明

## ✅ 已實作功能

### 1. Instagram 適配器 (`src/platforms/instagram.ts`)

實作了從 Instagram 頁面抓取貼文資料的邏輯：

- **貼文連結提取**：從 `article` 元素下的所有 `a` 標籤中尋找貼文連結（`/p/` 或 `/reel/` 開頭）
- **貼文內文提取**：收集所有 `img` 標籤的 `alt` 屬性作為貼文內文
- **首圖提取**：取得第一個 `img` 標籤的 `src` 作為貼文首圖

### 2. Content Script (`src/content/index.ts`)

實作了完整的抓取流程：

- **自動滾動**：自動滾動頁面以載入更多內容
- **去重機制**：使用 URL 作為唯一識別，避免重複抓取
- **批次抓取**：每 3 秒執行一次抓取，直到沒有新內容
- **進度回報**：即時回報抓取進度給 Background Script

### 3. 儲存管理 (`src/storage/index.ts`)

實作了去重相關的工具函數：

- `isProcessed(url)`: 檢查貼文是否已處理
- `markAsProcessed(url)`: 標記貼文為已處理
- `clearProcessed()`: 清除所有已處理記錄

### 4. 資料結構 (`src/core/protocol.ts`)

定義了完整的資料結構：

```typescript
interface RawPayload {
  platform: 'instagram' | 'threads';
  originUrl: string;        // 貼文連結
  imgUrl: string;           // 首圖 URL
  timestamp: number;         // 抓取時間戳
  additionalData: {
    content?: string;        // 貼文內文（所有 alt 文字合併）
    altTexts?: string[];    // 所有 alt 文字陣列
    linkCount?: number;      // 連結數量
    imageCount?: number;     // 圖片數量
  };
}
```

## 🔄 抓取流程

1. **使用者點擊「開始抓取」**
   - SidePanel → Background Script → Content Script

2. **Content Script 執行抓取**
   - 初始抓取：立即抓取目前可見的貼文
   - 自動滾動：滾動到底部載入更多內容
   - 等待載入：等待 2 秒讓新內容載入
   - 再次抓取：抓取新載入的貼文
   - 去重檢查：只保留未處理過的貼文

3. **進度回報**
   - Content Script → Background Script → SidePanel UI
   - 即時更新已抓取數量

4. **停止條件**
   - 手動停止：使用者點擊「停止」按鈕
   - 自動停止：連續 3 次沒有新內容時自動停止

## 📝 資料提取邏輯

### 目標元素選擇

- **貼文容器**：`article` 元素
- **連結**：`article` 下的所有 `a[href]` 標籤
- **圖片**：`article` 下的所有 `img` 標籤

### 提取規則

1. **貼文連結** (`originUrl`)
   - 尋找 `href` 以 `/p/` 或 `/reel/` 開頭的連結
   - 如果不是完整 URL，補上 `https://www.instagram.com` 前綴

2. **貼文內文** (`additionalData.content`)
   - 收集所有 `img` 標籤的 `alt` 屬性
   - 過濾空字串
   - 合併成單一字串

3. **首圖** (`imgUrl`)
   - 取得第一個有效的 `img` 標籤的 `src` 或 `srcset` 屬性

## 🧪 測試建議

### 測試環境

1. 前往 Instagram 收藏頁面（`https://www.instagram.com/[username]/saved/`）
2. 確保頁面有足夠的貼文可以滾動載入

### 測試步驟

1. **基本抓取測試**
   - 開啟側邊欄
   - 點擊「開始抓取」
   - 觀察是否開始抓取目前可見的貼文

2. **自動滾動測試**
   - 確認頁面會自動滾動
   - 觀察是否持續載入新內容

3. **去重測試**
   - 停止抓取後再次開始
   - 確認不會重複抓取已處理的貼文

4. **停止功能測試**
   - 在抓取過程中點擊「停止」
   - 確認抓取立即停止

### 檢查點

- [ ] Console 沒有錯誤訊息
- [ ] 側邊欄顯示正確的抓取數量
- [ ] 資料結構符合預期（包含 originUrl, imgUrl, content）
- [ ] 去重機制正常運作
- [ ] 自動滾動正常運作

## 🐛 已知限制

1. **載入時間**：目前等待 2 秒讓內容載入，可能需要根據網路速度調整
2. **選擇器**：如果 Instagram 更新 DOM 結構，可能需要調整選擇器
3. **圖片 URL**：某些圖片可能使用 `srcset`，目前只取第一個值

## 🔜 後續改進

- [ ] 支援 Threads 平台
- [ ] 優化滾動策略（檢測是否到底）
- [ ] 增加錯誤處理和重試機制
- [ ] 支援更多資料欄位（如作者、時間等）


