import eventLogRepo from "../repos/eventLogRepo.js";

const getAllEventsByParentId = async (parentNameId, parentId) => {
  const allNotes = await eventLogRepo.getAllByParentId(parentNameId, parentId);

  return allNotes || null;
};






export default {
    getAllEventsByParentId
};
