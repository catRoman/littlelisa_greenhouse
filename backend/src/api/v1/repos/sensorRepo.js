import BaseRepo from "./baseRepo.js";
import fs from "fs/promises";
import path from "path";
import moment from "moment-timezone";
import {
  connectToDatabase,
  db_pool as db,
} from "../services/init/dbConnect.js";

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
          and sensor_id = $3
        GROUP BY grouping
        ORDER BY grouping;
        `,

        [grouping, interval, sensorId]
      );
    }

    const formattedData = query.map((row) => ({
      period: moment
        .tz(row.grouping, "UTC")
        .tz("America/Los_Angeles")
        .format("MMM DD, HH:mm"),

      avgTemp: parseFloat(parseFloat(row.avg_temp).toFixed(2)), // No need to parseFloat
      avgHumidity: parseFloat(parseFloat(row.avg_humidity).toFixed(2)), // No need to parseFloat
    }));

    return formattedData;
  }

  async getZoneChartData(zoneId, last, unit, grouped) {
    const sensorTypes = await this.query(
      `
      select distinct
        st.type_name as type
      from sensors s
      join sensor_types st on s.type_id = st.type_id
      join modules m on m.module_id = s.module_id
      where m.zone_id = $1;`,
      [zoneId]
    );
    const types = [];
    sensorTypes.forEach((type) => {
      //console.log(type.type);
      types.push(type.type);
    });

    const data = [];

    for (let i = 0; i < types.length; i++) {
      const grouping = `${grouped}`;
      const interval = `'${last} ${unit}'`;
      if (types[i] === "DHT22") {
        const query = await this.query(
          `
          SELECT
            DATE_TRUNC($1, timestamp ) AS grouping,
            AVG(temperature) AS dht22_avg_temp,
            avg(humidity) as dht22_avg_humidity
          FROM dht22_data d
          join sensors s on d.sensor_id = s.sensor_id
          join modules m on m.module_id = s.module_id
          WHERE timestamp >= now()  - $2::interval
            and m.zone_id = $3
          GROUP BY grouping
          ORDER BY grouping;
          `,

          [grouping, interval, zoneId]
        );
        const formattedData = query.map((row) => ({
          period: moment
            .tz(row.grouping, "UTC")
            .tz("America/Los_Angeles")
            .format("MMM DD, HH:mm"),

          dht22_avgTemp: parseFloat(parseFloat(row.dht22_avg_temp).toFixed(2)), // No need to parseFloat
          dht22_avgHumidity: parseFloat(
            parseFloat(row.dht22_avg_humidity).toFixed(2)
          ), // No need to parseFloat
        }));

        data.push(formattedData);
      }
    }

    //TODO: merge with other queries when i have another sensor hooked up for testing
    //pass back the merged data in one array
    return { types: types, data: data[0] };
  }

  async getGreenhouseChartData(greenhouseId, last, unit, grouped) {
    const sensorTypes = await this.query(
      `
      select distinct
        st.type_name as type
      from sensors s
      join sensor_types st on s.type_id = st.type_id
      join modules m on m.module_id = s.module_id
      where m.greenhouse_id = $1;`,
      [greenhouseId]
    );
    const types = [];

    sensorTypes.forEach((type) => {
      //console.log(type.type);
      types.push(type.type);
    });

    const data = [];

    for (let i = 0; i < types.length; i++) {
      const grouping = `${grouped}`;
      const interval = `'${last} ${unit}'`;
      if (types[i] === "DHT22") {
        const query = await this.query(
          `
          SELECT
            DATE_TRUNC($1, timestamp ) AS grouping,
            AVG(temperature) AS dht22_avg_temp,
            avg(humidity) as dht22_avg_humidity
          FROM dht22_data d
          join sensors s on d.sensor_id = s.sensor_id
          join modules m on m.module_id = s.module_id
          WHERE timestamp >= now()  - $2::interval
            and m.greenhouse_id = $3
          GROUP BY grouping
          ORDER BY grouping;
          `,

          [grouping, interval, greenhouseId]
        );
        const formattedData = query.map((row) => ({
          period: moment
            .tz(row.grouping, "UTC")
            .tz("America/Los_Angeles")
            .format("MMM DD, HH:mm"),

          dht22_avgTemp: parseFloat(parseFloat(row.dht22_avg_temp).toFixed(2)), // No need to parseFloat
          dht22_avgHumidity: parseFloat(
            parseFloat(row.dht22_avg_humidity).toFixed(2)
          ), // No need to parseFloat
        }));

        data.push(formattedData);
      }
    }

    //TODO: merge with other queries when i have another sensor hooked up for testing
    //pass back the merged data in one array
    return { types: types, data: data[0] };
  }
  async updateTag(sensor_id, tag) {
    const query = await this.query(
      `update sensors
      set
        location = $1
      where sensor_id = $2
      returning *`,
      [tag, sensor_id]
    );
  }

  async updateSensorBySquareId(sensor_id, square_id, zone_id) {
    const query = await this.query(
      `update sensors
      set
        zn_rel_pos_id = NULL,
        square_id = $1
        where sensor_id = $2
      returning *`,
      [square_id, sensor_id]
    );
    console.log(`zone_id: ${zone_id}`);
    console.log(`square_id: ${square_id}`);
    console.log(`module_id: ${sensor_id}`);

    return query[0] ? query[0] : null;
  }

  async updateSensorByZnRelPos(zn_rel_pos, sensor_id, zone_id) {
    try {
      await db.query("BEGIN");
      console.log(zn_rel_pos[0]);
      console.log(zn_rel_pos[1]);
      console.log(zn_rel_pos[2]);
      console.log(sensor_id);
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
      update sensors
      set
        square_id = null,
        zn_rel_pos_id = $1

        where sensor_id = $2
      returning *
      `,
        [zn_rel_pos_id, sensor_id]
      );

      const res = await db.query("commit");
    } catch (error) {
      await db.query("rollback");
      console.error("updated sensor by zn_rel_pos rolled back:", error);
    }
  }
}
export default new SensorRepo();
