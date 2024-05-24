import { Sensor } from "../../../../types/common";

import SensorChart from "./charts/SensorChart";

type SensorInfoProps = {
  sensor: Sensor;
  sensorId: number;
};
export default function SensorInfo({ sensor, sensorId }: SensorInfoProps) {
  return (
    <div className=" col-auto grid grid-cols-6 rounded-md bg-zinc-800 p-2">
      <div className="col-span-6 ">
        <h3 className="text-sm  font-bold text-orange-500">
          <span className="text-blue-300">Sensor: {sensorId} </span>
          {sensor.square_id
            ? `[${sensor.square_pos?.x}-${sensor.square_pos?.y}] - `
            : `[${sensor.zn_rel_pos?.x}-${sensor.zn_rel_pos?.y}-${sensor.zn_rel_pos?.z}] - `}
          {sensor.type} &rarr; Weekly Avg.
        </h3>
        <div className="mt-2 flex h-36 ">
          <SensorChart sensorId={sensorId} />
        </div>
      </div>
    </div>
  );
}
