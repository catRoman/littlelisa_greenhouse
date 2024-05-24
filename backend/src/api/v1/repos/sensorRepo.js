import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";
import moment from "moment-timezone";

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
  async getChartData(sensorId, last, unit, grouped) {
    const typeCheck = await this.query(
      `select st.type_name from sensors s join sensor_types st on s.type_id = st.type_id where s.sensor_id=$1`,
      [sensorId]
    );
    console.log(typeCheck);
    let query;
    const grouping = `${grouped}`;
    const interval = `'${last} ${unit}'`;
    if (typeCheck[0].type_name === "DHT22") {
      query = await this.query(
        `
        SELECT
          DATE_TRUNC($1, timestamp ) AS grouping,
          AVG(temperature) AS avg_temp,
          avg(humidity) as avg_humidity
        FROM dht22_data
        WHERE timestamp >= now()  - $2::interval
        GROUP BY grouping
        ORDER BY grouping;
        `,

        [grouping, interval]
      );
    }

    const formattedData = query.map((row) => ({
      period: moment
        .tz(row.grouping, "UTC")
        .tz("America/Los_Angeles")
        .format("MMM DD, YYYY HH:mm"),
      avgTemp: parseFloat(parseFloat(row.avg_temp).toFixed(2)), // No need to parseFloat
      avgHumidity: parseFloat(parseFloat(row.avg_humidity).toFixed(2)), // No need to parseFloat
    }));

    return formattedData;
  }
}
export default new SensorRepo();
