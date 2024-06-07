function getAvgTempReading() {
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

function updateSensorData(wsSensorData) {
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
