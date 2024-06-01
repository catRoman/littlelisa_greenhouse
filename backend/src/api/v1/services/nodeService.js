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

    if (selectedAddNode == "") {
      updateData["add_node_id"] = 0;
    } else {
      updateData["add_node_id"] = selectedAddNode;
    }
    if (selectedAddNode == "") {
      updateData["remove_node_id"] = 0;
    } else {
      updateData["remove_node_id"] = selectedRemoveNode;
    }
    if (selectedTagNode == "") {
      updateData["tag_node_id"] = 0;
    } else {
      updateData["tag_node_id"] = selectedTagNode;
      updateData["new_node_tag"] = newNodeTag;
    }
    updateData["zone_id"] = zoneId;

    const proxyControllerPut = async () => {
      try {
        const response = await fetch("http://10.0.0.86/api/updateNode", {
          method: "PUT",
          body: JSON.stringify(updateData),
        });
        const result = await response.json();
        console.log(result);
        if (response.ok) {
          console.log("proxyied response is deadly");
        }
        return result;
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
    res.json(proxiedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  updateNode,
};
