
import { db_pool } from '../init/dbConnect.js';

export async function handleSensorData(sensorData) {
  try {
    const result = await db_pool.query("SELECT add_sensor_data($1)", [
      JSON.stringify(sensorData),
    ]);
  } catch (error) {
    console.log("uhuhuh there was an error", error);
  }
}


