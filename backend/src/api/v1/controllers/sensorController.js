import { handleSensorData } from "../services/pg_db.js";
import sensorService from "../services/sensorService.js";
import { parseForm } from "./util/utility.js";

const sensorDataStream = async (req, res) => {
  try {
    const sensorData = req.body;
    // debug logging incoming sensor data

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error("No data received in sensor stream post");
    }
    // console.log(sensorData);
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

const getGreenhouseChartData = async (req, res) => {
  try {
    const last = parseInt(req.query.last, 10);
    const unit = req.query.units;
    const grouped = req.query.grouped;

    console.log(`requested: ${req.originalUrl}`);
    const chartData = await sensorService.getGreenhouseChartData(
      req.params.greenhouseId,
      last,
      unit,
      grouped
    );

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const zoneId = req.params.zoneId;
    const squareId = req.params.squareId;
    const greenhouseId = req.params.greenhouseId;
    const sensorId = req.params.sensorId;

    console.log(`requested: ${req.originalUrl}`);
    console.log(
      `greenhouse: ${greenhouseId} - zone: ${zoneId} - square: ${squareId} - sensor: ${sensorId} `
    );

    const { fields } = await utility.parseForm(req);
    const { sensor_id, x_pos, y_pos, z_pos, new_tag, type } = fields;

    if (!type || type[0] === "") {
      return res.status(400).json({ error: "No type submitted" });
    }

    let zn_rel_pos = null;
    if (x_pos && y_pos && z_pos) {
      zn_rel_pos = [x_pos[0], y_pos[0], z_pos[0]];
    }

    console.log(type[0]);
    let response;
    //selectedNode, newNodeTag, zoneId, squareId
    // if (type[0] === "tag") {
    //   response = await nodeService.updateNodeTag(
    //     sensor_id[0],
    //     new_tag[0],
    //     req.params.greenhouseId,
    //     req.params.zoneId,
    //     req.params.squareId
    //   );
    // } else {
    //   response = await sensorService.updatePos(
    //     type,
    //     zn_rel_pos,
    //     sensor_id[0],
    //     req.params.zoneId,
    //     req.params.squareId,
    //     req.params.greenhouseId
    //   );
    // }

    res.status(200).json();
    // res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  sensorDataStream,
  update,
  getChartData,
  getZoneChartData,
  getGreenhouseChartData,
};
