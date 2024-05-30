import notesService from "../services/notesService.js";

import utility from "./util/utility.js";

const getCategoryNotes = async (req, res) => {
  try {
    if (req.query.cat) {
      const loc = req.query.cat;
    } else {
      throw new Error("need a category query");
    }

    const availableCat = ["greenhouse", "zone", "square"];
    let catId;
    if (!availableCat.includes(cat.toLower())) {
      throw new Error("nope no notes under that category");
    } else {
      if (cat.toLower() === "greenhouse") {
        catId = req.params.greenhouseId;
      } else if (cat.toLower() === "zone") {
        catId = req.params.zoneId;
      } else {
        catId = square_id;
      }
    }

    console.log(`get requested: ${req.originalUrl}`);
    const noteArr = await notesService.getCategoryNotes(
      req.params.userId,
      cat,
      catId
    );

    res.json(noteArr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllNotes = async (req, res) => {
  try {
    let parentIdName;
    let parentId;

    if (req.params.squareId) {
      parentIdName = "squares";
      parentId = req.params.squareId;
    } else if (req.params.zoneId) {
      parentIdName = "zones";
      parentId = req.params.zoneId;
    } else {
      parentIdName = "greenhouses";
      parentId = req.params.greenhouseId;
    }

    console.log(`get requested: ${req.originalUrl}`);
    const noteArr = await notesService.getAllNotes(parentIdName, parentId);

    res.json(noteArr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postNote = async (req, res) => {
  try {
    const { fields } = await utility.parseForm(req);
    const { title, body } = fields;

    console.log(`post requested: ${req.originalUrl}`);
    console.log(`greenid: ${req.params.greenhouseId}` )
    let parentIdName;
    let parentId;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    if (req.params.squareId) {
      parentIdName = "squares";
      parentId = req.params.squareId;
    } else if (req.params.zoneId) {
      parentIdName = "zones";
      parentId = req.params.zoneId;
    } else {
      parentIdName = "greenhouses";
      parentId = req.params.greenhouseId;
    }


    const newNote = await notesService.postNote(
      title[0],
      body[0],
      parentIdName,
      parentId,
      req.params.userId,
      req.params.greenhouseId,

    );

    res.json(newNote);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const removeNote = async (req, res) => {
  try {
    console.log(`delete requested:  ${req.originalUrl}`);
    console.log(`greenid: ${req.params.greenhouseId}` )
    const deletedNote = await notesService.deleteNote(
      req.params.noteId,
      req.params.greenhouseId,
    );

    res.json(deletedNote);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAllNotes = async (req, res) => {
  let parentIdName;
  let parentId;
  try {
    console.log(`delete requested:  ${req.originalUrl}`);
    let allDeletedNotes;
    if (req.params.squareId) {
      parentIdName = "squares";
      parentId = req.params.squareId;
       allDeletedNotes = await notesService.deleteAll(
        parentIdName,
        parentId,
        req.params.greenhouseId,
        null,
        req.params.squareId,
      );
    } else if (req.params.zoneId) {
      parentIdName = "zones";
      parentId = req.params.zoneId;
       allDeletedNotes = await notesService.deleteAll(
        parentIdName,
        parentId,
        req.params.greenhouseId,
        req.params.zoneId,
        null,
      );
    } else {
      parentIdName = "greenhouses";
      parentId = req.params.greenhouseId;
       allDeletedNotes = await notesService.deleteAll(
        parentIdName,
        parentId,
        req.params.greenhouseId,
        null,
        null,
      );
    }




    res.json(allDeletedNotes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  getCategoryNotes,
  getAllNotes,
  postNote,
  removeNote,
  deleteAllNotes,
};
