import { handleSensorData } from "../../../services/pg_db.js";

export const sensorDataStream = async (req, res) => {
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
 }