import noteRepo from "../repos/noteRepo.js";

const getCategoryNotes = async (userId, cat, catId) => {
  const allCategoryNotes = await noteRepo.getCategoryNotes(userId, cat, catId);

  return allCategoryNotes || null;
};

const getAllNotes = async (parentNameId, parentId) => {
  const allNotes = await noteRepo.getAllById(parentNameId, parentId);

  return allNotes || null;
};

export default {
  getCategoryNotes,
  getAllNotes,
};
