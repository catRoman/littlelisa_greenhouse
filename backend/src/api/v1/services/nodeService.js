import { json } from "express";
import nodeRepo from "../repos/nodeRepo.js";
import eventLogRepo from "../repos/eventLogRepo.js";

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

const updateNodeTag = async (
  selectedNode,
  newNodeTag,
  greenhouseId,
  zoneId,
  squareId
) => {
  try {
    const updateData = parseForm(selectedNode);

    const proxyControllerPut = async (updateData) => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",
          headers: {
            "Mac-Addr": updateData.mac_addr,
            "Update-Endpoint": "updateNodeTag",
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

const updateNodePos = async (
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
            "Mac-Addr": nodeData.mac_addr,
            "Update-Endpoint": "updateNodePos",
            "Pos-X": nodeData.x_pos,
            "Pos-Y": nodeData.y_pos,
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
  updateNodePos,
  updateNodeTag,
};
