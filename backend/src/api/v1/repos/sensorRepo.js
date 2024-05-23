import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";

class SensorRepo extends BaseRepo {
  constructor() {
    super("sensors", "module");
  }
  async countForZone(zoneId) {
    const query = await this.query(
      `
    select count(s.sensor_id)
      from sensors s
    join modules m
      on m.module_id = s.module_id
    where m.zone_id = $1
    `,
      [zoneId]
    );
    query[0].count = Number(query[0].count);
    return query[0];
  }
  async countForGreenhouse(greenhouseId) {
    const query = `
    select count(s.module_id) as sensors
      from sensors s
    join modules m
      on m.module_id = s.module_id
    where m.greenhouse_id = $1;`;
    const results = await this.query(query, [greenhouseId]);
    results[0].count = Number(results[0].count);
    return results[0];
  }

  async getAllZoneSensorInfo(zoneId) {
    const query = async () => {
      try {
        const queryPath = path.join(
          global.__basedir,
          "/src/api/v1/repos/queries",
          "/get_zone_sensor_info.sql"
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
export default new SensorRepo();
