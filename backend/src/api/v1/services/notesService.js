import eventLogRepo from "../repos/eventLogRepo.js";
import noteRepo from "../repos/noteRepo.js";

const getCategoryNotes = async (userId, cat, catId) => {
  const allCategoryNotes = await noteRepo.getCategoryNotes(userId, cat, catId);

  return allCategoryNotes || null;
};

const getAllNotes = async (parentNameId, parentId) => {
  const allNotes = await noteRepo.getAllById(parentNameId, parentId);

  return allNotes || null;
};
const postNote = async (
  title,
  body,
  parentNameId,
  parentId,
  userId,
  greenhouseId
) => {
  const newNote = await noteRepo.postById(
    title,
    body,
    parentNameId,
    parentId,
    userId,
    greenhouseId
  );

  if (newNote) {
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
      "Note",
      `Added`,
      `added title: ${title}`,
      greenhouseId,
      newNote.zone_id ? newNote.zone_id : null,
      newNote.square_id ? newNote.square_id : null,
      null,
      null,
      newNote.node_id
    );
  }

  return newNote || null;
};

const deleteNote = async (noteId) => {
  const noteToDelete = await noteRepo.getById(noteId);

  const deletedNote = await noteRepo.deleteNoteById(noteId);
  console.log(greenhouseId);
  if (deletedNote) {
    await eventLogRepo.addEvent(
      "Note",
      `Deleted`,
      `deleted title:${noteToDelete.title}`,
      greenhouseId,
      noteToDelete.zone_id ? noteToDelete.zone_id : null,
      noteToDelete.square_id ? noteToDelete.square_id : null,
      null,
      null,
      null
    );
  }

  return deletedNote || null;
};

const deleteAll = async (
  parentIdName,
  parentId,
  greenhouseId,
  zoneId,
  squareId
) => {
  const allDeletedNotes = await noteRepo.deleteAllById(parentIdName, parentId);

  if (allDeletedNotes) {
    await eventLogRepo.addEvent(
      "Note",
      `Deleted All `,
      ``,
      greenhouseId,
      zoneId ? zoneId : null,
      squareId ? squareId : null,
      null,
      null,
      null
    );
  }

  return allDeletedNotes || null;
};

export default {
  getCategoryNotes,
  getAllNotes,
  postNote,
  deleteAll,
  deleteNote,
};
