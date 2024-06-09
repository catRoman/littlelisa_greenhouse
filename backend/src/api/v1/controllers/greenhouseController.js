import greenhouseService from "../services/greenhouseService.js";
import utility from "./util/utility.js";
const getAllGreenhouses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const greenhouses = await greenhouseService.getAllGreenhouses(userId);
    console.log(`requested: ${req.originalUrl}`);

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
    console.log(`requested: ${req.originalUrl}`);

    res.json(greenhouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFlatGreenhouseData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const greenhouseId = req.params.greenhouseId;
    const greenhouse = await greenhouseService.getFlatGreenhouseData(
      userId,
      greenhouseId
    );
    console.log(`requested: ${req.originalUrl}`);

    res.json(greenhouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateInfo = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);
    const greenhouseId = req.params.greenhouseId;
    const { fields } = await utility.parseForm(req);

    if (!fields.lat || !fields.long || !fields.style || !fields.location) {
      return res
        .status(400)
        .json({ message: "Incomplete form data... missing some values" });
    }

    const updatedInfo = await greenhouseService.updateInfo(
      fields,
      greenhouseId
    );

    res.json(updatedInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};
export default {
  updateInfo,
  getAllGreenhouses,
  getGreenhouseById,
  getFlatGreenhouseData,
};
