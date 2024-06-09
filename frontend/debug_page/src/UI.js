import state from "./AppState.js";
import ApiRepo from "./ApiRepo.js";

import { getValidNodeClass } from "./utils.js";

export default class UIRenderer {
  constructor() {
    this.apSection = document.querySelector(".network-info > ul");
    this.connectedDeviceBox = document.querySelector(
      ".network-info  .connected-devices"
    );
    this.envContainer = document.querySelector(".env-cntrl");
    this.sensorDataSection = document.querySelector(".section-sensor-data");
    this.sensorSection = document.querySelector(".section-sensor-data");
    this.sensorRefreshBtn = document.querySelector(".sensor-refresh");
    this.nodeBox = document.querySelector(".sensor-data-node-box");

    this.sensorRefreshBtn = document.querySelector(".sensor-refresh");
    this.openButton = document.querySelector(".icon-open");
    this.closeButton = document.querySelector(".icon-close");
    this.menu = document.querySelector(".menu");
    this.main = document.querySelector("main");
    this.navClose = document.querySelector(".nav-btn.close");
    this.menuBtns = document.querySelectorAll(".nav-btn");

    this.connectionBtns = document.querySelector(
      ".online-connections > .inside"
    );
    this.projName = document.querySelector(
      ".device-info .proj-name"
    ).textContent;
    this.appVer = document.querySelector(".device-info .app-ver").textContent;
    this.secVer = document.querySelector(".device-info .sec-ver").textContent;
    this.cores = document.querySelector(".device-info .cores").textContent;
    this.chip = document.querySelector(".device-info .chip").textContent;
    this.time = document.querySelector(".device-info .time").textContent;
    this.date = document.querySelector(".device-info .date").textContent;
    this.idfVer = document.querySelector(".device-info .idf-ver").textContent;

    this.staSSID = document.querySelector(
      ".network-info .sta-ssid"
    ).textContent;
    this.rssi = document.querySelector(".network-info .rssi").textContent;
    this.ip = document.querySelector(".network-info .ip").textContent;
    this.netmask = document.querySelector(".network-info .netmask").textContent;
    this.gateway = document.querySelector(".network-info .gateway").textContent;
    this.uptime = document.querySelector(".uptime").textContent;

    this.type = document.querySelector(".title-box .type").textContent;
    this.moduleId = document.querySelector(".title-box .module_id").textContent;
    this.location = document.querySelector(
      ".title-box .title-location"
    ).textContent;
    this.connectedDeviceBox = document.querySelector(
      ".network-info  .connected-devices"
    );
    this.nodeBoxes = document.querySelectorAll(".sensor-data-node-box");
  }
  init() {
    this.renderWifiApInfo();
    this.renderEnvStateView();
    this.applyNodeInfo();
    this.addEventListeners();
  }
  addEventListeners() {
    this.closeButton.addEventListener("click", this.closeEvent.bind(this));
    this.closeButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.closeEvent();
    });

    this.openButton.addEventListener("click", this.openEvent.bind(this));
    this.openButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.openEvent();
    });

    this.menuBtns.forEach((el) => {
      el.addEventListener("click", (e) =>
        this.menuEvent(e, e.currentTarget.classList)
      );
      el.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.menuEvent(e, e.classList);
      });
    });

    this.sensorRefreshBtn.addEventListener("click", (e) => {
      sensorRefreshEvent();
    });
    this.sensorRefreshBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      sensorRefreshEvent();
    });
  }
  openEvent() {
    this.openButton.classList.toggle("hidden");
    this.main.classList.toggle("hidden");
    this.menu.classList.toggle("hidden");
  }

  closeEvent() {
    const menuTabs = document.querySelector(".menu-select");
    Array.from(menuTabs.children).forEach((el) => {
      if (
        !el.classList.contains("hidden") &&
        !el.classList.contains("head-icon")
      ) {
        console.log(el.classList[0]);
        this.toggleInfoTab(`.${el.classList[0]}`);
      }
    });
  }

  renderWifiApInfo() {
    console.log("rendering wifi ap info");
    console.log(state.getWifiApConnectInfo());
    const { ap_ssid, ap_channel, ap_pass, ap_max_connect } =
      state.getWifiApConnectInfo();

    this.apSection.insertAdjacentHTML(
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

    //update network info list
    let tempStr = "";

    state.getNodeList().forEach((obj) => {
      tempStr += obj + "\n";
    });
    if (this.connectedDeviceBox) this.connectedDeviceBox.value = tempStr;
  }
  renderModuleInfo(nodeId) {
    console.log("rendering module info");
    const {
      module_info: { type, location, identifier },
      sensor_list: sensorList,
    } = state.getModuleData();

    const nodeIdSec = document.querySelector(`.${nodeId}`);
    //change sensor-summary self
    if (nodeIdSec !== null) {
      const selfNodeBox = nodeIdSec;
    } else {
      this.sensorDataSection.insertAdjacentHTML(
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

    const selfNodeBox = nodeIdSec;

    selfNodeBox.querySelector(".sensor-data-info > h2").textContent =
      identifier;
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

    this.addNodeBoxButtonEvent(`.${nodeId}`);
    //TODO: add event listener for node-box button
  }
  async applyNodeInfo() {
    console.log("applying node info");
    //loop through node list
    //check if node-box  exists for node, if not render sensor-data-node-box
    //loop through node list fetch nodes moduleInfo.json and populate

    const nodeList = state.getNodeList();
    Object.entries(nodeList).forEach(([key, value]) => {
      const validNodeClass = getValidNodeClass(key);
      //ping "key".local/api/moduleInfo.json to get valid resposnse
      //if not its not a node
      //TODO: check for service of littlelisa-api from mdns

      if (ApiRepo.pingNode(validNodeClass)) {
        if (document.querySelector(`.${validNodeClass}`) === null) {
          this.renderModuleInfo(validNodeClass, data);
          this.renderConnectedDeviceLink(validNodeClass, data, value);

          state.addToRenderedNodeList(key);
        }
        UIUpdater.updateRssi(validNodeClass, value);
      }
    });
  }
  renderEnvStateView() {
    console.log("rendering env state view");
    this.envContainer.innerHTML = "";

    state.getEnvState().forEach((relay) => {
      this.envContainer.insertAdjacentHTML(
        "beforeend",
        ` <li class="env-li" >
        <p>Id:${relay.id} &harr; P:${relay.pin} &harr; ${relay.type} &rarr;</p>
        <button data-id="${relay.id}" class="env-status ${
          relay.state === "on" ? "env-status-on" : "env-status-off"
        }">${relay.state}</button>
        </li>`
      );
    });

    const buttons = this.envContainer.querySelectorAll(".env-status");
    buttons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const id = this.getAttribute("data-id");
        event.preventDefault();
        event.stopPropagation();
        toggleStateFetch(id);
      });
    });
  }
  toggleInfoTab(navClass) {
    console.log("toggling info tab");
    this.menu.classList.toggle("hidden");
    document.querySelector(navClass).classList.toggle("hidden");
    this.closeButton.classList.toggle("hidden");
  }
  checkForNodeRemoval() {
    console.log("checking for node removal");
    state.getRenderedNodeList().forEach((node) => {
      const validNodeClass = getValidNodeClass(node);

      if (
        !nodeListObj.includes(node) &&
        document.querySelector(`.${validNodeClass}`) !== null
      ) {
        document.querySelector(`.${validNodeClass}`).remove();
        document.querySelector(`.${validNodeClass}-btn`).remove();
        state.removeFromRenderedNodeList(node);
      }
    });
  }
  renderConnectedDeviceLink(nodeId, rssiValue) {
    console.log("rendering connected device link");
    const {
      module_info: { location, identifier },
    } = state.getModuleData();

    this.connectionBtns.insertAdjacentHTML(
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

  menuEvent(e, classList) {
    e.stopPropagation;
    const classes = [...classList];
    switch (classes[classes.length - 1]) {
      case "dev_btn":
        this.toggleInfoTab(".device-info");

        break;
      case "net_btn":
        this.toggleInfoTab(".network-info");
        break;
      case "db_btn":
        this.toggleInfoTab(".sd-db-info");
        break;
      case "sys_btn":
        this.toggleInfoTab(".system-health");
        break;
      case "ota_btn":
        if (moduleData.module_info.type == "controller") {
          this.toggleInfoTab(".ota-update");
        } else {
          console.log(
            "Disabled for nodes. TODO: only render button for controller"
          );
        }
        break;
      case "close":
        this.openButton.classList.toggle("hidden");
        this.main.classList.toggle("hidden");
        this.menu.classList.toggle("hidden");
        this.main.style.pointerEvents = "none";

        setTimeout(() => {
          this.main.style.pointerEvents = "auto";
        }, 100);
        break;
      default:
    }
  }
  addNodeBoxButtonEvent(nodeNameClass) {
    const sensorSummary = document.querySelector(
      `${nodeNameClass} > .sensor-summary`
    );
    sensorSummary.addEventListener("click", function (event) {
      if (event.target === this || this.contains(event.target)) {
        sensorSummary.nextElementSibling.classList.toggle("hidden");

        sensorSummary.querySelector(".node-title").classList.toggle("green");
      }
    });
  }
  updateMenuDeviceInfoTab() {
    console.log("up[date menu device info tab");
    const {
      chip_info: { num_cores, chip_type },
      app_info: {
        secure_ver,
        app_ver,
        proj_name,
        compile_info: { time: compileTime, date: compileDate, idf_ver },
      },
    } = state.getModuleData();

    this.projName = proj_name;
    this.appVer = app_ver;
    this.secVer = secure_ver;
    this.cores = num_cores;
    this.chip = chip_type;
    this.time = compileTime;
    this.date = compileDate;
    this.idfVer = idf_ver;
  }

  updateWifiStaInfo(networkStaObj) {
    console.log("update wifi sta info");
    const { ip, netmask, gw, ap, rssi } = networkStaObj;

    this.staSSID = ap;
    this.rssi = rssi;
    this.ip = ip;
    this.netmaskl = netmask;
    this.gateway = gw;
  }
  updateUptime({ uptime }) {
    const timeParts = [
      Math.floor(uptime / 86400000), // Days
      Math.floor((uptime % 86400000) / 3600000), // Hours
      Math.floor((uptime % 3600000) / 60000), // Minutes
      Math.floor((uptime % 60000) / 1000), // Seconds
    ].map((part) => part.toString().padStart(2, "0"));

    this.uptime = `${timeParts[0]} : ${timeParts[1]} : ${timeParts[2]} : ${timeParts[3]}`;
  }
  async updatePageTitle() {
    console.log("update page title");
    console.log(state.getModuleData());
    const {
      module_info: { type, location, identifier },
    } = state.getModuleData();

    this.type = type;
    this.moduleId = identifier;
    this.location = location;
  }

  updateSensorData(wsSensorData) {
    console.log("update sensor data");
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
  updateRssi(nodeId, value) {
    console.log("update rssi");
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
  updateConnectedDevicesShow() {
    console.log("update connected devices show");
    ApiRepo.fetchControllerStaList();
    this.updateNetworkInfoList();
    UIRenderer.checkForNodeRemoval();
  }
  updateNetworkInfoList() {
    console.log("update network info list");
    let tempStr = "";

    state.nodeListObj().forEach((obj) => {
      tempStr += obj + "\n";
    });
    if (this.connectedDeviceBox) this.connectedDeviceBox.value = tempStr;
  }
  getAvgTempReading() {
    console.log("get avg temp reading");
    this.nodeBoxes.forEach((nodeBox) => {
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
}
