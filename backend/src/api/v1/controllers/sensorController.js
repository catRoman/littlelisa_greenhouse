import { handleSensorData } from "../services/pg_db.js";
import sensorService from "../services/sensorService.js";

const sensorDataStream = async (req, res) => {
  try {
    const sensorData = req.body;
    // debug logging incoming sensor data

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error("No data received in sensor stream post");
    }
    console.log(sensorData);
    handleSensorData(sensorData);

    res.status(200).send("Sensor stream post successful");
  } catch (error) {
    console.log("There was an error with /api/sensorStream ->", error);

    res
      .status(500)
      .send("Error processing sensor stream post: " + error.message);
  }
};
const getChartData = async (req, res) => {
  try {
    const last = parseInt(req.query.last, 10);
    const unit = req.query.units;
    const grouped = req.query.grouped;

    console.log(`requested: ${req.originalUrl}`);
    const chartData = await sensorService.getChartData(
      req.params.sensorId,
      last,
      unit,
      grouped
    );

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getZoneChartData = async (req, res) => {
  try {
    const last = parseInt(req.query.last, 10);
    const unit = req.query.units;
    const grouped = req.query.grouped;

    console.log(`requested: ${req.originalUrl}`);
    const chartData = await sensorService.getZoneChartData(
      req.params.zoneId,
      last,
      unit,
      grouped
    );

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  sensorDataStream,
  getChartData,
  getZoneChartData,
};
