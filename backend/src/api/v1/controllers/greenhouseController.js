import greenhouseService from "../services/greenhouseService.js";

const getAllGreenhouses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const greenhouses = await greenhouseService.getAllGreenhouses(userId);
    console.log(`/users/${userId}/greenhouses requested`);

    res.json(greenhouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGreenhouseById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const greenhouseId = req.params.greenhouseId;
    const greenhouse = await greenhouseService.getGreenhouseById(
      userId,
      greenhouseId
    );
    console.log(`/greenhouses/${greenhouseId} requested`);

    res.json(greenhouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllGreenhouses,
  getGreenhouseById,
};
