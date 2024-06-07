//==============
// Helpers
//=============
function getValidNodeClass(macAddr) {
  return "node-" + macAddr.replaceAll(":", "-");
}
function extractNodeIdToStatus(updateLog) {
  const regex = /.*UPDATING_NODE_(\d+).*/;
  const nodeId = updateLog.match(regex);

  if (nodeId) {
    otaStatusInfo.textContent = "Updating";
    otaStatusReset.textContent = `Updating node ${nodeId[1]}...`;
    console.log(`Updating node ${nodeId[1]}...`);
  }
}
//================
//DEBUG help
//==================
//display screen demiinsion in console for debug
window.addEventListener("resize", () => {
  console.log(
    `Viewport Width: ${window.innerWidth}, Viewport Height: ${window.innerHeight}`
  );
});

// Log the initial size
console.log(
  `Initial Viewport Width: ${window.innerWidth}, Initial Viewport Height: ${window.innerHeight}`
);
