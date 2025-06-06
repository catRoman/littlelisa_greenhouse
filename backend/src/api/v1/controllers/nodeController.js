import nodeService from "../services/nodeService.js";
import fetch from "node-fetch";
import utility from "./util/utility.js";

const updateNode = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);

    const { fields } = await utility.parseForm(req);
    const { add_node_id, remove_node_id, new_tag, new_tag_id } = fields;

    if (!add_node_id && !remove_node_id && !new_tag_id) {
      return res.status(400).json({ error: "No fields submitted" });
    }
    let response = [];
    //type, selectedNode, zoneId, squareId
    if (add_node_id[0]) {
      response.push(
        await nodeService.updateNodePos(
          "add",
          add_node_id[0],
          req.params.zoneId,
          req.params.squareId,
          req.params.greenhouseId
        )
      );
    }
    if (remove_node_id[0]) {
      response.push(
        await nodeService.updateNodePos(
          "remove",
          remove_node_id[0],
          req.params.zoneId,
          req.params.squareId,
          req.params.greenhouseId
        )
      );
    }
    //selectedNode, newNodeTag, zoneId, squareId
    if (new_tag_id[0]) {
      response.push(
        await nodeService.updateNodeTag(
          new_tag_id[0],
          new_tag[0],
          req.params.greenhouseId,
          req.params.zoneId,
          req.params.squareId
        )
      );
    }

    const [addResponse, removeResponse, updateResponse] = await Promise.all(
      response
    );

    const combinedResponse = {
      addedNode: addResponse,
      removedNode: removeResponse,
      updatedNode: updateResponse,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateController = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);

    const { fields } = await utility.parseForm(req);
    const { x_pos, y_pos, z_pos, new_tag } = fields;

    if (!(x_pos && y_pos && z_pos) && !new_tag) {
      return res.status(400).json({ error: "No fields submitted" });
    }
    let response = [];
    //type, selectedNode, zoneId, squareId

    if (x_pos[0] && y_pos[0] && z_pos[0]) {
      response.push(
        await nodeService.updateControllerPos(
          [x_pos[0], y_pos[0], z_pos[0]],
          req.params.controllerId,
          req.params.greenhouseId
        )
      );
    }
    //selectedNode, newNodeTag, zoneId, squareId
    if (new_tag[0]) {
      response.push(
        await nodeService.updateControllerTag(
          new_tag[0],
          req.params.controllerId,
          req.params.greenhouseId
        )
      );
    }

    const [posResponse, tagResponse] = await Promise.all(response);

    const combinedResponse = {
      updatedController: posResponse,
      updatedControllerTag: tagResponse,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  updateNode,
  updateController,
};
