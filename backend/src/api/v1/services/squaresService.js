import squareRepo from "../repos/squareRepo.js";
import { format } from "date-fns";

const updateSquare = async (fields, squareId) => {
  const { plant_type, is_transplanted, date_planted, date_expected_harvest } =
    fields;

  const formatedDatePlanted = format(date_planted[0], "yyyy-MM-dd HH:mm:ss");
  const formatedDateHarvest = format(
    date_expected_harvest[0],
    "yyyy-MM-dd HH:mm:ss"
  );

  const updatedSquare = await squareRepo.updateById(
    plant_type[0],
    is_transplanted[0],
    formatedDatePlanted,
    formatedDateHarvest,
    squareId
  );

  return updatedSquare || null;
};

export default {
  updateSquare,
};
