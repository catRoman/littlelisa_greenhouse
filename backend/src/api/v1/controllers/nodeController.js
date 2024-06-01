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

    console.log(add_node_id[0]);
    console.log(remove_node_id[0]);
    console.log(new_tag_id[0]);
    console.log(new_tag[0]);

    const updatedNodeStatus = await nodeService.updateNode(
      add_node_id[0],
      remove_node_id[0],
      new_tag_id[0],
      new_tag[0],
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
