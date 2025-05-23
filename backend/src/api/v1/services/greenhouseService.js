import GreenHousesRepo from "../repos/greenhouseRepo.js";
import ControllersRepo from "../repos/controllerRepo.js";
import SensorRepo from "../repos/sensorRepo.js";
import zoneService from "../services/zoneService.js";
import squareRepo from "../repos/squareRepo.js";
import eventLogRepo from "../repos/eventLogRepo.js";

const getAllGreenhouses = async (userId) => {
  const greenhouses = await GreenHousesRepo.getAllByParentId(userId);
  return greenhouses || null;
};

const getGreenhouseById = async (userId, greenhouseId) => {
  const greenhouse = await GreenHousesRepo.getByParentId(userId, greenhouseId);
  //aggregates
  const total_zones = await GreenHousesRepo.getTotalZones(greenhouseId);
  const total_controllers = await GreenHousesRepo.getTotalControllers(
    greenhouseId
  );
  const total_nodes = await GreenHousesRepo.getTotalNodes(greenhouseId);
  const total_sensors = await SensorRepo.countForGreenhouse(greenhouseId);
  //controller info
  let controllers = await ControllersRepo.getAllGreenhouseControllersInfo(
    greenhouseId
  );

  greenhouse.lat = Number(greenhouse.lat);
  greenhouse.long = Number(greenhouse.long);

  //json formatin
  //dimensions
  const x_length = greenhouse.x_length;
  const y_length = greenhouse.y_length;
  const z_length = greenhouse.z_length;
  delete greenhouse.x_length;
  delete greenhouse.y_length;
  delete greenhouse.z_length;

  //zn_rel_pos
  controllers = controllers.map((controller) => {
    if (controller.square_id === null) {
      if (
        !controller.zrp_x_pos ||
        !controller.zrp_y_pos ||
        !controller.zrp_z_pos
      ) {
        controller.zrp_x_pos = -1;
        controller.zrp_y_pos = -1;
        controller.zrp_z_pos = -1;
      }
    } else {
      if (!controller.s_x_pos || !controller.s_y_pos) {
        controller.square_id = null;
        controller.zrp_x_pos = -1;
        controller.zrp_y_pos = -1;
        controller.zrp_z_pos = -1;
      }
    }

    if (controller.zrp_x_pos) {
      const x_pos = controller.zrp_x_pos;
      const y_pos = controller.zrp_y_pos;
      const z_pos = controller.zrp_z_pos;
      delete controller.zrp_x_pos;
      delete controller.zrp_y_pos;
      delete controller.zrp_z_pos;
      delete controller.s_x_pos;
      delete controller.s_y_pos;

      const zn_rel_pos = {
        x: x_pos,
        y: y_pos,
        z: z_pos,
      };
      return { ...controller, zn_rel_pos };
    } else {
      delete controller.zrp_x_pos;
      delete controller.zrp_y_pos;
      delete controller.zrp_z_pos;
      const x_pos = controller.s_x_pos;
      const y_pos = controller.s_y_pos;
      delete controller.s_x_pos;
      delete controller.s_y_pos;

      const square_pos = {
        x: x_pos,
        y: y_pos,
      };
      return { ...controller, square_pos };
    }
  });

  const dimensions = {
    x: x_length,
    y: y_length,
    z: z_length,
  };

  const total = {
    ...total_zones,
    ...total_controllers,
    ...total_nodes,
    ...total_sensors,
  };

  return (
    {
      ...greenhouse,
      dimensions,
      total,
      controllers,
    } || null
  );
};

const getFlatGreenhouseData = async (userId, greenhouseId) => {
  const greenhouse = await getGreenhouseById(userId, greenhouseId);
  const numZones = greenhouse.total.zones;
  const zones = [];

  for (let i = 1; i <= numZones; i++) {
    const tempObj = await zoneService.getZoneById(greenhouseId, i);
    zones.push(tempObj);
  }
  const squares = await squareRepo.getAllGreenhouseSquares(greenhouseId);

  return { ...greenhouse, zones, squares } || null;
};

const updateInfo = async (fields, greenhouseId) => {
  const { lat, long, style, location } = fields;

  //emptied plot

  const updatedGreenhouse = await GreenHousesRepo.updateGreenhouseInfo(
    lat[0],
    long[0],
    location[0],
    style[0],
    greenhouseId
  );

  if (updatedGreenhouse) {
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
      "Greenhouse",
      `Updated`,
      `greenhouse information updated`,
      greenhouseId,
      null,
      null,
      null,
      null,
      null
    );
  }

  return updatedGreenhouse || null;
};

export default {
  updateInfo,
  getAllGreenhouses,
  getGreenhouseById,
  getFlatGreenhouseData,
};
