let nodeType = "node";

/**
 * Fetches esp module info for menu tab .
 * @returns {Promise<void>} A promise that resolves when info is fetched successfully.
 */
export async function fetchDeviceMenuTabInfo() {
  try {
    const response = await fetch("/api/deviceInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    updateMenuDeviceInfoTab(data);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Fetches network AP info for menu tab from the esp controller api.
 * @returns {Promise<void>} A promise that resolves when the esp controllers ap info is fetched successfully.
 */
export async function fetchNetworkApMenuTabInfo() {
  try {
    const response = await fetch("/api/wifiApConnectInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    renderWifiApInfo(data);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Fetches wifi stations for use in menu from esp controller api.
 * @returns {Promise<void>} A promise that resolves when the wifi station list is fetched successfully.
 */
export async function fetchNetworkStaMenuTabInfo() {
  try {
    const response = await fetch("/api/wifiStaConnectInfo.json");
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    const data = await response.json();

    updateWifiStaInfo(data);
  } catch (error) {
    console.log(error);
  }
}

/** Fetches uptime from the esp controller api.
 * @returns {Promise<void>} A promise that resolves when the uptime is fetched successfully.
 * */
export async function fetchUptimeFunk() {
  try {
    const response = await fetch("/api/uptimeFunk.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    updateUptime(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

/** Fetches the esp controllers module info.
 * initiates sockets for log and sensor data.
 * @returns {Promise<void>} A promise that resolves when the module info is fetched successfully.
 * @error {Error} If the network response is not ok.
 **/
export async function fetchModuleInfo() {
  try {
    const response = await fetch("/api/moduleInfo.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    nodeType = data.module_info.type;
    console.log(nodeType);
    moduleData = data;
    updatePageTitle(data);
    renderModuleInfo(getValidNodeClass(data.module_info.identifier), data);

    initiateLogSocket(data);
    initiateSensorSocket(data);
    if (nodeType === "controller") {
      updateConnectedDevicesShow();
      fetchNetworkApMenuTabInfo();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

/** retrieves the wifi station list from the esp controller module
 * @returns {Promise<void>} A promise that resolves when the wifi station list is fetched successfully.
 */
export async function fetchControllerStaList() {
  try {
    const response = await fetch("/api/controllerStaList.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    //apply to global
    nodeListObj = Object.keys(data.sta_list);
    applyNodeInfo(data);
  } catch (error) {}
}

/**
 * Applies node information to the UI.
 * @param {Object} nodeListObj - The object containing the node list.
 */
export function applyNodeInfo(nodeListObj) {
  //loop through node list
  //check if node-box  exists for node, if not render sensor-data-node-box
  //loop through node list fetch nodes moduleInfo.json and populate

  const { sta_list: nodeList } = nodeListObj;
  Object.entries(nodeList).forEach(([key, value]) => {
    const validNodeClass = getValidNodeClass(key);
    //ping "key".local/api/moduleInfo.json to get valid resposnse
    //if not its not a node
    //TODO: check for service of littlelisa-api from mdns
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

            renderedNodeList.add(key);
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

/** retrieves the current enviroment control state from the esp controller
 * @returns {Promise<void>} A promise that resolves when the enviroment control state is fetched successfully.
 */
export async function fetchEnvState() {
  try {
    const response = await fetch("/api/envState");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    //apply to global
    envStateArr = Object.values(data);

    updateEnvStateView();
  } catch (error) {
    console.log(error.message);
  }
}

/** send the enviromental control state update from the esp controller
 * @param {string} id - the id of the state to be updated.
 */
export async function toggleStateFetch(id) {
  try {
    const response = await fetch("/api/envStateUpdate", {
      method: "PUT",
      body: id,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const newState = await response.json();

    //apply to global

    fetchEnvState();
  } catch (error) {
    console.log(error.message);
  }
}
