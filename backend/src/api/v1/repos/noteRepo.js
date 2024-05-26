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
        WHERE ${idType}_id = $1 `;
    const results = await this.query(query, [parentId]);

    return results ? results : null;
  }
}
export default new NotesRepo();
