import ApiRepo from "./ApiRepo.js";
class AppState {
  constructor() {
    if (!AppState.instance) {
      this._state = {
        nodeListObj: [],
        envStateArr: [],
        nodeType: "node",
        renderedNodeList: new Set(),
        moduleData: {},
        deviceInfo: {},
        wifiApConnectInfo: {},
        wifiStaConnectInfo: {},
        uptimeFunk: {},
      };
      AppState.instance = this;
    }

    return AppState.instance;
  }

  setState(newState) {
    this._state = { ...this._state, ...newState };
    console.log("state set", this._state);
  }
  getDeviceInfo() {
    console.log("getting device info");
    return this._state._deviceInfo;
  }
  getWifiApConnectInfo() {
    console.log("getting wifi ap connect info");
    return this._state._wifiApConnectInfo;
  }

  getWifiStaConnectInfo() {
    console.log("getting wifi sta connect info");
    return this._state._wifiStaConnectInfo;
  }
  getUptimeFunk() {
    console.log("getting uptime funk");
    return this._state._uptimeFunk;
  }
  getNodeList() {
    console.log("getting node list");
    return this._state._nodeListObj;
  }
  getEnvState() {
    console.log("getting env state");
    return this._state._envStateArr;
  }
  getModuleData() {
    console.log("getting module data");
    return this._state._moduleData;
  }
  getRenderedNodeList() {
    console.log("getting rendered node list");
    return this._state._renderedNodeList;
  }
  getNodeType() {
    console.log("getting node type");
    return this._state._nodeType;
  }
  addToRenderedNodeList(item) {
    console.log("adding to rendered node list");
    const newRenderedNodeList = new Set(this._state._renderedNodeList);
    newRenderedNodeList.add(item);
    this._state._renderedNodeList = newRenderedNodeList;
  }
  removeFromRenderedNodeList(item) {
    console.log("removing from rendered node list");
    const newRenderedNodeList = new Set(this._state._renderedNodeList);
    newRenderedNodeList.delete(item);
    this._state._renderedNodeList = newRenderedNodeList;
  }
}

const state = new AppState();
export default state;
