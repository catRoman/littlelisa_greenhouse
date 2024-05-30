import eventLogsService from "../services/eventLogsService.js";




const getAllEventsByParentId = async (req, res) => {
  try {
    let parentIdName;
    let parentId;

    if (req.params.squareId) {
      parentIdName = "squares";
      parentId = req.params.squareId;
    } else if (req.params.zoneId) {
      parentIdName = "zones";
      parentId = req.params.zoneId;
    } else {
      parentIdName = "greenhouses";
      parentId = req.params.greenhouseId;
    }

    console.log(`get requested: ${req.originalUrl}`);
    const eventArr = await eventLogsService.getAllEventsByParentId(parentIdName, parentId);

    res.json(eventArr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export default {
    getAllEventsByParentId
};
