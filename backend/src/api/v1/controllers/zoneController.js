import zoneService from "../services/zoneService.js";

const getAllZones = async (req, res) => {
  try {
    const greenhouseId = req.params.greenhouseId;

    const zones = await zoneService.getAllZones(greenhouseId);
    console.log(`requested: ${req.originalUrl}`);

    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getZoneById = async (req, res) => {
  try {
    const greenhouseId = req.params.greenhouseId;
    const zoneId = req.params.zoneId;
    const zone = await zoneService.getZoneById(greenhouseId, zoneId);
    console.log(`requested: ${req.originalUrl}`);
    console.log(`greenhouse ${greenhouseId}`);

    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllZones,
  getZoneById,
};
