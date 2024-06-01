import nodeService from "../services/nodeService.js";
import fetch from "node-fetch";

const updateNode = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);

    const { fields } = await utility.parseForm(req);
    const { add_node_id, remove_node_id, new_tag, new_tag_id } = fields;

    if (!selectedAddNode && !selectedRemoveNode && !newNodeTag) {
      return res.status(400).json({ error: "No fields submitted" });
    }

    const updatedNodeStatus = await nodeService.updateNode(
      add_node_id,
      remove_node_id,
      new_tag_id,
      new_tag,
      req.params.zoneId,
      req.params.squareId
    );

    res.json(updatedNodeStatus);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export default {
  updateNode,
};
