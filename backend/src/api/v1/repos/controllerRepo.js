import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";

class ControllerRepo extends BaseRepo {
  constructor() {
    super("controllers", "module");
  }
  async getAllGreenhouseControllersInfo(greenhouseId) {
    const query = async () => {
      try {
        const queryPath = path.join(
          global.__basedir,
          "/src/api/v1/repos/queries",
          "/get_greenhouse_controller_info.sql"
        );
        const sqlQuery = await fs.readFile(queryPath);
        return sqlQuery.toString();
      } catch (error) {
        console.log("error reading sql query from file...");
        throw error;
      }
    };
    const sqlQuery = await query();
    const results = await this.query(sqlQuery, [greenhouseId]);
    return results;
  }
}
export default new ControllerRepo();
