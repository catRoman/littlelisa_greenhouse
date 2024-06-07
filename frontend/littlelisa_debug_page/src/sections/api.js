//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/deviceInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchDeviceMenuTabInfo() {
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

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/wifiApConnectInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchNetworkApMenuTabInfo() {
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

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/wifiStaConnectInfo.json
//++++++++++++++++++++++++++++++++++++
async function fetchNetworkStaMenuTabInfo() {
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

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/uptimeFunk.json
//++++++++++++++++++++++++++++++++++++

async function fetchUptimeFunk() {
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

//+++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/moduleInfo.json
//++++++++++++++++++++++++++++++++++++

async function fetchModuleInfo() {
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

//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/moduleInfo.json
//+++++++++++++++++++++++++++++++++++

async function fetchControllerStaList() {
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

function applyNodeInfo(nodeListObj) {
  //loop through node list
  //check if node-box  exists for node, if not render sensor-data-node-box
  //loop through node list fetch nodes moduleInfo.json and populate

  const { sta_list: nodeList } = nodeListObj;
  Object.entries(nodeList).forEach(([key, value]) => {
    const validNodeClass = getValidNodeClass(key);
    //ping "key".local/api/moduleInfo.json to get valid resposnse
    //if not its not a node
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
//++++++++++++++++++++++++++++++++++++
//+++++++++++++  /api/envState
//+++++++++++++++++++++++++++++++++++

async function fetchEnvState() {
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
async function toggleStateFetch(id) {
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
