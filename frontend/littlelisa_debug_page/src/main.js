"use strict";

import "./css/general.css";
import "./css/index.css";

//menu-nav elements

//Network-info
const networkInfoTab = document.querySelector(".network-info");

//sensor-data elements
const nodeBox = document.querySelector(".sensor-data-node-box");
const sensorSection = document.querySelector(".section-sensor-data");

//esp-log elements
const logTextArea = document.querySelector(".log-output");
const logRefreshBtn = document.querySelector(".log-refresh");
const sensorRefreshBtn = document.querySelector(".sensor-refresh");
let logDataSocket; //socket handler
let sensorDataSocket;

//ota log update
const otaLogBox = document.querySelector(".ota-log");
const otaStatusContainer = document.querySelector(".ota-status");
const otaStatusInfo = document.querySelector(".ota-status-info");
const otaStatusReset = document.querySelector(".ota-status-reset");
const fileInput = document.getElementById("fileInput");

//current node list
let nodeListObj = [];
let envStateArr = {};
const renderedNodeList = new Set(null);

// module type
let nodeType = "node";
let moduleData;
let wsLogDataStr = "";

//
//=================
//  Nav
//===================

//nav menu button handler

//=========================
//  EVENT LISTNER
//========================

//+++++++++++OTA UPDATE+++++++++++++++
const otaUpdateBtn = document.getElementById("uploadBtn");
const otaUpdateForm = document.getElementById("uploadForm");

otaUpdateForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default form submission
  //this.disable = true;
  otaUpdateBtn.disabled = true;

  const file = fileInput.files[0]; // Get the file from the file input
  const url = "ota/update_prop";

  otaStatusContainer.classList.toggle("hidden");
  // logDataSocket.onmessage = (event) => {
  //   updateDataLog(event.data, "ota-log");
  // };

  try {
    // initiateLogSocket(moduleData, "update");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: file, // Send the file as the request body
    });

    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    } else {
      const data = await response.text();
      console.log(data);
      otaStatusInfo.textContent = "Upload Complete...";
      // setTimeout(() => {
      //   otaStatusInfo.textContent = "Preforming updates...";
      //   otaStatusReset.textContent = "Manually reload in on completion...";
      // }, 3000);
      // setTimeout(() => {
      //   location.reload(true);
      // }, 30000);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    setTimeout(() => {
      otaStatusInfo.textContent = "SD save failed...";
      otaStatusReset.textContent = error;
    }, 10000);
    otaStatusContainer.classList.toggle("hidden");
    otaUpdateBtn.disabled = false;
  }
});
//+++++++++++++++++++++logRefreshEvent
function logRefreshEvent() {
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
//++++++++++sensorRefresh
function sensorRefreshEvent() {
  if (sensorDataSocket !== undefined) {
    sensorDataSocket.close();
    setTimeout(() => initiateSensorSocket(moduleData), 3000);
  }
}
sensorRefreshBtn.addEventListener("click", (e) => {
  sensorRefreshEvent();
});
sensorRefreshBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  sensorRefreshEv;
  ent();
});
//=============nav selectors================
const openButton = document.querySelector(".icon-open");
const closeButton = document.querySelector(".icon-close");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");
const navClose = document.querySelector(".nav-btn.close");
const menuBtns = document.querySelectorAll(".nav-btn");
//========================================

function menuEvent(e, classList) {
  e.stopPropagation;
  const classes = [...classList];
  switch (classes[classes.length - 1]) {
    case "dev_btn":
      toggleInfoTab(".device-info");

      break;
    case "net_btn":
      toggleInfoTab(".network-info");
      break;
    case "db_btn":
      toggleInfoTab(".sd-db-info");
      break;
    case "sys_btn":
      toggleInfoTab(".system-health");
      break;
    case "ota_btn":
      if (moduleData.module_info.type == "controller") {
        toggleInfoTab(".ota-update");
      } else {
        console.log(
          "Disabled for nodes. TODO: only render button for controller"
        );
      }
      break;
    case "close":
      openButton.classList.toggle("hidden");
      main.classList.toggle("hidden");
      menu.classList.toggle("hidden");
      main.style.pointerEvents = "none";

      setTimeout(() => {
        main.style.pointerEvents = "auto";
      }, 100);
      break;
    default:
  }
}
menuBtns.forEach((el) => {
  el.addEventListener("click", function (e) {
    menuEvent(e, this.classList);
  });
});
menuBtns.forEach((el) => {
  el.addEventListener("touchend", function (e) {
    e.preventDefault();
    menuEvent(e, this.classList);
  });
});
//+++++++++++++++openEvent
function openEvent() {
  openButton.classList.toggle("hidden");
  main.classList.toggle("hidden");
  menu.classList.toggle("hidden");
}
openButton.addEventListener("click", (e) => {
  openEvent();
});
openButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  openEvent();
});
function toggleInfoTab(navClass) {
  console.log(navClass);
  menu.classList.toggle("hidden");
  document.querySelector(navClass).classList.toggle("hidden");
  closeButton.classList.toggle("hidden");
}

//+++++++++closeEvent
function closeEvent() {
  const menuTabs = document.querySelector(".menu-select");
  Array.from(menuTabs.children).forEach((el) => {
    if (
      !el.classList.contains("hidden") &&
      !el.classList.contains("head-icon")
    ) {
      console.log(el.classList[0]);
      toggleInfoTab(`.${el.classList[0]}`);
    }
  });
}
closeButton.addEventListener("click", (e) => {
  closeEvent();
});
closeButton.addEventListener("touchend", (e) => {
  e.preventDefault();
  closeEvent();
});

function toggleNavMenu() {}
//===========================
//  Node sensor data display
//===========================
function addNodeBoxButtonEvent(nodeNameClass) {
  const sensorSummary = document.querySelector(
    `${nodeNameClass} > .sensor-summary`
  );
  sensorSummary.addEventListener("click", function (event) {
    // Check if the clicked element is the parent or one of its children
    if (event.target === this || this.contains(event.target)) {
      sensorSummary.nextElementSibling.classList.toggle("hidden");

      sensorSummary.querySelector(".node-title").classList.toggle("green");

      // Perform your desired action
    }
  });
}

//=========================
// api - fetchin`
//==========================

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/envState
//+++++++++++++++++++++++++++++++++++

async function fetchEnvState() {
  try {
    const response = await fetch("/api/envState");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    //apply to global
    envStateArr = Object.values(data);

     updateEnvStateView();
  } catch (error) {console.log(error.message)}
}
async function toggleStateFetch(id) {
  try {
    const response = await fetch("/api/envStateUpdate", {
      method: 'PUT',
      body: id
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

     const newState = await response.json();

    //apply to global

      fetchEnvState();



  } catch (error) {console.log(error.message)}

}

 function updateEnvStateView(){
  const envContainer = document.querySelector(".env-cntrl");
 envContainer.innerHTML = '';

  envStateArr.forEach((relay)=>{

    envContainer.insertAdjacentHTML(
      'beforeend',
      ` <li class="env-li" >
      <p>Id:${relay.id} &harr; P:${relay.pin} &harr; ${relay.type} &rarr;</p>
      <button data-id="${relay.id}" class="env-status ${relay.state === 'on' ? 'env-status-on' : 'env-status-off'}">${relay.state}</button>
      </li>`
    );

  });
  const buttons = envContainer.querySelectorAll('.env-status');
  buttons.forEach(button => {
    button.addEventListener('click',  function(event) {
      const id = this.getAttribute('data-id');
      event.preventDefault();
      event.stopPropagation();
       toggleStateFetch(id);


    });
  });
}
fetchEnvState();


//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/deviceInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchDeviceMenuTabInfo() {
  try {
    const response = await fetch("/api/deviceInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    updateMenuDeviceInfoTab(data);
  } catch (error) {
    console.log(error);
  }
}


//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/wifiApConnectInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchNetworkApMenuTabInfo() {
  try {
    const response = await fetch("/api/wifiApConnectInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    renderWifiApInfo(data);
  } catch (error) {
    console.log(error);
  }
}

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/wifiStaConnectInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchNetworkStaMenuTabInfo() {
  try {
    const response = await fetch("/api/wifiStaConnectInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    updateWifiStaInfo(data);
  } catch (error) {
    console.log(error);
  }
}

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/uptimeFunk.json
//++++++++++++++++++++++++++++++++++++

async function fetchUptimeFunk() {
  try {
    const response = await fetch("/api/uptimeFunk.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    updateUptime(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/moduleInfo.json
//++++++++++++++++++++++++++++++++++++

async function fetchModuleInfo() {
  try {
    const response = await fetch("/api/moduleInfo.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    nodeType = data.module_info.type;
    console.log(nodeType);
    moduleData = data;
    updatePageTitle(data);
    renderModuleInfo(getValidNodeClass(data.module_info.identifier), data);

    initiateLogSocket(data);
    initiateSensorSocket(data);
    if (nodeType === "controller") {
      updateConnectedDevicesShow();
      fetchNetworkApMenuTabInfo();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/moduleInfo.json
//+++++++++++++++++++++++++++++++++++

async function fetchControllerStaList() {
  try {
    const response = await fetch("/api/controllerStaList.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    //apply to global
    nodeListObj = Object.keys(data.sta_list);
    applyNodeInfo(data);
  } catch (error) {}
}

//+++++++++++++++++++++++++++++++++++++++++
//++++++fetch for connected nodes moduleinfo
//++++++++++++++++++++++++++++++++++++++

function applyNodeInfo(nodeListObj) {
  //loop through node list
  //check if node-box  exists for node, if not render sensor-data-node-box
  //loop through node list fetch nodes moduleInfo.json and populate

  const { sta_list: nodeList } = nodeListObj;
  Object.entries(nodeList).forEach(([key, value]) => {
    const validNodeClass = getValidNodeClass(key);
    //ping "key".local/api/moduleInfo.json to get valid resposnse
    //if not its not a node
    const applyData = async function () {
      try {
        const response = await fetch(
          `http://littlelisa-${validNodeClass}.local/api/moduleInfo.json`
        );
        if (response.ok) {
          const data = await response.json();

          if (document.querySelector(`.${validNodeClass}`) === null) {
            renderModuleInfo(validNodeClass, data);
            renderConnectedDeviceLink(validNodeClass, data, value);

            renderedNodeList.add(key);
          }
          updateRssi(validNodeClass, value);
        } else {
          console.error(`${validNodeClass} not a node`, error);
        }
      } catch (error) {}
    };

    applyData();
  });
}

//==============
// RENDERS
//=============
function renderConnectedDeviceLink(nodeId, moduleInfoObj, rssiValue) {
  const {
    module_info: { location, identifier },
  } = moduleInfoObj;

  const connectionBtns = document.querySelector(
    ".online-connections > .inside"
  );

  connectionBtns.insertAdjacentHTML(
    "beforeend",
    `<a href="http://littlelisa-${nodeId}.local"
        ><button class="online-connection-btn ${nodeId}-btn">
          <h2 class="node-title">${identifier}</h2>
          <div class="loc-rssi">
            <p class="location">${location}</p>
            <p class="rssi"><span class="rssi-value">${rssiValue}</span><span class="dbm-label">dBm</span></p>

          </div>
        </button></a
        >`
  );
}

function renderModuleInfo(nodeId, moduleInfo) {
  const {
    module_info: { type, location, identifier },
    sensor_list: sensorList,
  } = moduleInfo;

  //change sensor-summary self
  if (document.querySelector(`.${nodeId}`) !== null) {
    const selfNodeBox = document.querySelector(`.${nodeId}`);
  } else {
    document.querySelector(".section-sensor-data").insertAdjacentHTML(
      "beforeend",
      ` <!-- NODE- ${nodeId}-->
      <div class="sensor-data-node-box ${nodeId}">
        <div class="sensor-summary">
          <div class="sensor-data-info">
            <h2 class="node-title">Node Id</h2>
            <p class="location">Module Location</p>
          </div>
          <div class='value-avg-box'>
          <p>avg.</p> <p><span class="sensor-avg">--</span>°C</p>
          </div>
          </div>
        <ul class="sensor-types hidden">
          <li class="sensor-type DHT22">
            <p class="subheading">DHT22</p>

            <ul class="sensor-readings-box">

            </ul>
          </li>
          <li class="sensor-type hidden soil_moisture">
            <p class="subheading">Soil Moisture</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden light">
            <p class="subheading">Light</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden sound">
            <p class="subheading">Sound</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden movement">
            <p class="subheading">Movement</p>
            <ul class="sensor-readings-box"></ul>
          </li>
          <li class="sensor-type hidden cam">
            <p class="subheading">Cam</p>
            <ul class="sensor-readings-box"></ul>
          </li>
        </ul>
      </div>`
    );
  }

  const selfNodeBox = document.querySelector(`.${nodeId}`);

  selfNodeBox.querySelector(".sensor-data-info > h2").textContent = identifier;
  selfNodeBox.querySelector(".sensor-data-info > .location").textContent =
    type.toUpperCase();
  selfNodeBox.querySelector(".sensor-data-info > .location").style.color =
    "#ee5b5b";

  //add # templates of sensors to
  Object.entries(sensorList).forEach(([key, value]) => {
    for (let i = 1; i <= value; i++) {
      selfNodeBox.querySelector(`.${key} > ul`).insertAdjacentHTML(
        "beforeend",
        `<!-- SENSOR-${i}-->
          <li class="sensor-reading local-sensor-${i}">
    <p class="timestamp">----</p>
    <div class="sensor-location-pin-header">

      <p class="sub-label location-label">
        Location:
        </p>
        <span class="sensor-location">---</span>

      <p class="sub-label pin">
        Pin:
        <span class="sensor-pin">--</span>
      </p>
    </div>

    <p class="sensor-id">
      Sensor <span class="local-sensor-id">${i}</span>:
    </p>
    <div class="values">
      <p><span class="sensor-value temp">--</span> &deg;C</p> &xhArr;
      <p><span class="sensor-value hum">--</span> %</p>
    </div>
  </li>`
      );
    }
  });

  addNodeBoxButtonEvent(`.${nodeId}`);

  //insert sensor templates for each sensor in
}

function renderWifiApInfo(wifiApInfoObj) {
  const { ap_ssid, ap_channel, ap_pass, ap_max_connect } = wifiApInfoObj;
  const apSection = document.querySelector(".network-info > ul");

  apSection.insertAdjacentHTML(
    "beforeend",
    `
  <li class="ap-info">
              <h3 class="subheading">Access Point Info</h3>
              <ul>
                <li>SSID:<span class="ap-ssid">${ap_ssid}</span></li>
                <li>Channel:<span class="channel">${ap_channel}</span></li>
                <li>Password:<span class="password">${ap_pass}</span></li>
                <li>Max Connections:<span class="max-connections">${ap_max_connect}</span></li>
              </ul>
            </li>
            <li class="connected-sta">
              <h3 class="subheading">Connected Stations</h3>
              <textarea class="connected-devices"></textarea>
            </li>       `
  );
  updateNetworkInfoList();
}

//==========================
// UPDATES
//=========================
function updateNetworkInfoList() {
  const connectedDeviceBox = document.querySelector(
    ".network-info  .connected-devices"
  );
  let tempStr = "";

  nodeListObj.forEach((obj) => {
    tempStr += obj + "\n";
  });
  if (connectedDeviceBox) connectedDeviceBox.value = tempStr;
}

function updateConnectedDevicesShow() {
  fetchControllerStaList();
  updateNetworkInfoList();
  checkForNodeRemoval();
}

function updatePageTitle(moduleInfo) {
  const {
    module_info: { type, location, identifier },
  } = moduleInfo;

  //change title
  document.querySelector(".type").textContent = type;
  document.querySelector(".module_id").textContent = identifier;
  document.querySelector(".title-location").textContent = location;
  //change sensor-summary self
}

function updateRssi(nodeId, value) {
  const rssiBox = document.querySelector(`.${nodeId}-btn .rssi`);
  const rssiValue = document.querySelector(`.${nodeId}-btn .rssi-value`);
  if (value > -50) {
    rssiBox.style.backgroundColor = "green";
  } else if (value < -50 && value > -70) {
    rssiBox.style.backgroundColor = "yellow";
  } else if (value < -70) {
    rssiBox.style.backgroundColor = "red";
  } else if (value < -100) {
    rssiBox.style.backgroundColor = "grey";
  }
  rssiValue.textContent = `${value}`;
}
function checkForNodeRemoval() {
  renderedNodeList.forEach((node) => {
    const validNodeClass = getValidNodeClass(node);

    if (
      !nodeListObj.includes(node) &&
      document.querySelector(`.${validNodeClass}`) !== null
    ) {
      document.querySelector(`.${validNodeClass}`).remove();
      document.querySelector(`.${validNodeClass}-btn`).remove();

      renderedNodeList.delete(node);

      console.log(`removed ${validNodeClass}`);
    }
  });
}

function updateUptime({ uptime }) {
  const timeParts = [
    Math.floor(uptime / 86400000), // Days
    Math.floor((uptime % 86400000) / 3600000), // Hours
    Math.floor((uptime % 3600000) / 60000), // Minutes
    Math.floor((uptime % 60000) / 1000), // Seconds
  ].map((part) => part.toString().padStart(2, "0"));

  document.querySelector(
    ".uptime"
  ).textContent = `${timeParts[0]} : ${timeParts[1]} : ${timeParts[2]} : ${timeParts[3]}`;
}

function updateSensorData(wsSensorData) {
  const { module_info: moduleInfoObj, sensor_info: sensorDataObj } =
    wsSensorData;

  //locate sensor box using module_id
  //locate sensor using local_sensor_id *double check this is not dependant
  //locate sensor type using sensor type
  //change text content
  //adjust box for variable values
  const validNodeClass = getValidNodeClass(moduleInfoObj.identifier);

  const nodeSensorData = document.querySelector(`.${validNodeClass}`);

  const sensorType = nodeSensorData?.querySelector(
    `.${sensorDataObj.sensor_type}`
  );

  const sensorToUpdate = sensorType?.querySelector(
    `.local-sensor-${sensorDataObj.local_sensor_id}`
  );
  if (sensorToUpdate != undefined) {
    sensorToUpdate.querySelector(".timestamp").textContent =
      sensorDataObj.timestamp;
    sensorToUpdate.querySelector(".sensor-location").textContent =
      sensorDataObj.location;
    sensorToUpdate.querySelector(".sensor-pin").textContent =
      sensorDataObj.sensor_pin;
    sensorToUpdate.querySelector(
      ".temp"
    ).textContent = `${sensorDataObj.data.temperature.toFixed(2)}`;
    sensorToUpdate.querySelector(
      ".hum"
    ).textContent = `${sensorDataObj.data.humidity.toFixed(2)}`;
  }
}

function getAvgTempReading() {
  const nodeBoxes = document.querySelectorAll(".sensor-data-node-box");
  nodeBoxes.forEach((nodeBox) => {
    const sensorTempReadings = nodeBox.querySelectorAll(".temp");

    const { sumTemp, count } = Array.from(sensorTempReadings).reduce(
      (acc, node) => {
        const tempValue = Number(node.textContent);
        if (!Number.isNaN(tempValue)) {
          acc.sumTemp += tempValue;
          acc.count++;
        }
        return acc;
      },
      { sumTemp: 0, count: 0 }
    );

    const avgTemp = count > 0 ? sumTemp / count : 0;
    nodeBox.querySelector(".sensor-avg").textContent = avgTemp.toFixed(2);
  });
}

function updateMenuDeviceInfoTab(deviceInfo) {
  const {
    chip_info: { num_cores, chip_type },
    app_info: {
      secure_ver,
      app_ver,
      proj_name,
      compile_info: { time: compileTime, date: compileDate, idf_ver },
    },
  } = deviceInfo;

  document.querySelector(".device-info .proj-name").textContent = proj_name;
  document.querySelector(".device-info .app-ver").textContent = app_ver;
  document.querySelector(".device-info .sec-ver").textContent = secure_ver;
  document.querySelector(".device-info .cores").textContent = num_cores;
  document.querySelector(".device-info .chip").textContent = chip_type;
  document.querySelector(".device-info .time").textContent = compileTime;
  document.querySelector(".device-info .date").textContent = compileDate;
  document.querySelector(".device-info .idf-ver").textContent = idf_ver;
}

function updateWifiStaInfo(networkStaObj) {
  const { ip, netmask, gw, ap, rssi } = networkStaObj;

  document.querySelector(".network-info .sta-ssid").textContent = ap;
  document.querySelector(".network-info .rssi").textContent = rssi;
  document.querySelector(".network-info .ip").textContent = ip;
  document.querySelector(".network-info .netmask").textContent = netmask;
  document.querySelector(".network-info .gateway").textContent = gw;
}
//==============
// SOCKETS
//=============

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /ws/sensor
//+++++++++++++++++++++++++++++++++++
// Create WebSocket connection.
let sensorRetryCount = 0;

function initiateSensorSocket(moduleDataObj) {
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
let logRetryCount = 0;

//------------------------------datalog

function initiateLogSocket(moduleDataObj, logType) {
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

function getExponentialBackoffDelay(retryCount) {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  let delay = Math.min(maxDelay, baseDelay * 2 ** retryCount);
  console.log(`Reconnecting in ${delay} ms`);
  return delay;
}
//==============
// Data Logger
//=============
function updateDataLog(logStr, logClassName) {
  const MAX_CHARS = 100000;
  const logBox = document.querySelector(`.${logClassName}`);

  const isScrolledToBottom =
    logBox.scrollHeight - logBox.clientHeight <= logBox.scrollTop + 1;

  logBox.value += (logBox.value ? "\n" : "") + sanitizeConsoleLog(logStr);

  if (logBox.value.length > MAX_CHARS) {
    let excess = logBox.value.length - MAX_CHARS;
    let newValue = logBox.value.substring(excess);
    logBox.value = "...[truncated]...\n" + newValue;
  }

  if (isScrolledToBottom) {
    logBox.scrollTop = logBox.scrollHeight;
  }
}
function sanitizeConsoleLog(logStr) {
  let sanitizedStr = logStr.substring(logStr.indexOf("("));

  sanitizedStr = sanitizedStr.substring(0, sanitizedStr.indexOf("[") - 1);
  return sanitizedStr;
}

//==============
// Finer Adjustmets
//=============
//logTextArea.addEventListener("touchstart", (e) => e.preventDefault());

//==============
// Helpers
//=============
function getValidNodeClass(macAddr) {
  return "node-" + macAddr.replaceAll(":", "-");
}
function extractNodeIdToStatus(updateLog) {
  const regex = /.*UPDATING_NODE_(\d+).*/;
  const nodeId = updateLog.match(regex);

  if (nodeId) {
    otaStatusInfo.textContent = "Updating";
    otaStatusReset.textContent = `Updating node ${nodeId[1]}...`;
    console.log(`Updating node ${nodeId[1]}...`);
  }
}
//================
//DEBUG help
//==================
//display screen demiinsion in console for debug
window.addEventListener("resize", () => {
  console.log(
    `Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`
  );
});

// Log the initial size
console.log(
  `Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`
);

//initial load
fetchModuleInfo();
fetchNetworkStaMenuTabInfo();
fetchDeviceMenuTabInfo();
getAvgTempReading();
fetchUptimeFunk();

//henceforth

setInterval(() => {
  if (nodeType === "controller") {
    updateConnectedDevicesShow();
  }
}, 5000);

setInterval(getAvgTempReading, 5000);
setInterval(fetchUptimeFunk, 5000);
setInterval(fetchEnvState, 30000);
