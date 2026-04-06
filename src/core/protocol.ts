// 定義訊息類型
export const MessageType = {
  START_CAPTURE: 'START_CAPTURE',
  STOP_CAPTURE: 'STOP_CAPTURE',
  DATA_COLLECTED: 'DATA_COLLECTED',
  GET_STATUS: 'GET_STATUS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SCRAPE_COMPLETE: 'SCRAPE_COMPLETE',
  SCRAPE_STOPPED: 'SCRAPE_STOPPED',
} as const;
export type MessageType = typeof MessageType[keyof typeof MessageType];

// 簡化的資料結構
export interface RawPayload {
  platform: 'instagram' | 'threads';
  originUrl: string;
  imgUrl: string;
  timestamp: number;
}