//+++++++++++++++++++++++++++++++++++++++++
//++++++fetch for connected nodes moduleinfo
//++++++++++++++++++++++++++++++++++++++

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

//Wifi info
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
