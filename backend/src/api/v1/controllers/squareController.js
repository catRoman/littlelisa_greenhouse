import squaresService from "../services/squaresService.js";
import utility from "./util/utility.js";

const updateSquare = async (req, res) => {
  try {
    console.log(`requested: ${req.originalUrl}`);
    const squareId = req.params.squareId;
    const { fields } = await utility.parseForm(req);
    const { plant_type } = fields;
    console.log(plant_type);
    if (
      !fields.plant_type ||
      !fields.is_transplanted ||
      !fields.date_planted ||
      !fields.date_expected_harvest
    ) {
      return res
        .status(400)
        .json({ message: "Incomplete form data... missing some values" });
    }

    const updatedSquare = await squaresService.updateSquare(fields, squareId);

    res.json(updatedSquare);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};
export default {
  updateSquare,
};
