import BaseRepo from "./baseRepo.js";

class NotesRepo extends BaseRepo {
  constructor() {
    super("notes", "user");
  }

  async getCategoryNotes(userId, cat, catId) {
    const categoryIdName = `${cat}_id`;

    const query = await this.query(
      `
      select note_id, created_at, title, note from notes where user_id = $1 and $2 = $3;
        `,

      [userId, categoryIdName, catId]
    );
  }

  async getAllById(parentNameId, parentId) {
    const idType = parentNameId.slice(0, -1);

    const query = `
        SELECT * FROM ${this.tableName}
        WHERE ${idType}_id = $1 order by created_at desc `;
    const results = await this.query(query, [parentId]);

    return results ? results : null;
  }
  async postById(title, body, parentNameId, parentId, userId) {
    const idType = parentNameId.slice(0, -1);

    const query = `

        insert into ${this.tableName}
        (title, note, ${idType}_id, user_id )
        values($1, $2, $3, $4)
        returning *;


        `;

    const newNote = await this.query(query, [title, body, parentId, userId]);

    return newNote[0] ? newNote[0] : null;
  }

  async deleteNoteById(noteId) {
    const deletedNote = await this.query(
      `
    Delete from notes where note_id = $1 returning *
    `,
      [noteId]
    );

    return deletedNote[0] ? deletedNote[0] : null;
  }
  async deleteAllById(parentIdName, parentId) {
    const idType = parentIdName.slice(0, -1);

    const query = `
        delete from notes
        where ${idType}_id = $1 returning *`;
    const results = await this.query(query, [parentId]);

    return results ? results : null;
  }
}
export default new NotesRepo();
