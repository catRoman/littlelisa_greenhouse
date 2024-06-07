function updateConnectedDevicesShow() {
  fetchControllerStaList();
  updateNetworkInfoList();
  checkForNodeRemoval();
}
function updateNetworkInfoList() {
  const connectedDeviceBox = document.querySelector(
    ".network-info  .connected-devices"
  );
  let tempStr = "";

  nodeListObj.forEach((obj) => {
    tempStr += obj + "\n";
  });
  if (connectedDeviceBox) connectedDeviceBox.value = tempStr;
}
