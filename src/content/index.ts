import { InstagramAdapter } from '../platforms/instagram';
import { ThreadsAdapter } from '../platforms/threads';
import { isProcessed, markAsProcessed, clearProcessed } from '../storage';
import type { RawPayload } from '../core/protocol';
import type { SocialAdapter } from '../platforms/types';

// 抓取狀態
let isScraping = false;
let scrapeInterval: number | null = null;
let scrollInterval: number | null = null;
const collectedData: RawPayload[] = [];
let currentAdapter: SocialAdapter | null = null;

/**
 * 根據當前 URL 決定使用哪個適配器
 */
function selectAdapter(): SocialAdapter | null {
  const url = window.location.href;

  if (url.includes('instagram.com')) {
    return InstagramAdapter;
  } else if (url.includes('threads.com')) {
    return ThreadsAdapter;
  }
  return null;
}

/**
 * 自動滾動頁面以載入更多內容
 */
function autoScroll(): Promise<void> {
  return new Promise((resolve) => {
    const scrollHeight = document.documentElement.scrollHeight;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    // 滾動到底部
    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth',
    });

    // 等待內容載入（Instagram 需要時間載入新內容）
    setTimeout(() => {
      const newScrollHeight = document.documentElement.scrollHeight;
      // 如果高度沒有變化，可能已經到底了
      if (newScrollHeight === scrollHeight && currentScroll + windowHeight >= scrollHeight - 100) {
        resolve();
      } else {
        resolve();
      }
    }, 2000); // 等待 2 秒讓內容載入
  });
}

/**
 * 從頁面抓取貼文資料
 */
function scrapePosts(): number {
  if (!currentAdapter) {
    console.error('未選擇適配器');
    return 0;
  }

  let articles = document.querySelectorAll<HTMLElement>('article')
  let newCount = 0;
  if (articles.length === 0) {
    articles = document.querySelectorAll<HTMLElement>('body');
  }

  articles.forEach((article) => {
    if (!currentAdapter) return;
    
    const dataList = currentAdapter.extract(article);
    
    dataList.forEach((data) => {
      if (!data.originUrl) return;
    
      if (isProcessed(data.originUrl)) return;
    
      markAsProcessed(data.originUrl);
    
      const payload: RawPayload = {
        platform: data.platform as 'instagram' | 'threads',
        originUrl: data.originUrl,
        imgUrl: data.imgUrl || '',
        timestamp: data.timestamp || Date.now(),
      };
    
      collectedData.push(payload);
      newCount++;
    });
  });
  
  return newCount;
}

/**
 * 開始抓取流程
 */
async function startScraping() {
  if (isScraping) {
    console.log('抓取已在進行中...');
    return;
  }

  // 選擇適配器
  currentAdapter = selectAdapter();
  if (!currentAdapter) {
    console.error('無法識別當前平台');
    chrome.runtime.sendMessage({
      type: 'SCRAPE_ERROR',
      message: '無法識別當前平台',
    });
    return;
  }

  isScraping = true;
  clearProcessed();
  collectedData.length = 0;
  
  console.log(`開始抓取 ${currentAdapter.platformName} 貼文...`);

  // 初始抓取
  let totalCount = scrapePosts();
  chrome.runtime.sendMessage({
    type: 'UPDATE_PROGRESS',
    count: totalCount,
    data: collectedData,
  });

  // 自動滾動和抓取循環
  let noNewContentCount = 0;
  const maxNoNewContent = 3; // 連續 3 次沒有新內容就停止

  const performScrape = async () => {
    if (!isScraping) {
      return;
    }

    // 滾動載入更多
    await autoScroll();

    // 抓取新內容
    const newCount = scrapePosts();
    
    if (newCount > 0) {
      noNewContentCount = 0;
      totalCount += newCount;
      
      // 回報進度
      chrome.runtime.sendMessage({
        type: 'UPDATE_PROGRESS',
        count: totalCount,
        data: collectedData,
      });
    } else {
      noNewContentCount++;
      
      // 如果連續多次沒有新內容，停止抓取
      if (noNewContentCount >= maxNoNewContent) {
        console.log('沒有更多新內容，停止抓取');
        stopScraping();
        chrome.runtime.sendMessage({
          type: 'SCRAPE_COMPLETE',
          count: totalCount,
          data: collectedData,
        });
        return;
      }
    }

    // 繼續下一輪（如果還在抓取中）
    if (isScraping) {
      scrapeInterval = window.setTimeout(performScrape, 3000); // 每 3 秒執行一次
    }
  };

  // 開始循環
  scrapeInterval = window.setTimeout(performScrape, 3000);
}

/**
 * 停止抓取
 */
function stopScraping() {
  isScraping = false;
  
  if (scrapeInterval !== null) {
    clearTimeout(scrapeInterval);
    scrapeInterval = null;
  }
  
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
  
  console.log('抓取已停止', collectedData);
  
  chrome.runtime.sendMessage({
    type: 'SCRAPE_STOPPED',
    count: collectedData.length,
    data: collectedData,
  });
}

// 監聽來自 Background 的訊息
chrome.runtime.onMessage.addListener((
  request: { type: string },
  _sender: any,
  sendResponse: (response?: any) => void
) => {
  if (request.type === 'EXECUTE_SCRAPE') {
    console.log('收到抓取指令，開始執行...');
    startScraping();
    sendResponse({ success: true, message: '抓取已開始' });
  }
  
  if (request.type === 'STOP_SCRAPE') {
    console.log('收到停止指令');
    stopScraping();
    sendResponse({ success: true, message: '抓取已停止' });
  }
  
  return true; // 保持異步通訊頻道開啟
});
