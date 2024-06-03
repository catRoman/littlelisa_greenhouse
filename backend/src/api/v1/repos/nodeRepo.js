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
          location = $1
        where module_id = $2
        returning *`,
      [tag, module_id]
    );

    return query[0] ? query[0] : null;
  }

  async updateNodeByZnRelPos(zn_rel_pos, module_id, zone_id) {
    try {
      await db.query("BEGIN");
      console.log(zn_rel_pos[0]);
      console.log(zn_rel_pos[1]);
      console.log(zn_rel_pos[2]);
      console.log(module_id);
      console.log(zone_id);
      const res1 = await db.query(
        `
        WITH existing_row AS (
            SELECT zn_rel_pos_id
            FROM zn_rel_pos
            WHERE zone_id = $1 AND x_pos = $2 AND y_pos = $3 AND z_pos = $4
        ),
        inserted_row AS (
            INSERT INTO zn_rel_pos(zone_id, x_pos, y_pos, z_pos)
            SELECT $1, $2, $3, $4
            WHERE NOT EXISTS (SELECT 1 FROM existing_row)
            RETURNING zn_rel_pos_id
        )
        SELECT zn_rel_pos_id
        FROM inserted_row
        UNION ALL
        SELECT zn_rel_pos_id
        FROM existing_row;
      `,
        [zone_id, zn_rel_pos[0], zn_rel_pos[1], zn_rel_pos[2]]
      );

      const zn_rel_pos_id = res1.rows[0].zn_rel_pos_id;
      console.log(`znrel_pos_id: ${zn_rel_pos_id}`);

      await db.query(
        `
      update modules
      set
        square_id = null,
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
    }
  }

  async updateNodeBySquareId(module_id, square_id, zone_id) {
    const query = await this.query(
      `update modules
      set
        zn_rel_pos_id = NULL,
        square_id = $1,
        zone_id = $2
        where module_id = $3
      returning *`,
      [square_id, zone_id, module_id]
    );
    console.log(`zone_id: ${zone_id}`);
    console.log(`square_id: ${square_id}`);
    console.log(`module_id: ${module_id}`);

    return query[0] ? query[0] : null;
  }
}
export default new NodeRepo();
