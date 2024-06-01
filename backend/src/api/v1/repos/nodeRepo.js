import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";
import {
  connectToDatabase,
  db_pool as db,
} from "../services/init/dbConnect.js";

class NodeRepo extends BaseRepo {
  constructor() {
    super("nodes", "controller");
  }
  async getAllZoneNodeInfo(zoneId) {
    const query = async () => {
      try {
        const queryPath = path.join(
          global.__basedir,
          "/src/api/v1/repos/queries",
          "/get_zone_node_info.sql"
        );
        const sqlQuery = await fs.readFile(queryPath);
        return sqlQuery.toString();
      } catch (error) {
        console.log("error reading sql query from file...");
        throw error;
      }
    };
    const sqlQuery = await query();
    const results = await this.query(sqlQuery, [zoneId]);
    return results;
  }
  async updateNodeTag(module_id, tag) {
    const query = await this.query(
      `update modules 
        set
          location = $1,
          where module_id = $2
        returning *`,
      [tag, module_id]
    );

    return query[0] ? query[0] : null;
  }

  async updateNodeByZnRelPos(zn_rel_pos, module_id, zone_id) {
    connectToDatabase();
    try {
      await db.query("BEGIN");

      const res1 = await db.query(
        `
      insert into zn_rel_pos 
      set x_pos = $1, y_pos = $2, z_pos = $3 
      returning *`,
        [zn_rel_pos[0], zn_rel_pos[1], zn_rel_pos[2]]
      );

      const zn_rel_pos_id = res1.rows[0].id;

      await db.query(
        `
      update squares
      set
        square_pos = null,
        zn_rel_pos_id = $1,
        zone_id = $2
        where module_id = $3
      returning *
      `,
        [zn_rel_pos_id, zone_id, module_id]
      );

      const res = await db.query("commit");
    } catch (error) {
      await db.query("rollback");
      console.error("updated module by zn_rel_pos rolled back:", error);
    } finally {
      db.release();
    }
  }

  async updateNodeBySquareId(square_id, zone_id, module_id) {
    const query = await this.query(
      `update modules
      set
        zn_rel_pos_id = null,
        square_id = $1,
        zone_id = $2
        where module_id = $3
      returning *`,
      [square_id, zone_id, module_id]
    );

    return query[0] ? query[0] : null;
  }
}
export default new NodeRepo();
