"use strict";

import "./css/general.css";
import "./css/index.css";

//menu-nav elements
const menuIcon = document.querySelector(".header-menu-icon");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");
const navClose = document.querySelector(".nav-btn.close");
const menuBtns = document.querySelectorAll(".nav-btn");

//Network-info
const networkInfoTab = document.querySelector(".network-info");

//sensor-data elements
const nodeBox = document.querySelector(".sensor-data-node-box");
const sensorSection = document.querySelector(".section-sensor-data");

//esp-log elements
const logTextArea = document.querySelector(".log-output");

//current node list

let nodeListObj = [];
const renderedNodeList = new Set(null);
//
//=================
//  Nav
//===================

//nav menu button handler
menuBtns.forEach((el) => {
  el.addEventListener("touchend", function (e) {
    e.stopPropagation;
    const classes = [...this.classList];
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
        toggleInfoTab(".ota-update");
        break;

      case "close":
        toggleNavMenu();
        break;
      default:
    }
  });
});

// menu toggle
menuIcon.addEventListener("touchend", () => {
  toggleNavMenu();
});

function toggleNavMenu() {
  menuIcon.classList.toggle("invisible");
  main.classList.toggle("invisible");
  menu.classList.toggle("hidden");
  document.body.classList.toggle("overflow-hide");
  document.documentElement.classList.toggle("overflow-hide");
  document.querySelector("main").classList.toggle("body-disabled");
  setTimeout(
    () => document.querySelector("main").classList.toggle("body-disabled"),
    100
  );
}
function toggleInfoTab(selectedTab_str) {
  const selectedTab = document.querySelector(selectedTab_str);
  menu.classList.toggle("hidden");
  selectedTab.classList.toggle("hidden");
  selectedTab.addEventListener("touchend", () =>
    toggleInfoTab(selectedTab_str)
  );
}

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
    updatePageTitle(data);
    renderModuleInfo(getValidNodeClass(data.module_info.identifier), data);
    initiateWebSockets(data);
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
            <p class="rssi">${rssiValue}</p>
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

//==========================
// UPDATES
//=========================
function updateConnectedDevicesShow() {
  fetchControllerStaList();
  checkForNodeRemoval();
  getAvgTempReading();
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
  if (value > -50) {
    rssiBox.style.backgroundColor = "green";
  } else if (value < -50 && value > -70) {
    rssiBox.style.backgroundColor = "yellow";
  } else if (value < -70) {
    rssiBox.style.backgroundColor = "red";
  } else if (value < -100) {
    rssiBox.style.backgroundColor = "grey";
  }
  rssiBox.textContent = `${value}`;
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

// function updateUptime(json_data) {
//   const { uptime, unit } = json_data;

//   document.querySelector(".uptime").textContent = uptime;
//   document.querySelector(".uptime-unit").textContent = ` ${unit}`;
// }
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
  const { module_info: moduleInfoObj, sensor_data: sensorDataObj } =
    wsSensorData;

  //locate sensor box using module_id
  //locate sensor using local_sensor_id *double check this is not dependant
  //locate sensor type using sensor type
  //change text content
  //adjust box for variable values
  const validNodeClass = getValidNodeClass(moduleInfoObj.module_id);

  const nodeSensorData = document.querySelector(`.${validNodeClass}`);

  const sensorType = nodeSensorData.querySelector(
    `.${sensorDataObj.sensor_type}`
  );

  const sensorToUpdate = sensorType.querySelector(
    `.local-sensor-${moduleInfoObj.local_sensor_id}`
  );
  sensorToUpdate.querySelector(".timestamp").textContent =
    sensorDataObj.timestamp;
  sensorToUpdate.querySelector(".sensor-location").textContent =
    sensorDataObj.location;
  sensorToUpdate.querySelector(".sensor-pin").textContent =
    sensorDataObj.module_pin;
  sensorToUpdate.querySelector(
    ".temp"
  ).textContent = `${sensorDataObj.sensor_data.temp.toFixed(2)}`;
  sensorToUpdate.querySelector(
    ".hum"
  ).textContent = `${sensorDataObj.sensor_data.humidity.toFixed(2)}`;
}

function getAvgTempReading() {
  const nodeBoxes = document.querySelectorAll(".sensor-data-node-box");
  nodeBoxes.forEach((nodeBox) => {
    const sensorTempReadings = nodeBox.querySelectorAll(".temp");

    const sumTemp = Array.from(sensorTempReadings).reduce(
      (acc, node) => acc + Number(node.textContent),
      0
    );
    const avgTemp = sumTemp / sensorTempReadings.length;
    nodeBox.querySelector(".sensor-avg").textContent = avgTemp.toFixed(2); // Assuming you want to limit to two decimal places
  });
}

//==============
// SOCKETS
//=============

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /ws/sensor
//+++++++++++++++++++++++++++++++++++
// Create WebSocket connection.
function initiateWebSockets(moduleData) {
  const {
    module_info: { type, identifier },
  } = moduleData;
  let nodeId = getValidNodeClass(identifier);
  nodeId = type + nodeId.substring(nodeId.indexOf("-"));
  console.log(nodeId);

  const sensorDataSocket = new WebSocket(
    `ws://littlelisa-${nodeId}.local:8080/ws/sensor`
  );

  sensorDataSocket.onopen = function () {
    console.log("sensor Data websocket connection established");
  };

  // Listen for messages
  sensorDataSocket.addEventListener("message", (event) => {
    //remove whitespace from c buffer
    updateSensorData(JSON.parse(event.data.replace(/\0+$/, "")));
  });

  const logDataSocket = new WebSocket("ws://10.0.0.140:8080/ws/log");

  logDataSocket.onopen = function () {
    console.log("log data websocket connection established");
    console.log("starting log in  5 seconds");
    // Wait for 5 seconds before sending a message
    setTimeout(function () {
      // Send a message through the WebSocket
      logDataSocket.send("start log");
    }, 5000); // 5000 milliseconds = 5 seconds
  };

  logDataSocket.addEventListener("message", (event) => {
    updateDataLog(event.data);
  });

  window.addEventListener("beforeunload", function () {
    logDataSocket.send("stop log");
    logDataSocket.send("");
    sensorDataSocket.send("");
  });
}
//==============
// Data Logger
//=============
function updateDataLog(logStr) {
  const MAX_CHARS = 100000;
  const logBox = document.querySelector(".log-output");

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

  return logStr;
}

//==============
// Finer Adjustmets
//=============
logTextArea.addEventListener("touchstart", (e) => e.preventDefault());

//==============
// Helpers
//=============
function getValidNodeClass(macAddr) {
  return "node-" + macAddr.replaceAll(":", "_");
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
updateConnectedDevicesShow();
getAvgTempReading();
fetchUptimeFunk();

//henceforth
setInterval(updateConnectedDevicesShow, 15000);
setInterval(fetchUptimeFunk, 5000);
