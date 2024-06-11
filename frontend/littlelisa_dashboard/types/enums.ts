export enum GreenHouseViewState {
  GreenHouse,
  Zone,
  Plot,
}
export enum ControlPanelState {
  Enviroment = "Enviroment",
  Update = "Update",
  Schedule = "Schedule",
  Reminder = "Reminder",
  Closed = "Closed",
}
export enum EventPanelState {
  Upcoming = "Upcoming",
  Recent = "Recent",
}

export enum UpdateSubMenu {
  Greenhouse = "Greenhouse",
  Zone = "Zone",
  Controller = "Controller",
  GlobalSensors = "Gloabl Sensors",
  PlantInfo = "Plant Info",
  Nodes = "Nodes",
  Sensors = "Sensors",
  Sprinklers = "Sprinklers",
  Clear = "Clear",
}
export enum DebugPanelState {
  Device = "Device",
  Network = "Network",
  System = "System",
  DB = "DB",
  OTA = "OTA",
}
