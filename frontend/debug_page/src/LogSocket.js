import Socket from "./Sockets";

export class LogSocket extends Socket {
  constructor() {
    super("log");
    this.socket.onmessage = this.onMessage.bind(this);
  }

  onMessage(event) {
    super.onMessage(event);
    const data = event.data;

    if (document.querySelector(".ota-status").classList.contains("hidden")) {
      this.updateDataLog(data, "log-output");
    } else {
      this.updateDataLog(data, "ota-log");
      this.extractNodeIdToStatus(data);
    }

    if (data.includes("ALL_NODE_UPDATES_COMPLETE")) {
      console.log("Updating controller from SD...");
      document.querySelector(".ota-status-reset").textContent =
        "Updating Controller from SD...";
    }
    if (data.includes("REFRESH_DEBUG_PAGE")) {
      console.log("OTA Update Complete. Refreshing page in 10 seconds...");
      document.querySelector(".ota-status-info").textContent =
        "OTA Update Complete";
      document.querySelector(".ota-status-reset").textContent =
        "OTA Update Complete. Wifi Restarting - please ensure your reconnection.\nRefreshing page in 10 seconds...";
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }
  }

  updateDataLog(logStr, logClassName) {
    const MAX_CHARS = 100000;
    const logBox = document.querySelector(`.${logClassName}`);

    const isScrolledToBottom =
      logBox.scrollHeight - logBox.clientHeight <= logBox.scrollTop + 1;

    logBox.value +=
      (logBox.value ? "\n" : "") + this.sanitizeConsoleLog(logStr);

    if (logBox.value.length > MAX_CHARS) {
      let excess = logBox.value.length - MAX_CHARS;
      let newValue = logBox.value.substring(excess);
      logBox.value = "...[truncated]...\n" + newValue;
    }

    if (isScrolledToBottom) {
      logBox.scrollTop = logBox.scrollHeight;
    }
  }
  sanitizeConsoleLog(logStr) {
    let sanitizedStr = logStr.substring(logStr.indexOf("("));

    sanitizedStr = sanitizedStr.substring(0, sanitizedStr.indexOf("[") - 1);
    return sanitizedStr;
  }
  extractNodeIdToStatus(updateLog) {
    const regex = /.*UPDATING_NODE_(\d+).*/;
    const nodeId = updateLog.match(regex);

    if (nodeId) {
      document.querySelector(".ota-status-info").textContent = "Updating";
      document.querySelector(
        ".ota-status-reset"
      ).textContent = `Updating node ${nodeId[1]}...`;
      console.log(`Updating node ${nodeId[1]}...`);
    }
  }
  logRefreshEvent() {
    this.socket.close();
    console.log("refreshing log socket...");
    document.querySelector(".log-output").value =
      "Refreshing esp log stream...";
    setTimeout(() => new LogSocket(), 3000);
  }
  //TODO: add event listner for logRefreshBtn
}
