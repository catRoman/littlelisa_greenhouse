import { json } from "express";
import nodeRepo from "../repos/nodeRepo.js";

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

const updateNodeTag = async (selectedNode, newNodeTag, zoneId, squareId) => {
  try {
    const updateData = parseForm(selectedNode);

    const proxyControllerPut = async (updateData) => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
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
        const result = await response.json();
        console.log(result);
        return response;
      } catch (error) {
        console.error("Error from modules:", error);
      }
    };
    const proxiedResponse = await proxyControllerPut(updateData);

    if (proxiedResponse.ok) {
      await nodeRepo.updateNodeTag(tagNodeData.node_id, newNodeTag);
      await eventLogRepo.addEvent(
        "Node",
        "Updated",
        `node tag changed to ${newNodeTag}`,
        greenhouseId,
        zoneId,
        squareId,
        tagNodeData.node_id,
        null,
        null
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const updateNodePos = async (type, selectedNode, zoneId, squareId) => {
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
      } else if (nodeData === "remove") {
        const emptyPosition = [0, 0, 0];
        //pos,
        await nodeRepo.updateNodeByZnRelPos(emptyPosition, nodeData.node_id);
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
