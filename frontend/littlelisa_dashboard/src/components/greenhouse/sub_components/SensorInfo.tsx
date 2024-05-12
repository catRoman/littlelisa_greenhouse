import { Sensor } from "../../../../types/common";
import DashAvgChart from "../../dashboard/DashAvgChart";

type SensorInfoProps = {
  sensor: Sensor;
  sensorId: number;
};
export default function SensorInfo({ sensor, sensorId }: SensorInfoProps) {
  return (
    <div className=" col-auto grid grid-cols-6 rounded-md bg-zinc-800 p-2">
      <div className="col-span-6 ">
        <h3 className="text-sm  font-bold text-orange-500">
          SensorId: {sensorId} [{sensor.loc_coord.x}-{sensor.loc_coord.y}] -{" "}
          {sensor.type} &rarr; Weekly Avg.
        </h3>
        <div className="mt-2 flex h-36 ">
          <DashAvgChart />
        </div>
      </div>
    </div>
  );
}
