import { ZoneData } from "../../../../types/common";
import DashAvgChart from "../../dashboard/DashAvgChart";

type ZoneInfoProps = {
  zone: ZoneData;
  zoneId: number;
};
export default function ZoneInfo({ zone, zoneId }: ZoneInfoProps) {
  return (
    <div className="">
      <div className="mb-2 flex gap-4">
        <p className="text-sm  font-bold text-orange-500">Zone:</p>
        <p className="text-sm">{zoneId}</p>
        <h3 className="text-sm  font-bold text-orange-500">
          <span className="text-blue-300"> {zone.name} </span>
          &rarr; Cumulative Senosr Avg. &#8628;
        </h3>
      </div>
      <div className=" col-auto grid  grid-cols-6 rounded-md bg-zinc-800 p-2">
        <div className="">
          <div className="flex text-sm">
            <p className="font-bold text-orange-500">Nodes:</p>
            <p className="pl-4 ">{zone.nodes ? zone.nodes.length : 0}</p>
          </div>
          <div className=" flex h-28 flex-col  text-sm">
            <p className="font-bold text-orange-500">Sensors:</p>
            <ul className="hide-scrollbar mt-1 overflow-scroll pl-4">
              {zone.sensors ? (
                zone.sensors.map((sensor, index) => {
                  return (
                    <li key={index}>
                      <div className="flex justify-between">
                        <span>{sensor.type} </span>
                        <span>
                          loc: [{sensor.loc_coord.x},{sensor.loc_coord.y}]
                        </span>
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
              <DashAvgChart />
            ) : (
              <span className="m-auto">No available sensor Data</span>
            )}
          </div>
        </div>
        <div className="col-span-2">
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
        </div>
      </div>
    </div>
  );
}
