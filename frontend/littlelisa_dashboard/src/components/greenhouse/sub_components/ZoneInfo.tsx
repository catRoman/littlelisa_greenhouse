import { useContext } from "react";
import { ZoneDataFull } from "../../../../types/common";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import ZoneChart from "./charts/ZoneChart";

type ZoneInfoProps = {
  zone: ZoneDataFull;
  zoneId: number;
};
export default function ZoneInfo({ zone }: ZoneInfoProps) {
  const { fetchedGreenhouseData } = useContext(GreenHouseContext);

  return (
    <div className="">
      <div className="mb-2 flex gap-4">
        <h3 className="text-sm  font-bold text-orange-500">
          <span className="text-blue-300"> {zone.name} </span>
          &rarr; Cumulative Senosr Avg. &#8628;
        </h3>
      </div>
      <div className=" col-auto grid  grid-cols-6 rounded-md bg-zinc-800 p-2">
        <div className="">
          <div className="flex text-sm">
            {zone.zone_number === 0 ? (
              <>
                <p className="font-bold text-orange-500">Controllers:</p>
                <p className="pl-4 ">
                  {fetchedGreenhouseData?.total.controllers
                    ? fetchedGreenhouseData.total.controllers
                    : 0}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-orange-500">Nodes:</p>
                <p className="pl-4 ">{zone.nodes ? zone.nodes.length : 0}</p>
              </>
            )}
          </div>
          <div className=" flex h-28 flex-col  text-sm">
            <p className="font-bold text-orange-500">Sensors:</p>
            <ul className="hide-scrollbar mt-1 overflow-scroll pl-4">
              {zone.sensors ? (
                zone.sensors.map((sensor, index) => {
                  return (
                    <li key={index}>
                      <div className="flex justify-between">
                        {/* <span>{sensor.type} </span> */}
                        {sensor.square_id && sensor.square_pos ? (
                          <span>
                            loc: [
                            {sensor.square_pos.y > zone.dimensions.y
                              ? sensor.square_pos.x % zone.dimensions.x
                              : sensor.square_pos.x}
                            ,
                            {sensor.square_pos.y > zone.dimensions.y
                              ? sensor.square_pos.y % zone.dimensions.y
                              : sensor.square_pos.y}
                            ]
                          </span>
                        ) : (
                          <span>
                            loc: [{sensor.zn_rel_pos?.x},{sensor.zn_rel_pos?.y},
                            {sensor.zn_rel_pos?.z}]
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <p>No available sensors</p>
              )}
            </ul>
          </div>
        </div>
        <div className="col-span-5 ">
          {/* <h3 className="text-sm  font-bold text-orange-500">
          {zone.name} &rarr; Cumulative Senosr Avg.
        </h3> */}
          <div className="mt-2 flex h-36 ">
            {zone.sensors ? (
              <ZoneChart zoneId={zone.zone_id} />
            ) : (
              <span className="m-auto">No available sensor Data</span>
            )}
          </div>
        </div>
        {/* <div className="col-span-2">
          <div className="flex flex-col">
            <p className="text-sm  font-bold text-orange-500">
              Latest Watering:
            </p>
            <p className="pl-4">{zone.lastest_enviro.water}</p>
          </div>
        </div>
        <div className="col-span-2 mt-2">
          <div className="flex flex-col">
            <p className="text-sm  font-bold text-orange-500">
              Latest Fertilizing:
            </p>
            <p className="pl-4">{zone.lastest_enviro.fert}</p>
          </div>
        </div>
        <div className="col-span-2 mt-2">
          <div className="flex flex-col">
            <p className="text-sm  font-bold text-orange-500">Light Period:</p>
            {zone.lastest_enviro.light_period ? (
              <p className="pl-4">
                {zone.lastest_enviro.light_period?.period}{" "}
                {zone.lastest_enviro.light_period?.on} -
                {zone.lastest_enviro.light_period?.off}
              </p>
            ) : (
              <p>No current Light Period Set</p>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
