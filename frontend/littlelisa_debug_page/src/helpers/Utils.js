/**
 * Returns a valid node class based on the given MAC address.
 * @param {string} macAddr - The MAC address of the node.
 * @returns {string} - The valid node class.
 */
export function getValidNodeClass(macAddr) {
  return "node-" + macAddr.replaceAll(":", "-");
}

/**
 * Extracts the node ID from the update log and updates the OTA status information.
 * @param {string} updateLog - The update log string.
 */
export function extractNodeIdToStatus(updateLog) {
  const regex = /.*UPDATING_NODE_(\d+).*/;
  const nodeId = updateLog.match(regex);

  if (nodeId) {
    otaStatusInfo.textContent = "Updating";
    otaStatusReset.textContent = `Updating node ${nodeId[1]}...`;
    console.log(`Updating node ${nodeId[1]}...`);
  }
}

window.addEventListener("resize", () => {
  console.log(
    `Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`
  );
});

console.log(
  `Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`
);
