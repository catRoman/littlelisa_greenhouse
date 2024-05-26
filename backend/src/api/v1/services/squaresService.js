import squareRepo from "../repos/squareRepo.js";
import { format } from "date-fns";

const updateSquare = async (fields, squareId) => {
  const { plant_type, is_transplant, date_planted, date_expected_harvest } =
    fields;

  if (
    plant_type[0] === "" &&
    date_planted[0] === "" &&
    date_expected_harvest[0] === "" &&
    is_transplant[0] === ""
  ) {
    const updatedSquare = await squareRepo.updateById(
      null,
      false,
      null,
      null,
      squareId
    );

    return updatedSquare || null;
  } else {
    const formatedDatePlanted = format(date_planted[0], "yyyy-MM-dd HH:mm:ss");
    const formatedDateHarvest = format(
      date_expected_harvest[0],
      "yyyy-MM-dd HH:mm:ss"
    );
    console.log("hello tere");
    const updatedSquare = await squareRepo.updateById(
      plant_type[0],
      is_transplant[0],
      formatedDatePlanted,
      formatedDateHarvest,
      squareId
    );

    return updatedSquare || null;
  }
};

export default {
  updateSquare,
};
