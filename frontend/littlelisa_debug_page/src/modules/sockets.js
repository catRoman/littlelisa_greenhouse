let sensorRetryCount = 0;
let logRetryCount = 0;
let logDataSocket = null;
let sensorDataSocket = null;

/**
 * Closes the logDataSocket if it exists, refreshes the log socket, and updates the logTextArea.
 * @function logRefreshEvent
 */
export function logRefreshEvent() {
  if (logDataSocket !== undefined) {
    logDataSocket.close();
    console.log("refreshing log socket...");
    logTextArea.value = "Refreshing esp log stream...";
    setTimeout(() => initiateLogSocket(moduleData), 3000);
  }
}

logRefreshBtn.addEventListener("click", (e) => {
  logRefreshEvent();
});
logRefreshBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  logRefreshEvent();
});

/**
 * Initiates a WebSocket connection for sensor data.
 * @param {Object} moduleDataObj - The module data object.
 * @param {Object} moduleDataObj.module_info - The module information object.
 * @param {string} moduleDataObj.module_info.type - The module type.
 * @param {string} moduleDataObj.module_info.identifier - The module identifier.
 */
export function initiateSensorSocket(moduleDataObj) {
  const {
    module_info: { type, identifier },
  } = moduleDataObj;
  let nodeId = getValidNodeClass(identifier);
  nodeId = type + nodeId.substring(nodeId.indexOf("-"));

  sensorDataSocket = new WebSocket(
    `ws://littlelisa-${nodeId}.local:8080/ws/sensor`
  );

  sensorDataSocket.onclose = (event) => {
    if (!event.wasClean) {
      let delay = getExponentialBackoffDelay(sensorRetryCount);
      setTimeout(initiateSensorSocket, delay);
      sensorRetryCount++;
    }
  };

  sensorDataSocket.onopen = function () {
    console.log("sensor Data websocket connection established");
    sensorRetryCount = 0;
  };

  // Listen for messages
  sensorDataSocket.onmessage = (event) => {
    //remove whitespace from c buffer
    updateSensorData(JSON.parse(event.data.replace(/\0+$/, "")));
  };
}

/**
 * Initializes the log socket connection and handles socket events.
 * @param {Object} moduleDataObj - The module data object.
 * @param {string} logType - The log type.
 */
export function initiateLogSocket(moduleDataObj, logType) {
  const {
    module_info: { type, identifier },
  } = moduleDataObj;
  let nodeId = getValidNodeClass(identifier);
  nodeId = type + nodeId.substring(nodeId.indexOf("-"));

  logDataSocket = new WebSocket(`ws://littlelisa-${nodeId}.local:8080/ws/log`);

  logDataSocket.onopen = function () {
    console.log("log data websocket connection established");
    console.log("starting websocket log");
    // Wait for 5 seconds before sending a message
    logRetryCount = 0;
    setTimeout(function () {
      // Send a message through the WebSocket
      logDataSocket.send("start log");
    }, 1000); // 5000 milliseconds = 5 seconds
  };

  logDataSocket.onclose = (event) => {
    if (!event.wasClean) {
      let delay = getExponentialBackoffDelay(logRetryCount);
      setTimeout(initiateLogSocket, delay);
      logRetryCount++;
    }
  };

  logDataSocket.onmessage = (event) => {
    if (otaStatusContainer.classList.contains("hidden")) {
      updateDataLog(event.data, "log-output");
    } else {
      updateDataLog(event.data, "ota-log");
      extractNodeIdToStatus(event.data);
    }
    if (event.data.includes("ALL_NODE_UPDATES_COMPLETE")) {
      console.log("Updating controller from SD...");
      otaStatusReset.textContent = "Updating Controller from SD...";
    }
    if (event.data.includes("REFRESH_DEBUG_PAGE")) {
      console.log("OTA Update Complete. Refreshing page in 10 seconds...");
      otaStatusInfo.textContent = "OTA Update Complete";
      otaStatusReset.textContent =
        "OTA Update Complete. Wifi Restarting - please ensure your reconnection.\nRefreshing page in 10 seconds...";
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }
  };

  window.addEventListener("beforeunload", function () {
    logDataSocket.send("stop log");
    logDataSocket.send("");
    sensorDataSocket.send("");
  });
}

/**
 * Calculates the exponential backoff delay based on the retry count.
 *
 * @param {number} retryCount - The number of times the operation has been retried.
 * @returns {number} The calculated delay in milliseconds.
 */
export function getExponentialBackoffDelay(retryCount) {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  let delay = Math.min(maxDelay, baseDelay * 2 ** retryCount);
  console.log(`Reconnecting in ${delay} ms`);
  return delay;
}
