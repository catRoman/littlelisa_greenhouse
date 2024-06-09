import Socket from "./Sockets";
export class SensorSocket extends Socket {
  constructor() {
    super("sensor");
    this.socket.onmessage = this.onMessage.bind(this);
  }
  onMessage(event) {
    super.onMessage(event);
    this.UIUpdater.SensorData(JSON.parse(event.data.replace(/\0+$/, "")));
  }

  sensorRefreshEvent() {
    this.socket.close();
    setTimeout(() => new SensorSocket(), 3000);
  }
}
