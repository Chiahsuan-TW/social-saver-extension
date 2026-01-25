/**
 * 儲存相關工具
 * 用於管理去重和資料暫存
 */

// 用於去重的 Set，儲存已處理的貼文 URL
const processedUrls = new Set<string>();

/**
 * 檢查貼文是否已處理過
 * @param url - 貼文 URL
 * @returns 是否已處理
 */
export function isProcessed(url: string): boolean {
  return processedUrls.has(url);
}

/**
 * 標記貼文為已處理
 * @param url - 貼文 URL
 */
export function markAsProcessed(url: string): void {
  if (url) {
    processedUrls.add(url);
  }
}

/**
 * 清除所有已處理記錄
 */
export function clearProcessed(): void {
  processedUrls.clear();
}

/**
 * 取得已處理的數量
 */
export function getProcessedCount(): number {
  return processedUrls.size;
}


