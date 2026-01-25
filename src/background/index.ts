// 當點擊擴充功能圖示時開啟側邊欄
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: Error) => console.error(error));

// 儲存當前抓取的分頁 ID
let currentScrapingTabId: number | null = null;

chrome.runtime.onMessage.addListener((
  request: { type: string; [key: string]: any },
  _sender: any,
  sendResponse: (response?: any) => void
) => {

  if (request.type === 'START_CAPTURE') {
    // 獲取當前活動的分頁
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0]?.id) {
        sendResponse({ error: '無法取得當前分頁' });
        return;
      }

      const tab = tabs[0];
      const url = tab?.url || '';

      // 1. 驗證是否在支援的網域
      if (!url.includes('instagram.com') && !url.includes('threads.com')) {
        sendResponse({ error: '不支援此網域，請前往 Instagram 或 Threads 頁面' });
        return;
      }

      // 2. 記錄當前抓取的分頁
      if (tab?.id) {
        currentScrapingTabId = tab.id;

        // 3. 轉發指令給該分頁的 Content Script
        chrome.tabs.sendMessage(tab.id, { type: 'EXECUTE_SCRAPE' }, () => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: `無法與頁面通訊: ${chrome.runtime.lastError.message}` });
          } else {
            sendResponse({ message: '指令已傳達至 Content Script' });
          }
        });
      }
    });

    return true; // 保持異步通訊頻道開啟
  }

  if (request.type === 'STOP_CAPTURE') {
    // 轉發停止指令給 Content Script
    if (currentScrapingTabId !== null) {
      chrome.tabs.sendMessage(currentScrapingTabId, { type: 'STOP_SCRAPE' }, () => {
        currentScrapingTabId = null;
      });
    }
    sendResponse({ message: '停止指令已處理' });
  }

  // 轉發進度更新給側邊欄 UI
  if (request.type === 'UPDATE_PROGRESS' || request.type === 'SCRAPE_COMPLETE' || request.type === 'SCRAPE_STOPPED') {
    // 轉發給所有連接的側邊欄
    try {
      chrome.runtime.sendMessage(request, () => {
        // 忽略錯誤（可能沒有監聽器）
      });
    } catch (e) {
      // 忽略錯誤
    }
  }

  return true; // 保持異步通訊頻道開啟
});