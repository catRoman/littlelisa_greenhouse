import zonesRepo from "../repos/zoneRepo.js";

const getAllZones = async (greenhouseId) => {
  const zones = await zonesRepo.getAllByParentId(greenhouseId);
  return zones || null;
};

const getZoneById = async (greenhouseId, zoneId) => {
  const zone = await zonesRepo.getById(greenhouseId, zoneId);
  return zone || null;
};

export default {
  getAllZones,
  getZoneById,
};
