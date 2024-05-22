import GreenHousesRepo from "../repos/greenhouseRepo.js";
import ControllersRepo from "../repos/controllerRepo.js";

const getAllGreenhouses = async (userId) => {
  const greenhouses = await GreenHousesRepo.getAllByParentId(userId);
  return greenhouses || null;
};

const getGreenhouseById = async (userId, greenhouseId) => {
  const greenhouse = await GreenHousesRepo.getById(userId, greenhouseId);
  //aggregates
  const total_zones = await GreenHousesRepo.getTotalZones(greenhouseId);
  const total_controllers = await GreenHousesRepo.getTotalControllers(
    greenhouseId
  );
  const total_nodes = await GreenHousesRepo.getTotalNodes(greenhouseId);
  const total_sensors = await GreenHousesRepo.getTotalSensors(greenhouseId);
  //controller info
  const controllers = await ControllersRepo.getAllGreenhouseControllersInfo(
    greenhouseId
  );

  //json formatin
  const x_length = greenhouse.x_length;
  const y_length = greenhouse.y_length;
  const z_length = greenhouse.z_length;
  delete greenhouse.x_length;
  delete greenhouse.y_length;
  delete greenhouse.z_length;

  const dimensions = {
    dimensions: {
      x: x_length,
      y: y_length,
      z: z_length,
    },
  };

  const totals = {
    total: {
      ...total_zones,
      ...total_controllers,
      ...total_nodes,
      ...total_sensors,
      ...controllers,
    },
  };

  return (
    {
      ...greenhouse,
      ...dimensions,
      ...totals,
    } || null
  );
};

export default {
  getAllGreenhouses,
  getGreenhouseById,
};
