import sensorRepo from "../repos/sensorRepo.js";
const getChartData = async (sensorId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);
  const chartData = await sensorRepo.getChartData(
    sensorId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

const getZoneChartData = async (zoneId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);

  const chartData = await sensorRepo.getZoneChartData(
    zoneId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

const getGreenhouseChartData = async (greenhouseId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);

  const chartData = await sensorRepo.getGreenhouseChartData(
    greenhouseId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

function validateSensorParams(last, unit, grouped) {
  const message = `{"last": "${last}", "unit": "${unit}", "grouped": "${grouped}"}`;
  if (isNaN(last)) {
    throw new Error("Invalid input for last: must be an integer");
  }
  const validUnits = ["days", "weeks", "hours", "months", "years"];
  if (!validUnits.includes(unit)) {
    throw new Error(
      "invalid input for unit: must be either hours, days, weeks, months, years"
    );
  }
  const validGrouping = ["hour", "day", "week", "month"];
  if (!validGrouping.includes(grouped)) {
    throw new Error(
      "invalid input for grouped: must be eithe hour, day, week, month"
    );
  }
}

function parseForm(formDataString) {
  console.log(formDataString);
  const parts = formDataString.split("-");

  if (parts.length !== 4) {
    throw new Error("Input string does not match the expected format: ");
  }

  const result = {
    node_id: parts[0],
    mac_addr: parts[1].replace(/:/g, "-"),
    x_pos: parts[2],
    y_pos: parts[3],
  };
  console.log("ok");
  return result;
}

const updateTag = async (
  newNodeTag,
  nodeMac,
  sensorType,
  localId,
  sensorId,
  greenhouseId,
  zoneId,
  squareId
) => {
  try {
    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",
          headers: {
            "Update-Endpoint": "updateSensorTag",
            "Sensor-New-Tag": newNodeTag,
            "Sensor-Type": sensorType,
            "Node-Mac-Addr": nodeMac.replace(/:/g, "-"),
            "Sensor-Local-Id": localId,
          },
        });
        // Check if the response is ok
        if (!response.ok) {
          // Try to read the response as text to get more information about the error
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        return response;
      } catch (error) {
        console.error("Error from modules:", error);
      }
    };
    const proxiedResponse = await proxyControllerPut();

    if (proxiedResponse.ok) {
      // console.log("event added for update node Tag");
      // await sensorRepo.updateTag(sensorId, newTag);
      // await eventLogRepo.addEvent(
      //   "Sensor",
      //   "Updated",
      //   `sensor tag changed to ${newTag}`,
      //   greenhouseId,
      //   zoneId ? zoneId : null,
      //   squareId ? squareId : null,
      //   null,
      //   sensorId,
      //   null
      // );

      return proxiedResponse;
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePos = async (
  type,
  pos,
  nodeMac,
  sensorType,
  localId,
  sensorId,
  zoneId,
  squareId,
  greenhouseId
) => {
  try {
    //make json

    if (type === "remove") {
      pos[0] = -1;
      pos[1] = -1;
      pos[2] = -1;
    }
    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",

          headers: {
            "Node-Mac-Addr": nodeMac.replace(/:/g, "-"),
            "Sensor-Local-Id": localId,
            "Update-Endpoint": "updateSensorPos",
            "Sensor-Type": sensorType,
            "Pos-X": pos[0],
            "Pos-Y": pos[1],
            "Pos-Z": pos[2],
          },
        });
        // Check if the response is ok
        if (!response.ok) {
          // Try to read the response as text to get more information about the error
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        return response;
      } catch (error) {
        console.error("Error from modules:", error);
      }
    };
    const proxiedResponse = await proxyControllerPut();

    if (proxiedResponse.ok) {
      //PARAMS:
      // eventType,
      // eventAction,
      // details,
      // greenhouseId,
      // zoneId,
      // squareId,
      // moduleId,
      // sensorId,
      // note_id
      // if (type === "add") {
      //   console.log("event added for add node");
      //   await sensorRepo.updateSensorBySquareId(sensorId, squareId, zoneId);
      //   await eventLogRepo.addEvent(
      //     "Sensor",
      //     "Updated",
      //     "sensor added to plot",
      //     greenhouseId,
      //     zoneId ? zoneId : null,
      //     squareId ? squareId : null,
      //     null,
      //     sensorId,
      //     null
      //   );
      // } else if (type === "remove") {
      //   console.log("event added for node removal");
      //   const emptyPosition = [0, 0, 0];
      //   //pos,
      //   await sensorRepo.updateSensorByZnRelPos(emptyPosition, sensorId, 1);
      //   await eventLogRepo.addEvent(
      //     "Sensor",
      //     "Removed",
      //     "node unassigned",
      //     greenhouseId,
      //     zoneId ? zoneId : null,
      //     squareId ? squareId : null,
      //     null,
      //     sensorId,
      //     null
      //   );
      // }

      return proxiedResponse;
    }
  } catch (error) {
    console.log(error);
  }
};

const updateControllerTag = async (
  newNodeTag,
  sensorType,
  localId,
  sensorId,
  greenhouseId,
  zoneId
) => {
  try {
    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateSensorTag", {
          method: "PUT",
          headers: {
            "Sensor-New-Tag": newNodeTag,
            "Sensor-Type": sensorType,
            "Sensor-Local-Id": localId,
          },
        });
        // Check if the response is ok
        if (!response.ok) {
          // Try to read the response as text to get more information about the error
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        return response;
      } catch (error) {
        console.error("Error from modules:", error);
      }
    };
    const proxiedResponse = await proxyControllerPut();

    if (proxiedResponse.ok) {
      // console.log("event added for update node Tag");
      // await sensorRepo.updateTag(sensorId, newTag);
      // await eventLogRepo.addEvent(
      //   "Sensor",
      //   "Updated",
      //   `controller sensor tag changed to ${newTag}`,
      //   greenhouseId,
      //   null,
      //   null,
      //   null,
      //   sensorId,
      //   null
      // );

      return proxiedResponse;
    }
  } catch (error) {
    console.log(error);
  }
};

const updateControllerPos = async (
  type,
  pos,
  sensorType,
  localId,
  sensorId,
  zoneId,
  squareId,
  greenhouseId
) => {
  try {
    //make json

    if (type === "remove") {
      pos[0] = -1;
      pos[1] = -1;
      pos[2] = -1;
    }
    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateSensorPos", {
          method: "PUT",

          headers: {
            "Sensor-Local-Id": localId,
            "Sensor-Type": sensorType,
            "Pos-X": pos[0],
            "Pos-Y": pos[1],
            "Pos-Z": pos[2],
          },
        });
        // Check if the response is ok
        if (!response.ok) {
          // Try to read the response as text to get more information about the error
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
        return response;
      } catch (error) {
        console.error("Error from modules:", error);
      }
    };
    const proxiedResponse = await proxyControllerPut();

    if (proxiedResponse.ok) {
      // PARAMS:
      // eventType,
      // eventAction,
      // details,
      // greenhouseId,
      // zoneId,
      // squareId,
      // moduleId,
      // sensorId,
      // note_id
      // if (type === "add") {
      //   console.log("event added for add node");
      //   await sensorRepo.updateSensorBySquareId(sensorId, squareId, zoneId);
      // await eventLogRepo.addEvent(
      //   "Sensor",
      //   "Updated",
      //   "controller sensor added to global space",
      //   greenhouseId,
      //   null,
      //   null,
      //   null,
      //   sensorId,
      //   null
      // );
      // } else if (type === "remove") {
      //   console.log("event added for sensor removal");
      //   const emptyPosition = [0, 0, 0];
      //   //pos,
      //   await sensorRepo.updateSensorByZnRelPos(emptyPosition, sensorId, 1);
      //   await eventLogRepo.addEvent(
      //     "Sensor",
      //     "Removed",
      //     "controller sensor unassigned",
      //     greenhouseId,
      //      null,
      //      null,
      //     null,
      //     sensorId,
      //     null
      //   );
      // }

      return proxiedResponse;
    }
  } catch (error) {
    console.log(error);
  }
};

export default {
  updateControllerPos,
  updateControllerTag,
  updatePos,
  updateTag,
  getZoneChartData,
  getChartData,
  getGreenhouseChartData,
};
