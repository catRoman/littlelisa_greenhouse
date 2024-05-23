import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";

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
}
export default new NodeRepo();
