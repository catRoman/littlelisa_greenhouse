import state from "./AppState.js";
import { getValidNodeClass } from "./utils.js";

class ApiRepo {
  constructor() {
    this.fetchModuleInfo(),
      this.fetchControllerStaList(),
      this.fetchEnvState(),
      this.fetchDeviceInfo(),
      this.fetchNetworkApInfo(),
      this.fetchNetworkStaInfo(),
      this.fetchUptimeFunk();
  }

  async fetchApiData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response wasnt very cool");
    }
    return await response.json();
  }

  async fetchModuleInfo() {
    console.log("fetching module info");
    try {
      const data = await this.fetchApiData("/api/moduleInfo.json");
      state.setState({ nodeType: data.module_info.type, _moduleData: data });
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async fetchControllerStaList() {
    console.log("fetching controller sta list");
    try {
      const data = await this.fetchApiData("/api/controllerStaList.json");
      state.setState({ _nodeListObj: Object.keys(data.sta_list) });
    } catch (error) {}
  }
  async fetchEnvState() {
    console.log("fetching env state");
    try {
      const data = await this.fetchApiData("/api/envState");
      state.setState({ envStateArr: Object.values(data) });
    } catch (error) {
      console.log(error.message);
    }
  }

  async fetchDeviceInfo() {
    console.log("fetching device info");
    try {
      const data = await this.fetchApiData("/api/deviceInfo.json");
      state.setState({ deviceInfo: data });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchNetworkApInfo() {
    console.log("fetching network ap info");
    try {
      const data = await this.fetchApiData("/api/wifiApConnectInfo.json");

      state.setState({ wifiApConnectInfo: data });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchNetworkStaInfo() {
    console.log("fetching network sta info");
    try {
      const data = await this.fetchApiData("/api/wifiStaConnectInfo.json");
      state.setState({ wifiStaConnectInfo: data });
    } catch (error) {
      console.log(error);
    }
  }
  async fetchUptimeFunk() {
    console.log("fetching uptime");
    try {
      const data = await this.fetchApiData("/api/uptimeFunk.json");

      state.setState({ uptimeFunk: data });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async pingNode(validNodeClass) {
    console.log("pinging node");
    try {
      const response = await fetch(
        `http://littlelisa-${validNodeClass}.local/api/moduleInfo.json`
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        console.error(`${validNodeClass} not a node`, error);
      }
    } catch (error) {}
  }

  async toggleStateFetch(id) {
    console.log("toggling state");
    try {
      const response = await fetch("/api/envStateUpdate", {
        method: "PUT",
        body: id,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();

      this.fetchEnvState();
    } catch (error) {
      console.log(error.message);
    }
  }
}
export default new ApiRepo();
