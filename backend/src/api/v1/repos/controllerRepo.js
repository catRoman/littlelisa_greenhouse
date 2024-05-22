import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";
import { __dirname } from "../../../../config/globals.js";

class ControllerRepo extends BaseRepo {
  constructor() {
    super("greenhouses", "user");
  }
  async getAllGreenhouseControllersInfo(greenhouseId) {
    const query = async () => {
      try {
        const queryPath = path.join(
          __dirname,
          "queries",
          "/get_greenhouse_controller_info.sql"
        );
        const sqlQuery = await fs.readFile(queryPath);
        return sqlQuery.toString();
      } catch (error) {
        console.log("error reading sql query from file...");
        throw error;
      }
    };

    const results = await this.query(query, [greenhouseId]);
    return results;
  }
}
export default new ControllerRepo();
