import { useContext } from "react";

import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { Plot } from "../../../../types/common";

export default function ZoneOverview() {
  const { selectedZoneNumber, fetchedGreenhouseData, envCntrlStates } =
    useContext(GreenHouseContext);

  if (fetchedGreenhouseData) {
    // const { zones } = fetchedGreenhouseData;
    // const zone = zones[selectedZoneNumber];
    const { dimensions } = fetchedGreenhouseData;
    const zonePlots: Plot[] = [];

    fetchedGreenhouseData.squares.map((plot) => {
      if (plot.zone_number === selectedZoneNumber) {
        zonePlots.push(plot);
      }
    });
    // function getNumberEmptyPlots(plotArr: Plot[]): number {
    //   return plotArr.reduce((acc, curr) => {
    //     if (curr.is_empty) acc++;
    //     return acc;
    //   }, 0);
    // }
    // function getNumberPlants(plotArr: Plot[]): number {
    //   return plotArr.reduce((acc, curr) => {
    //     if (!curr.is_empty) acc++;
    //     return acc;
    //   }, 0);
    // }

    // function getUniquePlantTypes(plotArr: Plot[]): string[] {
    //   const uniqueTypes = new Set<string>();
    //   plotArr.forEach((plot) => {
    //     plot.plant_type && uniqueTypes.add(plot.plant_type);
    //   });
    //   return Array.from(uniqueTypes);
    // }
    // console.log(getUniquePlantTypes(zonePlots));

    return (
      <div className="flex flex-col gap-2">
        <div className="pl-4">
          <li>
            <span className="font-bold">Rows: </span>
            <span className="text-green-300">{dimensions.y}</span>
          </li>
          <li>
            <span className="font-bold">Columns: </span>
            <span className="text-green-300">{dimensions.x}</span>
          </li>
          <li>
            <span className="font-bold">dimensions: </span>
            <span className="text-green-300">
              {dimensions.x} X {dimensions.y} X {dimensions.z}
            </span>
          </li>
          {/* <li>
            <span className="font-bold">Lights Available: </span>
            <span className="text-green-300">
              {zone.lightAvailable ? "Yes" : "No"}
            </span>
          </li> */}
          {/* {zone.sprinklersAvailable && zone.sprinklers && (
          <li>
            <span className="font-bold">Sprinkler Heads: </span>
            <span className="text-green-300">{zone.sprinklers?.length}</span>
          </li>
        )} */}
        </div>
        {/* <div>
          <h3 className="text-md font-bold text-orange-500">Latest</h3>
          <ul className="pl-4">
            <li>
              <span className="font-bold">Water: </span>
              <ul className="pl-4">
                <li className="text-green-300">{zone.lastest_enviro.water}</li>
              </ul>
            </li>
            <li>
              <span className="font-bold">Fert: </span>
              <ul className="pl-4">
                <li className="text-green-300">{zone.lastest_enviro.fert}</li>
              </ul>
            </li>
            <li>
              <span className="font-bold">Light Period: </span>
              <ul className="pl-4">
                {zone.lastest_enviro.light_period ? (
                  <li className="text-green-300">
                    {zone.lastest_enviro.light_period?.on} {" - "}
                    {zone.lastest_enviro.light_period?.off}
                  </li>
                ) : (
                  <li className="text-red-300">No light period set</li>
                )}
              </ul>
            </li>
          </ul>
        </div> */}
        {/* <div>
        <h3 className="text-md font-bold text-orange-500">Plots</h3>

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
      </div> */}
        <div>
          <li className="">
            <h3 className="text-md font-bold text-orange-500">
              Enviromental Status
            </h3>
          </li>
          <div className="pl-4">
            {envCntrlStates.map((cntrl, index) => {
              return (
                <li key={`evn-cntrl-btn-${index}}`}>
                  <span className="font-bold">{cntrl.type} </span>
                  <span>
                    {cntrl.state === "on" ? (
                      <span className="text-green-500">On</span>
                    ) : (
                      <span className="text-red-500">Off</span>
                    )}
                  </span>
                </li>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    {
      console.log("loding in zones");
    }
    return <h1>Loading...</h1>;
  }
}
