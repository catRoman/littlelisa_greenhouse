import sensorRepo from "../repos/sensorRepo.js";
const getChartData = async (sensorId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);
  const chartData = await sensorRepo.getChartData(
    sensorId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

const getZoneChartData = async (zoneId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);

  const chartData = await sensorRepo.getZoneChartData(
    zoneId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

const getGreenhouseChartData = async (greenhouseId, last, unit, grouped) => {
  validateSensorParams(last, unit, grouped);

  const chartData = await sensorRepo.getGreenhouseChartData(
    greenhouseId,
    last,
    unit,
    grouped
  );

  return chartData || null;
};

function validateSensorParams(last, unit, grouped) {
  const message = `{"last": "${last}", "unit": "${unit}", "grouped": "${grouped}"}`;
  if (isNaN(last)) {
    throw new Error("Invalid input for last: must be an integer");
  }
  const validUnits = ["days", "weeks", "hours", "months", "years"];
  if (!validUnits.includes(unit)) {
    throw new Error(
      "invalid input for unit: must be either hours, days, weeks, months, years"
    );
  }
  const validGrouping = ["hour", "day", "week", "month"];
  if (!validGrouping.includes(grouped)) {
    throw new Error(
      "invalid input for grouped: must be eithe hour, day, week, month"
    );
  }
}

export default {
  getZoneChartData,
  getChartData,
  getGreenhouseChartData,
};
