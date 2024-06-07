"use strict";

//sensor-data elements

//current node list
let nodeListObj = [];
let envStateArr = {};
const renderedNodeList = new Set(null);
let moduleData;

import "./css/general.css";
import "./css/index.css";
import {
  fetchEnvState,
  fetchModuleInfo,
  fetchNetworkStaMenuTabInfo,
  fetchDeviceMenuTabInfo,
  fetchUptimeFunk,
} from "./modules/api.js";
import { updateConnectedDevicesShow } from "./modules/networking.js";
import { getAvgTempReading } from "./modules/sensors.js";

document.addEventListener("DOMContentLoaded", async () => {
  fetchEnvState();
  fetchModuleInfo();
  fetchNetworkStaMenuTabInfo();
  fetchDeviceMenuTabInfo();
  getAvgTempReading();
  fetchUptimeFunk();

  setInterval(() => {
    if (nodeType === "controller") {
      updateConnectedDevicesShow();
    }
  }, 5000);

  setInterval(getAvgTempReading, 5000);
  setInterval(fetchUptimeFunk, 5000);
  setInterval(fetchEnvState, 30000);
});
