import ApiRepo from "./ApiRepo.js";
import state from "./AppState.js";

import "./css/index.css";
import "./css/general.css";
import UI from "./UI.js";
import { getValidNodeClass } from "./utils.js";

const test = new UI();
test.init();
window.addEventListener("domContentLoaded", async () => {
  // setInterval(() => {
  //   if (state.nodeType === "controller") {
  //     UIUpdater.updateConnectedDevicesShow();
  //   }
  // }, 5000);
  // setInterval(UIUpdater.getAvgTempReading, 5000);
  // setInterval(ApiRepo.fetchUptimeFunk, 5000);
  // setInterval(ApiRepo.fetchEnvState, 30000);
});

// window.addEventListener("beforeunload", function () {
//   logSocket.send("stop log");
//   logSocket.send("");
//   sensorSocket.send("");
// });
