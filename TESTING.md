# 側邊欄測試指南

## 📋 測試前準備

### 1. 建置擴充功能

```bash
# 安裝依賴（如果還沒安裝）
npm install

# 建置擴充功能
npm run build
```

建置完成後，會在 `dist/` 目錄下產生擴充功能的檔案。

### 2. 載入擴充功能到 Chrome

1. 開啟 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案的 `dist/` 資料夾
6. 確認擴充功能已成功載入（應該會看到 "Social Saver - IG & Threads Exporter"）

## 🧪 測試步驟

### 測試 1: 側邊欄基本展開功能

**目標**: 確認點擊擴充功能圖示時，側邊欄能正常展開

1. **開啟支援的頁面**

   - 前往 `https://www.instagram.com` 或 `https://www.threads.com`
   - 登入你的帳號（如果需要）

2. **點擊擴充功能圖示**

   - 在 Chrome 工具列找到擴充功能圖示（拼圖圖案）
   - 點擊 "Social Saver - IG & Threads Exporter" 的圖示

3. **檢查側邊欄**
   - ✅ 側邊欄應該從右側滑出
   - ✅ 應該看到 "Social Saver" 標題
   - ✅ 應該看到狀態顯示為 "閒置中"
   - ✅ 應該看到三個按鈕：開始抓取、停止、匯出 CSV

### 測試 2: 側邊欄 UI 顯示

**目標**: 確認所有 UI 元素正常顯示

檢查項目：

- ✅ 標題 "Social Saver" 顯示正常
- ✅ 狀態區塊顯示 "目前狀態: 閒置中"
- ✅ 已抓取數量顯示為 0
- ✅ 按鈕樣式正確（綠色開始、紅色停止、灰色匯出）
- ✅ 日誌區域為空或顯示初始訊息

### 測試 3: 訊息通訊測試

**目標**: 確認側邊欄與 Background Script 能正常通訊

1. **開啟開發者工具**

   - 在側邊欄上按右鍵 → 檢查
   - 或使用快捷鍵（Mac: Cmd+Option+I, Windows: Ctrl+Shift+I）

2. **檢查 Console**

   - 應該看到 Background Script 的 log（如果有設定）
   - 不應該有錯誤訊息

3. **測試按鈕點擊**
   - 點擊「開始抓取」按鈕
   - 檢查 Console 是否有訊息
   - 檢查狀態是否變更為 "執行中..."

### 測試 4: 在支援頁面測試

**目標**: 確認在 Instagram/Threads 頁面時功能正常

1. **前往 Instagram 收藏頁面**

   - 登入 Instagram
   - 前往你的收藏頁面（通常是 `https://www.instagram.com/[username]/saved/`）

2. **開啟側邊欄並測試**
   - 點擊擴充功能圖示開啟側邊欄
   - 點擊「開始抓取」按鈕
   - ✅ 應該看到狀態變更為 "執行中..."
   - ✅ 應該看到日誌顯示 "任務已啟動: 指令已傳達至 Content Script"
   - ✅ 應該看到進度更新（目前是模擬的，會每 1 秒增加 1）

### 測試 5: 在不支援的頁面測試

**目標**: 確認錯誤處理正常

1. **前往不支援的頁面**

   - 例如：`https://www.google.com`

2. **開啟側邊欄並測試**
   - 點擊擴充功能圖示開啟側邊欄
   - 點擊「開始抓取」按鈕
   - ✅ 應該看到錯誤訊息："不支援此網域，請前往 Instagram 或 Threads 頁面"
   - ✅ 狀態應該顯示為 "錯誤"

### 測試 6: 停止功能測試

**目標**: 確認停止按鈕功能正常

1. **在支援頁面啟動抓取**

   - 前往 Instagram 或 Threads
   - 開啟側邊欄
   - 點擊「開始抓取」

2. **測試停止功能**
   - 點擊「停止」按鈕
   - ✅ 狀態應該變更為 "已停止"
   - ✅ 應該看到日誌顯示 "任務手動停止"
   - ✅ 「開始抓取」按鈕應該恢復可用

## 🔍 除錯技巧

### 檢查 Background Script

1. 前往 `chrome://extensions/`
2. 找到你的擴充功能
3. 點擊「service worker」或「背景頁面」連結
4. 檢查 Console 是否有錯誤或 log

### 檢查 Content Script

1. 在 Instagram/Threads 頁面開啟開發者工具
2. 切換到 Console 標籤
3. 應該會看到 Content Script 的 log（例如："開始在網頁端執行抓取..."）

### 檢查側邊欄

1. 在側邊欄上按右鍵 → 檢查
2. 檢查 Console 是否有錯誤
3. 檢查 Network 標籤確認資源載入正常

## ⚠️ 常見問題

### 問題 1: 側邊欄無法展開

**可能原因**:

- manifest.json 中的 sidePanel 設定錯誤
- 建置失敗

**解決方法**:

- 檢查 `dist/manifest.json` 是否正確
- 確認 `dist/src/sidepanel/index.html` 是否存在
- 重新建置：`npm run build`

### 問題 2: 側邊欄顯示空白

**可能原因**:

- Vue 應用未正確掛載
- JavaScript 錯誤

**解決方法**:

- 開啟側邊欄的開發者工具檢查錯誤
- 確認 `main.ts` 正確引入 `SidePanel.vue`
- 檢查 Console 是否有錯誤訊息

### 問題 3: 點擊按鈕沒有反應

**可能原因**:

- 訊息通訊失敗
- Background Script 未正確載入

**解決方法**:

- 檢查 Background Script 的 Console
- 確認 `chrome.runtime.sendMessage` 是否正確
- 檢查 manifest.json 中的 permissions 是否包含必要權限

### 問題 4: 無法與頁面通訊

**可能原因**:

- Content Script 未正確注入
- 頁面尚未完全載入

**解決方法**:

- 確認 manifest.json 中的 content_scripts 設定正確
- 重新載入頁面
- 檢查 Content Script 是否在頁面中執行

## ✅ 測試檢查清單

- [ ] 側邊欄能正常展開
- [ ] UI 元素正常顯示
- [ ] 在支援頁面能啟動抓取
- [ ] 在不支援頁面顯示錯誤訊息
- [ ] 停止功能正常運作
- [ ] 進度更新正常顯示
- [ ] 日誌功能正常
- [ ] 沒有 Console 錯誤

## 🚀 下一步

測試通過後，可以繼續實作：

1. Instagram 適配器的實際抓取邏輯
2. Threads 適配器的實際抓取邏輯
3. 資料去重功能
4. CSV/JSON 匯出功能
