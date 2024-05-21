import GreenHousesRepo from "../repos/greenhouseRepo.js";

const getAllGreenhouses = async (userId) => {
  const greenhouses = await GreenHousesRepo.getAllByParentId(userId);
  return greenhouses || null;
};

const getGreenhouseById = async (userId, greenhouseId) => {
  const greenhouse = await GreenHousesRepo.getById(userId, greenhouseId);
  return greenhouse || null;
};

export default {
  getAllGreenhouses,
  getGreenhouseById,
};
