import zonesRepo from "../repos/zoneRepo.js";

const getAllZones = async (userId) => {
  const zones = await zonesRepo.getAllByParentId(userId);
  return zones || null;
};

const getZoneById = async (userId, zoneId) => {
  const zone = await zonesRepo.getById(userId, zoneId);
  return zone || null;
};

export default {
  getAllZones,
  getZoneById,
};
