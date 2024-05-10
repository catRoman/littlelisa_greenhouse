import { useContext } from "react";
import { greenhouse_data } from "../../../data/static_info";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { Plot, Sensor } from "../../../../types/common";
import { square_data } from "../../../data/mock_json/square_data";

export default function ZoneOverview() {
  const { selectedZoneId } = useContext(GreenHouseContext);
  const { zones } = greenhouse_data;
  const zone = zones[selectedZoneId - 1];

  function getUniqueSensorTypes(sensors: Sensor[]): string[] {
    const uniqueTypes = new Set<string>();
    sensors.forEach((sensor) => {
      uniqueTypes.add(sensor.type);
    });
    return Array.from(uniqueTypes);
  }
  const zonePlots: Plot[] = [];

  square_data.map((plot) => {
    if (plot.zone_id === selectedZoneId) {
      zonePlots.push(plot);
    }
  });
  function getNumberEmptyPlots(plotArr: Plot[]): number {
    return plotArr.reduce((acc, curr) => {
      if (curr.is_empty) acc++;
      return acc;
    }, 0);
  }
  function getNumberPlants(plotArr: Plot[]): number {
    return plotArr.reduce((acc, curr) => {
      if (!curr.is_empty) acc++;
      return acc;
    }, 0);
  }

  function getUniquePlantTypes(plotArr: Plot[]): string[] {
    const uniqueTypes = new Set<string>();
    plotArr.forEach((plot) => {
      plot.plant_type && uniqueTypes.add(plot.plant_type);
    });
    return Array.from(uniqueTypes);
  }
  console.log(getUniquePlantTypes(zonePlots));
  return (
    <>
      <div className="pl-4">
        <li>
          <span className="font-bold">Rows: </span>
          <span className="text-green-300">{zone.dimensions.y}</span>
        </li>
        <li>
          <span className="font-bold">Columns: </span>
          <span className="text-green-300">{zone.dimensions.x}</span>
        </li>
        <li>
          <span className="font-bold">dimensions: </span>
          <span className="text-green-300">
            {zone.dimensions.x} X {zone.dimensions.y} X {zone.dimensions.z}
          </span>
        </li>
        <li>
          <span className="font-bold">Lights Available: </span>
          <span className="text-green-300">
            {zone.lightAvailable ? "Yes" : "No"}
          </span>
        </li>
        {zone.sprinklersAvailable && zone.sprinklers && (
          <li>
            <span className="font-bold">Sprinkler Heads: </span>
            <span className="text-green-300">{zone.sprinklers?.length}</span>
          </li>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-orange-500">Sensors</h3>
        <ul className="pl-4">
          <li>
            <span className="font-bold">Total: </span>
            <span className="text-green-300">
              {zone.sensors?.length ? zone.sensors?.length : 0}
            </span>
          </li>

          {zone.sensorsAvailable && zone.sensors && (
            <li>
              <span className="font-bold">Types: </span>
              <ul className="pl-4">
                {getUniqueSensorTypes(zone.sensors).map((uniqueType, index) => {
                  return (
                    <li
                      key={`uniqueSensor-${index}`}
                      className="text-green-300"
                    >
                      {uniqueType}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold text-orange-500">Plots</h3>

        <ul className="pl-4">
          <li>
            <span className="font-bold">Total: </span>
            <span className="text-green-300">
              {zone.dimensions.x * zone.dimensions.y}
            </span>
          </li>
          <li>
            <span className="font-bold">Empty: </span>
            <span className="text-green-300">
              {getNumberEmptyPlots(zonePlots)}
            </span>
          </li>
          <li>
            <span className="font-bold">Planted: </span>
            <span className="text-green-300">{getNumberPlants(zonePlots)}</span>
          </li>

          <li>
            <span className="font-bold">Types: </span>
            <ul className="hide-scrollbar ml-2 mr-8 mt-2 h-24  overflow-scroll rounded-md bg-zinc-700 pl-2">
              {getUniquePlantTypes(zonePlots).map((uniqueType, index) => {
                return (
                  <li key={`uniqueSensor-${index}`} className="text-green-300">
                    {uniqueType}
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </div>
    </>
  );
}
