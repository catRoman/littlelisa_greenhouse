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

//=========================
//  EVENT LISTNER
//========================

//=========================
// api - fetchin`
//==========================

//==============
// RENDERS
//=============

//==========================
// UPDATES
//=========================

//==============
// SOCKETS
//=============

//==============
// Finer Adjustmets
//=============
//logTextArea.addEventListener("touchstart", (e) => e.preventDefault());

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
