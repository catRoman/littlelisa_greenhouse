import pg from "pg";
const { Pool } = pg;

const { Client } = pg;

export const db_pool = new Pool({
  host: "10.0.0.204",
  port: 5432,
  database: "little_lisa_proto",
  user: "little_lisa",
  password: "littleLisa",
});

db_pool.on("notice", (notice) => {
  console.log("Notice from little_lisa_proto:", notice.message);
});

export function connectToDatabase() {
  console.log("Hello there");
}

export async function handleSensorData(sensorData) {
  try {
    const result = await db_pool.query("SELECT add_sensor_data($1)", [
      JSON.stringify(sensorData),
    ]);
  } catch (error) {
    console.log("uhuhuh there was an error", error);
  }
}
