"use strict";

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

export const state_gt = {
  nodeListObj: [],
  envStateArr: {},
  nodeType: "node",
  renderedNodeList: new Set(null),
  moduleData: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  fetchEnvState();
  fetchModuleInfo();
  fetchNetworkStaMenuTabInfo();
  fetchDeviceMenuTabInfo();
  getAvgTempReading();
  fetchUptimeFunk();

  setInterval(() => {
    if (state_gt.nodeType === "controller") {
      updateConnectedDevicesShow();
    }
  }, 5000);

  setInterval(getAvgTempReading, 5000);
  setInterval(fetchUptimeFunk, 5000);
  setInterval(fetchEnvState, 30000);
});
