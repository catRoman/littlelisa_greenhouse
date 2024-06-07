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
