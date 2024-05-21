import greenhouseService from "../services/greenhouseService.js";

const getAllGreenhouses = async (req, res) => {
  try {
    const userId = req.parentId;
    const greenhouses = await greenhouseService.getAllGreenhouses(userId);
    console.log(`/users/${userId}/greenhouses requested`);
    if (!greenhouses) {
      res
        .status(404)
        .json({ error: `No greenhouses found for user_id:${userId}` });
    } else {
      res.json(greenhouses);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGreenhouseById = async (req, res) => {
  try {
    const userId = req.parentId;
    const greenhouseId = req.params.id;
    const greenhouse = await greenhouseService.getGreenhouseById(
      userId,
      greenhouseId
    );
    console.log(`/greenhouse/${greenhouseId} requested`);
    if (!greenhouse) {
      res.status(404).json({
        error: `No greenhouses found for greenhouse_id:${greenhouseId} for user ${userId}`,
      });
    } else {
      res.json(greenhouse);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllGreenhouses,
  getGreenhouseById,
};
