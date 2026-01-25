import type { SocialAdapter } from "./types.ts";
import type { RawPayload } from "../core/protocol";

export const InstagramAdapter: SocialAdapter = {
  platformName: "instagram",
  postSelector: "article", // IG 貼文通常被封裝在 article 中
  imgSelector: "img",

  /**
   * 從 article 元素提取貼文資訊
   * @param el - article 元素
   * @returns 提取的貼文資料
   */
  extract(el: HTMLElement): Partial<RawPayload>[] {
    const results: Partial<RawPayload>[] = [];

    // 1. 找出所有 a tag 的 href -> 貼文連結
    const postLinks = el.querySelectorAll<HTMLAnchorElement>("a[href]");

    postLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // 只處理貼文連結（/p/ 或 /reel/）
      if (!href.includes("/p/") && !href.includes("/reel/")) return;

      const postUrl = href.startsWith("http")
        ? href
        : `https://www.instagram.com${href}`;

      let imgUrl = "";

      if (link) {
        const img = link.querySelector<HTMLImageElement>("img");
        if (img) {
          imgUrl =
            img.getAttribute("src") ||
            img.getAttribute("srcset")?.split(" ")[0] ||
            "";
        }
      }

      results.push({
        platform: "instagram",
        originUrl: postUrl,
        imgUrl: imgUrl,
        timestamp: Date.now(),
      });
    });

    return results;
  },
};
