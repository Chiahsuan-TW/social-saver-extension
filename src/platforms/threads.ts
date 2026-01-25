import type { SocialAdapter } from './types.ts';
import type { RawPayload } from '../core/protocol';

export const ThreadsAdapter: SocialAdapter = {
  platformName: 'threads',
  postSelector: 'article', // Threads 貼文也使用 article 元素
  imgSelector: 'img',
  
  /**
   * 從 article 元素提取 Threads 貼文資訊
   * @param el - article 元素
   * @returns 提取的貼文資料
   */
  extract(el: HTMLElement): Partial<RawPayload>[] {
    const results: Partial<RawPayload>[] = [];
  
    // 1. 抓所有 a tag 中的 href -> 該篇貼文的 url
    const postLinks = el.querySelectorAll<HTMLAnchorElement>('a[href]');
    
    postLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const postUrl = href.startsWith('http')
        ? href
        : `https://www.threads.com${href}`;

      if (!/\/post\/[^/]+$/.test(postUrl)) return;
  
      // 2. 抓第一個 picture 下的 img src -> 作為圖片，沒有則回傳空字串
      const container = link.closest('article') || el;
      const picture = container.querySelector('picture');
      let imgUrl = '';
      
      if (picture) {
        const img = picture.querySelector<HTMLImageElement>('img');
        if (img) {
          imgUrl = img.getAttribute('src') || 
                   img.getAttribute('srcset')?.split(' ')[0] || '';
        }
      }
      // 沒有 picture 則回傳空字串（已經是預設值）
  
      results.push({
        platform: 'threads',
        originUrl: postUrl,
        imgUrl: imgUrl,
        timestamp: Date.now(),
      });
    });
  
    return results;
  }
};

