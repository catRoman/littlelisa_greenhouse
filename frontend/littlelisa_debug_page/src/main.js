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
const renderedNodeList = [];
//
//=================
//  Nav
//===================

//nav menu button handler
menuBtns.forEach((el) => {
  el.addEventListener("touchend", function (e) {
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
        console.log(this.textContent, " clicked");
        toggleNavMenu();
        break;
      default:
        console.log(this.textContent);
    }
  });
});

// menu toggle
menuIcon.addEventListener("touchend", () => {
  toggleNavMenu();
  console.log(menuBtns);
});

function toggleNavMenu() {
  menuIcon.classList.toggle("invisible");
  main.classList.toggle("invisible");
  menu.classList.toggle("hidden");
  document.body.classList.toggle("overflow-hide");
  document.documentElement.classList.toggle("overflow-hide");
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
//+++++++++++++  /api/moduleInfo.json
//++++++++++++++++++++++++++++++++++++

async function fetchModuleInfo() {
  try {
    const response = await fetch("http://10.0.0.140/api/moduleInfo.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    updatePageTitle(data);
    renderModuleInfo("self", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/moduleInfo.json
//+++++++++++++++++++++++++++++++++++

async function fetchControllerStaList() {
  try {
    const response = await fetch(
      "http://10.0.0.140/api/controllerStaList.json"
    );
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
    const validNodeClass = "node-" + key.replaceAll(":", "_");
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
            console.log(key);
            renderedNodeList.push(key);
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
      ` <!-- SENSOR- ${nodeId}-->
      <div class="sensor-data-node-box ${nodeId}">
        <div class="sensor-summary">
          <div class="sensor-data-info">
            <h2 class="node-title">Node Id</h2>
            <p class="location">Module Location</p>
          </div>
          <p class="value">avg. <span class="sensor-avg">14*C</span></p>
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

  try {
    //add # templates of sensors to
    Object.entries(sensorList).forEach(([key, value]) => {
      for (let i = 1; i <= value; i++) {
        selfNodeBox.querySelector(`.${key} > ul`).insertAdjacentHTML(
          "beforeend",
          `<li class="sensor-reading local-sensor-${i}">
    <p class="timestamp">----</p>
    <div class="sensor-location-pin-header">
      <p class="sub-label">
        Location:
        <span class="sensor-location">---</span>
      </p>
      <p class="sub-label">
        Pin:
        <span class="sensor-pin">--</span>
      </p>
    </div>

    <p class="sensor-id">
      Sensor <span class="local-sensor-id">${i}</span>:
    </p>
    <div class="values">
      <span class="sensor-value temp">-- &deg;C</span> &horbar;
      <span class="sensor-value hum">-- %</span>
    </div>
  </li>`
        );
      }
    });

    addNodeBoxButtonEvent(`.${nodeId}`);
  } catch (error) {
    console.error(error);
  }
  //insert sensor templates for each sensor in
}

//==========================
// UPDATES
//=========================
function updateConnectedDevicesShow() {
  fetchControllerStaList();
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
  console.log(renderedNodeList);
  console.log(nodeListObj);
  nodeListObj.every((node) => {
    const validNodeClass = "node-" + node.replaceAll(":", "_");
    if (
      !renderedNodeList.includes(node) &&
      document.querySelector(`.${validNodeClass}`) !== undefined
    ) {
      document.querySelector(`.${validNodeClass}`).remove();
      console.log(`removed ${validNodeClass}`);
    }
  });
}

//==============
// Finer Adjustmets
//=============
logTextArea.addEventListener("touchstart", (e) => e.preventDefault());

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

fetchModuleInfo();

setInterval(updateConnectedDevicesShow, 5000);
