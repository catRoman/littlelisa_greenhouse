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

const updateTag = async (
  nodeMac,
  sensorId,
  newNodeTag,
  greenhouseId,
  zoneId,
  squareId
) => {
  try {
    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateSensor", {
          method: "PUT",
          headers: {
            "Node-Mac-Addr": updateData.mac_addr,
            "Node-Update-Endpoint": "updateNodeTag",
            "Node-New-Tag": newNodeTag,
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
    const proxiedResponse = await proxyControllerPut(updateData);

    if (proxiedResponse.ok) {
      console.log("event added for update node Tag");
      await nodeRepo.updateNodeTag(updateData.node_id, newNodeTag);
      await eventLogRepo.addEvent(
        "Node",
        "Updated",
        `node tag changed to ${newNodeTag}`,
        greenhouseId,
        zoneId ? zoneId : null,
        squareId ? squareId : null,
        updateData.node_id,
        null,
        null
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePos = async (
  type,
  selectedNode,
  zoneId,
  squareId,
  greenhouseId
) => {
  try {
    //make json

    const nodeData = parseForm(selectedNode);
    if (type === "remove") {
      nodeData.x_pos = 0;
      nodeData.y_pos = 0;
    }
    console.log(nodeData);

    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",

          headers: {
            "Node-Mac-Addr": nodeData.mac_addr,
            "Node-Update-Endpoint": "updateNodePos",
            "Node-Pos-X": nodeData.x_pos,
            "Node-Pos-Y": nodeData.y_pos,
            "Node-Zone-Num": zoneId - 1,
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
      if (type === "add") {
        console.log("event added for add node");
        await nodeRepo.updateNodeBySquareId(nodeData.node_id, squareId, zoneId);
        await eventLogRepo.addEvent(
          "Node",
          "Updated",
          "node added to plot",
          greenhouseId,
          zoneId,
          squareId,
          nodeData.node_id,
          null,
          null
        );
      } else if (type === "remove") {
        console.log("event added for node removal");
        const emptyPosition = [0, 0, 0];
        //pos,
        await nodeRepo.updateNodeByZnRelPos(emptyPosition, nodeData.node_id, 1);
        await eventLogRepo.addEvent(
          "Node",
          "Removed",
          "node unassigned",
          greenhouseId,
          zoneId,
          squareId,
          nodeData.node_id,
          null,
          null
        );
      }
    }

    return proxiedResponse;
  } catch (error) {
    console.log(error);
  }
};

export default {
  updatePos,
  updateTag,
  getZoneChartData,
  getChartData,
  getGreenhouseChartData,
};
