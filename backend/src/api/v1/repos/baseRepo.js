import { db_pool as db } from "../services/init/dbConnect.js";

export default class BaseRepo {
  constructor(tableName, parentName) {
    this.parentName = parentName;
    this.tableName = tableName;
  }

  async query(text, params) {
    try {
      const res = await db.query(text, params);
      const response = res.rowCount < 1 ? null : res.rows;
      return response;
    } catch (err) {
      throw err;
    }
  }

  async getAll() {
    const query = `SELECT * FROM ${this.tableName}`;
    return this.query(query);
  }

  async getById(parentId, id) {
    const idType = this.tableName.slice(0, -1);

    const query = `
        SELECT * FROM ${this.tableName}
        WHERE ${idType}_id = $1 ${
      this.parentName ? `AND ${this.parentName}_id = $2 ` : ""
    };`;
    const results = await this.query(
      query,
      this.parentName ? [id, parentId] : [id]
    );
    return results[0] ? results[0] : null;
  }

  async getAllByParentId(parentId) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.parentName}_id = $1`;
    return this.query(query, [parentId]);
  }

  static async validateParams(tableName, id) {
    const tableIdName = `${tableName.slice(0, -1)}_id`;
    const result = await db.query(
      `SELECT * FROM ${tableName} WHERE ${tableIdName} = $1`,
      [id]
    );

    return result.rows[0];
  }
}
