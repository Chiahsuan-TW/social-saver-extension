declare const chrome: {
  runtime: {
    lastError?: { message: string };
    sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };
  };
  tabs: {
    Tab: {
      id?: number;
      url?: string;
      title?: string;
    };
    query(
      queryInfo: { active?: boolean; currentWindow?: boolean },
      callback: (tabs: Array<{ id?: number; url?: string; title?: string }>) => void
    ): void;
    sendMessage(
      tabId: number,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  };
  sidePanel: {
    setPanelBehavior(
      options: { openPanelOnActionClick: boolean }
    ): Promise<void>;
  };
};

