//++++++++++sensorRefresh

function sensorRefreshEvent() {
  if (sensorDataSocket !== undefined) {
    sensorDataSocket.close();
    setTimeout(() => initiateSensorSocket(moduleData), 3000);
  }
}
sensorRefreshBtn.addEventListener("click", (e) => {
  sensorRefreshEvent();
});
sensorRefreshBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  sensorRefreshEv;
  ent();
});
//===========================
//  Node sensor data display
//===========================
function addNodeBoxButtonEvent(nodeNameClass) {
  const sensorSummary = document.querySelector(
    `${nodeNameClass} > .sensor-summary`
  );
  sensorSummary.addEventListener("click", function (event) {
    // Check if the clicked element is the parent or one of its children
    if (event.target === this || this.contains(event.target)) {
      sensorSummary.nextElementSibling.classList.toggle("hidden");

      sensorSummary.querySelector(".node-title").classList.toggle("green");

      // Perform your desired action
    }
  });
}
