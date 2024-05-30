import eventLogRepo from "../repos/eventLogRepo.js";

const getAllEventsByParentId = async (parentNameId, parentId, greenhouseId) => {
  const allLogs = await eventLogRepo.getAllByParentId(parentNameId, parentId, greenhouseId);

  return allLogs || null;
};






export default {
    getAllEventsByParentId
};
