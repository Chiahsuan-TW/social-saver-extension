<template>
  <div class="sidebar-container">
    <h2>Social Saver</h2>
    <hr />

    <div class="status-section">
      <p>
        目前狀態: <strong>{{ status }}</strong>
      </p>
      <p>
        已抓取數量: <span>{{ count }}</span>
      </p>
    </div>

    <div class="control-actions">
      <button @click="startCapture" :disabled="isCapturing" class="btn-start">
        開始抓取 (IG / Threads)
      </button>
      <button @click="stopCapture" :disabled="!isCapturing" class="btn-stop">
        停止
      </button>
      <button @click="exportData" :disabled="count === 0" class="btn-export">
        匯出 CSV
      </button>
    </div>

    <div class="log-area">
      <small v-for="(log, index) in logs" :key="index">{{ log }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const status = ref("閒置中");
const count = ref(0);
const isCapturing = ref(false);
const logs = ref<string[]>([]);

// 發送訊息給 Background
const startCapture = async () => {
  isCapturing.value = true;
  status.value = "執行中...";

  // 獲取當前分頁資訊（sidepanel 需要通過 background 獲取）
  chrome.runtime.sendMessage(
    {
      type: "START_CAPTURE",
    },
    (response) => {
      if (response?.error) {
        addLog(`錯誤: ${response.error}`);
        isCapturing.value = false;
        status.value = "錯誤";
      } else {
        addLog(`任務已啟動: ${response?.message || "成功"}`);
      }
    }
  );
};

const stopCapture = () => {
  chrome.runtime.sendMessage({ type: "STOP_CAPTURE" }, () => {
    isCapturing.value = false;
    status.value = "停止中...";
    addLog("正在停止任務...");
    addLog(`已印出 ${capturedData.value.length} 筆資料到 Console`);
  });
};

const exportData = () => {
  if (capturedData.value.length === 0) {
    addLog("沒有資料可供匯出");
    return;
  }

  addLog("正在準備匯出 CSV 檔案...");

  // 1. 定義 CSV 標頭
  const headers = ["Platform", "Post URL", "Image URL", "Timestamp"];

  // 2. 處理資料列 (處理 null 或 undefined 的情況)
  const rows = capturedData.value.map((item) => [
    item.platform || "Unknown",
    item.originUrl || "",
    item.imgUrl || "",
    item.timestamp ? new Date(item.timestamp).toLocaleString() : "",
  ]);

  // 3. 組合 CSV 字串 (包含 BOM 防止 Excel 亂碼)
  const csvContent =
    "\ufeff" +
    [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

  // 4. 下載邏輯
  try {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `social_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog(`成功匯出 ${capturedData.value.length} 筆資料`);
  } catch (error) {
    addLog(`匯出失敗: ${error}`);
    console.error("Export Error:", error);
  }
};

const addLog = (msg: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

// 儲存抓取的資料
const capturedData = ref<any[]>([]);

// 監聽來自 Background 的進度更新
onMounted(() => {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === "UPDATE_PROGRESS") {
      count.value = message.count;
      if (message.data) {
        capturedData.value = message.data;
      }
      addLog(`抓取到 ${message.count} 筆資料`);
    }

    if (message.type === "SCRAPE_COMPLETE") {
      isCapturing.value = false;
      status.value = "已完成";
      count.value = message.count;
      if (message.data) {
        capturedData.value = message.data;
      }
      addLog(`抓取完成！共 ${message.count} 筆資料`);
    }

    if (message.type === "SCRAPE_STOPPED") {
      isCapturing.value = false;
      status.value = "已停止";
      count.value = message.count;
      if (message.data) {
        capturedData.value = message.data;
      }
      addLog(`抓取已停止，共 ${message.count} 筆資料`);
    }
  });
});
</script>

<style scoped>
.sidebar-container {
  padding: 16px;
  font-family: sans-serif;
}
.status-section {
  margin-bottom: 20px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 8px;
}
.control-actions button {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  cursor: pointer;
}
.btn-start {
  background: #42b883;
  color: white;
  border: none;
}
.btn-stop {
  background: #ff5f5f;
  color: white;
  border: none;
}
.log-area {
  margin-top: 20px;
  font-size: 12px;
  color: #666;
  max-height: 200px;
  overflow-y: auto;
}
</style>
