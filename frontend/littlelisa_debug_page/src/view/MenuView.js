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
