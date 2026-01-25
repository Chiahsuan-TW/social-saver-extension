import type { RawPayload } from '../core/protocol';

export interface SocialAdapter {
  platformName: string;
  postSelector: string;    // 貼文區塊的 CSS Selector
  imgSelector: string;     // 圖片的 CSS Selector
  extract(element: HTMLElement): Partial<RawPayload>[]; // 如何從一個貼文區塊提取資訊
}