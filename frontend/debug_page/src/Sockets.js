import UIUpdater from "../ui/UIUpdater";
import state from "../AppState";
import { getValidNodeClass } from "../helpers/utils";

export default class Socket {
  constructor(endpoint) {
    this.UIUpdater = new UIUpdater();
    this.otaStatusContainer = document.querySelector(".ota-status");
    this.retryCount = 0;

    const { type, identifier } = state.getModuleData();
    let nodeId = getValidNodeClass(identifier);
    nodeId = type + nodeId.substring(nodeId.indexOf("-"));

    this.socket = new WebSocket(
      `ws://littlelisa-${nodeId}.local:8080/ws/${endpoint}`
    );

    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  onOpen() {
    console.log(`Connected to the ${this.endpoint} server.`);
    this.retryCount = 0;
  }
  onMessage(event) {
    console.log(
      `Received message from ${this.endpoint} the server: ${event.data}`
    );
  }
  onClose(event) {
    if (!event.wasClean) {
      let delay = this.getExponentialBackoffDelay();
      setTimeout((this.self = new Socket()), delay);
      this.retryCount++;
    } else {
      console.log(`Connection to the ${this.endpoint} server closed.`);
      this.retryCount = 0;
    }
  }
  onError(error) {
    console.error(`An error occurred for ${this.endpoint}: ${error}`);
  }

  send(data) {
    this.socket.send(data);
  }

  getExponentialBackoffDelay() {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    let delay = Math.min(maxDelay, baseDelay * 2 ** this.retryCount);
    console.log(`Reconnecting in ${delay} ms`);
    return delay;
  }
}
