import zoneService from "../services/zoneService.js";

const getAllZones = async (req, res) => {
  try {
    const greenhouseId = req.parentId;

    const zones = await zoneService.getAllZones(userId);
    console.log(`/users/${userId}/Zones requested`);
    if (!zones) {
      res.status(404).json({
        error: `No zones found for greenhouse id:${greenhouseId} `,
      });
    } else {
      res.json(zones);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getZoneById = async (req, res) => {
  try {
    const userId = req.parentId;
    const zoneId = req.params.id;
    const zone = await zoneService.getZoneById(userId, zoneId);
    console.log(`/zones/${zoneId} requested`);
    if (!zone) {
      res.status(404).json({
        error: `No zone found for zone_id:${zoneId} for user ${userId}`,
      });
    } else {
      res.json(zone);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllZones,
  getZoneById,
};
