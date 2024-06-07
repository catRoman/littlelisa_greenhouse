/**
 * Updates the connected devices show by fetching the controller STA list,
 * updating the network info list, and checking for node removal.
 */
export function updateConnectedDevicesShow() {
  fetchControllerStaList();
  updateNetworkInfoList();
  checkForNodeRemoval();
}
/**
 * Updates the network information list by populating the connected devices box.
 */
export function updateNetworkInfoList() {
  const connectedDeviceBox = document.querySelector(
    ".network-info  .connected-devices"
  );
  let tempStr = "";

  nodeListObj.forEach((obj) => {
    tempStr += obj + "\n";
  });
  if (connectedDeviceBox) connectedDeviceBox.value = tempStr;
}
