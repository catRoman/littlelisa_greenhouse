import { ZoneData } from "../../../../types/common";
import DashAvgChart from "../../dashboard/DashAvgChart";

type SensorInfoProps = {
  sensor: ZoneData;
  sensorId: number;
};
export default function SensorInfo({ sensor, sensorId }: SensorInfoProps) {
  return (
    <div className=" col-auto grid grid-cols-6 rounded-md bg-zinc-800 p-2">
      <div className="">
        <div className="flex ">
          <p className="text-sm  font-bold text-orange-500">Zone:</p>
          <p className="pl-4 text-sm">{sensorId}</p>
        </div>

        <div className="flex text-sm">
          <p className="font-bold text-orange-500">Nodes:</p>
          <p className="pl-4 ">{sensor.nodes ? sensor.nodes.length : 0}</p>
        </div>
        <div className=" flex h-28 flex-col  text-sm">
          <p className="font-bold text-orange-500">Sensors:</p>
          <ul className="hide-scrollbar mt-1 overflow-scroll pl-4">
            {sensor.sensors ? (
              sensor.sensors.map((sensor, index) => {
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
        <h3 className="text-sm  font-bold text-orange-500">
          {sensor.name} &rarr; Cumulative Senosr Avg.
        </h3>
        <div className="mt-2 flex h-36 ">
          {sensor.sensors ? (
            <DashAvgChart />
          ) : (
            <span className="m-auto">No available sensor Data</span>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <div className="flex flex-col">
          <p className="text-sm  font-bold text-orange-500">Latest Watering:</p>
          <p className="pl-4">{sensor.lastest_enviro.water}</p>
        </div>
      </div>
      <div className="col-span-2 mt-2">
        <div className="flex flex-col">
          <p className="text-sm  font-bold text-orange-500">
            Latest Fertilizing:
          </p>
          <p className="pl-4">{sensor.lastest_enviro.fert}</p>
        </div>
      </div>
      <div className="col-span-2 mt-2">
        <div className="flex flex-col">
          <p className="text-sm  font-bold text-orange-500">Light Period:</p>
          {sensor.lastest_enviro.light_period ? (
            <p className="pl-4">
              {sensor.lastest_enviro.light_period?.period}{" "}
              {sensor.lastest_enviro.light_period?.on} -
              {sensor.lastest_enviro.light_period?.off}
            </p>
          ) : (
            <p>No current Light Period Set</p>
          )}
        </div>
      </div>
    </div>
  );
}
