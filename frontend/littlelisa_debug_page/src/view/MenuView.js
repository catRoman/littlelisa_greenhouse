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
