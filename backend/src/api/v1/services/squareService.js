import squareRepo from "../repos/squareRepo.js";
import { format } from "date-fns";
import eventLogRepo from "../repos/eventLogRepo.js";

const updateSquare = async (fields, squareId, greenhouseId) => {
  const { plant_type, is_transplant, date_planted, date_expected_harvest } =
    fields;

  //emptied plot
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

    if (updateSquare) {
      //PARAMS:
      // eventType,
      // eventAction,
      // details,
      // greenhouseId,
      // zoneId,
      // squareId,
      // moduleId,
      // sensorId,
      // note_id
      await eventLogRepo.addEvent(
        "Plot",
        `Cleared`,
        `Cleared Plot information `,
        greenhouseId,
        null,
        squareId,
        null,
        null,
        null
      );
    }

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

    if (updateSquare) {
      //PARAMS:
      // eventType,
      // eventAction,
      // details,
      // greenhouseId,
      // zoneId,
      // squareId,
      // moduleId,
      // sensorId,
      // note_id
      await eventLogRepo.addEvent(
        "Plot",
        `Updated`,
        `plot information updated`,
        greenhouseId,
        null,
        squareId,
        null,
        null,
        null
      );
    }

    return updatedSquare || null;
  }
};

const getAllGreenhouseSqaures = async (greenouseId) => {
  return squares || null;
};

const emptyGreenhouse = async (greenhouseId) => {
  //emptied plot

  const emptyGreenhouse = await squareRepo.emptyGreenhouse(greenhouseId);

  if (emptyGreenhouse) {
    //PARAMS:
    // eventType,
    // eventAction,
    // details,
    // greenhouseId,
    // zoneId,
    // squareId,
    // moduleId,
    // sensorId,
    // note_id
    await eventLogRepo.addEvent(
      "Plot",
      `Cleared All`,
      `Cleared Plot information `,
      greenhouseId,
      null,
      null,
      null,
      null,
      null
    );
  }

  return emptyGreenhouse || null;
};

const emptyZone = async (zoneId, greenhouseId) => {
  //emptied plot

  const emptyZone = await squareRepo.emptyZone(zoneId);

  if (emptyZone) {
    //PARAMS:
    // eventType,
    // eventAction,
    // details,
    // greenhouseId,
    // zoneId,
    // squareId,
    // moduleId,
    // sensorId,
    // note_id
    await eventLogRepo.addEvent(
      `Plot`,
      `Cleared All`,
      `Cleared Plot information `,
      greenhouseId,
      zoneId,
      null,
      null,
      null,
      null
    );
  }

  return emptyZone || null;
};

export default {
  updateSquare,
  getAllGreenhouseSqaures,
  emptyGreenhouse,
  emptyZone,
};
