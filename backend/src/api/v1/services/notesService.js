import noteRepo from "../repos/noteRepo.js";

const getCategoryNotes = async (userId, cat, catId) => {
  const allCategoryNotes = await noteRepo.getCategoryNotes(userId, cat, catId);

  return allCategoryNotes || null;
};

const getAllNotes = async (parentNameId, parentId) => {
  const allNotes = await noteRepo.getAllById(parentNameId, parentId);

  return allNotes || null;
};
const postNote = async (title, body, parentNameId, parentId, userId) => {
  const newNote = await noteRepo.postById(
    title,
    body,
    parentNameId,
    parentId,
    userId
  );

  return newNote || null;
};

const deleteNote = async (noteId) => {
  const deletedNote = await noteRepo.deleteNoteById(noteId);

  return deletedNote || null;
};

export default {
  getCategoryNotes,
  getAllNotes,
  postNote,
  deleteNote,
};
