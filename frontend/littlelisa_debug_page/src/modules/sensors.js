const sensorSection = document.querySelector(".section-sensor-data");
const sensorRefreshBtn = document.querySelector(".sensor-refresh");
const nodeBox = document.querySelector(".sensor-data-node-box");
/**
 * Closes the sensor data socket and initiates a new sensor socket after a delay.
 * @function sensorRefreshEvent
 */
export function sensorRefreshEvent() {
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
  sensorRefreshEvent();
});

/**
 * Adds a click event listener to a sensor summary element.
 * @param {string} nodeNameClass - The class name of the parent node.
 */
export function addNodeBoxButtonEvent(nodeNameClass) {
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
/**
 * Calculates the average temperature reading from sensor data nodes and updates the corresponding elements.
 */
export function getAvgTempReading() {
  const nodeBoxes = document.querySelectorAll(".sensor-data-node-box");
  nodeBoxes.forEach((nodeBox) => {
    const sensorTempReadings = nodeBox.querySelectorAll(".temp");

    const { sumTemp, count } = Array.from(sensorTempReadings).reduce(
      (acc, node) => {
        const tempValue = Number(node.textContent);
        if (!Number.isNaN(tempValue)) {
          acc.sumTemp += tempValue;
          acc.count++;
        }
        return acc;
      },
      { sumTemp: 0, count: 0 }
    );

    const avgTemp = count > 0 ? sumTemp / count : 0;
    nodeBox.querySelector(".sensor-avg").textContent = avgTemp.toFixed(2);
  });
}

/**
 * Updates the sensor data in the UI based on the received WebSocket sensor data.
 * @param {Object} wsSensorData - The WebSocket sensor data object.
 * @param {Object} wsSensorData.module_info - The module information object.
 * @param {Object} wsSensorData.sensor_info - The sensor data object.
 */
export function updateSensorData(wsSensorData) {
  const { module_info: moduleInfoObj, sensor_info: sensorDataObj } =
    wsSensorData;

  //locate sensor box using module_id
  //locate sensor using local_sensor_id *double check this is not dependant
  //locate sensor type using sensor type
  //change text content
  //adjust box for variable values
  const validNodeClass = getValidNodeClass(moduleInfoObj.identifier);

  const nodeSensorData = document.querySelector(`.${validNodeClass}`);

  const sensorType = nodeSensorData?.querySelector(
    `.${sensorDataObj.sensor_type}`
  );

  const sensorToUpdate = sensorType?.querySelector(
    `.local-sensor-${sensorDataObj.local_sensor_id}`
  );
  if (sensorToUpdate != undefined) {
    sensorToUpdate.querySelector(".timestamp").textContent =
      sensorDataObj.timestamp;
    sensorToUpdate.querySelector(".sensor-location").textContent =
      sensorDataObj.location;
    sensorToUpdate.querySelector(".sensor-pin").textContent =
      sensorDataObj.sensor_pin;
    sensorToUpdate.querySelector(
      ".temp"
    ).textContent = `${sensorDataObj.data.temperature.toFixed(2)}`;
    sensorToUpdate.querySelector(
      ".hum"
    ).textContent = `${sensorDataObj.data.humidity.toFixed(2)}`;
  }
}
