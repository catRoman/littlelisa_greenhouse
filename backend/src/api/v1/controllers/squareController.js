import squareService from "../services/squareService.js";
import utility from "./util/utility.js";

const updateSquare = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);
    const squareId = req.params.squareId;
    const { fields } = await utility.parseForm(req);

    if (
      !fields.plant_type ||
      !fields.is_transplant ||
      !fields.date_planted ||
      !fields.date_expected_harvest
    ) {
      return res
        .status(400)
        .json({ message: "Incomplete form data... missing some values" });
    }

    const updatedSquare = await squareService.updateSquare(
      fields,
      squareId,
      req.params.greenhouseId
    );

    res.json(updatedSquare);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

const emptyAll = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);

    const { fields } = await utility.parseForm(req);
    let emptyArea;
    if (!fields.greenhouse_id && !fields.zone_id) {
      return res
        .status(400)
        .json({ message: "Incomplete form data... missing some values" });
    } else if (fields.zone_id) {
      emptyArea = await squareService.emptyZone(
        req.params.zoneId,
        req.params.greenhouseId
      );
    } else if (!fields.zone_id) {
      emptyArea = await squareService.emptyGreenhouse(req.params.greenhouseId);
    }

    res.json(emptyArea);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

export default {
  updateSquare,
  emptyAll,
};
