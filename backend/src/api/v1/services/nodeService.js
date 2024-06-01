import { json } from "express";
import nodeRepo from "../repos/nodeRepo.js";

const updateNode = async (
  selectedAddNode,
  selectedRemoveNode,
  selectedTagNode,
  newNodeTag,
  zoneId,
  squareId
) => {
  try {
    //make json
    const updateData = {};

    function parseForm(formDataString) {
      console.log(formDataString);
      const parts = formDataString.split("-");

      if (parts.length !== 4) {
        throw new Error("Input string does not match the expected format: ");
      }

      const result = {
        node_id: parts[0],
        mac_addr: parts[1],
        x_pos: parts[2],
        y_pos: parts[3],
      };
      console.log("ok");
      return result;
    }

    if (!selectedAddNode) {
      updateData["add_node_data"] = 0;
    } else {
      console.log("add");
      const addNodeData = parseForm(selectedAddNode);
      updateData["add_node_data"] = addNodeData;
    }
    if (!selectedRemoveNode) {
      updateData["remove_node_data"] = 0;
    } else {
      const removeNodeData = parseForm(selectedRemoveNode);
      updateData["remove_node_data"] = removeNodeData;
    }
    if (!selectedTagNode) {
      updateData["tag_node_data"] = 0;
    } else {
      console.log("tag");
      const tagNodeData = parseForm(selectedTagNode);
      updateData["tag_node_data"] = tagNodeData;
      updateData["new_node_tag"] = newNodeTag;
    }
    updateData["zone_id"] = zoneId;

    console.log(updateData);

    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
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
      if (selectedAddNode) {
        await nodeRepo.updateNodeBySquareId(selectedAddNode, squareId, zoneId);
        await eventLogRepo.addEvent(
          "Node",
          "Updated",
          "node added to plot",
          greenhouseId,
          zoneId,
          squareId,
          selectedAddNode,
          null,
          null
        );
      }
      if (selectedRemoveNode) {
        const emptyPosition = [0, 0, 0];
        //pos,
        await nodeRepo.updateNodeByZnRelPos(emptyPosition, selectedRemoveNode);
        await eventLogRepo.addEvent(
          "Node",
          "Removed",
          "node unassigned",
          greenhouseId,
          zoneId,
          squareId,
          selectedRemoveNode,
          null,
          null
        );
      }
      if (selectedTagNode) {
        await nodeRepo.updateNodeTag(selectedTagNode, newNodeTag);
        await eventLogRepo.addEvent(
          "Node",
          "Updated",
          `node tag changed to ${newNodeTag}`,
          greenhouseId,
          zoneId,
          squareId,
          selectedTagNode,
          null,
          null
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default {
  updateNode,
};
