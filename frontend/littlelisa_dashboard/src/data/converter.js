const fs = require("fs");
const Papa = require("papaparse");

const csvFilePath = "./weather_api_conditions.csv";
const jsonFilePath = "./path/to/output.json";

const csvData = fs.readFileSync(csvFilePath, "utf8");

const results = Papa.parse(csvData, {
  header: true,
});

const jsonData = JSON.stringify(results.data, null, 2);
fs.writeFileSync(jsonFilePath, jsonData);
