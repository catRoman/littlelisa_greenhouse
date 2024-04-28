import DashAvgChart from "../components/dashboard/DashAvgChart";
import DashCameraContainer from "../components/dashboard/DashCameraContainer";
import DashEnviroCntrl from "../components/dashboard/DashEnviroCntrl";
import DashSchedule from "../components/dashboard/DashSchedule";
import { greenhouse_data } from "../data/static_info";

export default function DashBoard() {
  return (
    <main className="m-4 grid grid-cols-2 gap-4">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col  justify-around">
          <h1 className=" flex-shrink text-4xl tracking-widest ">DashBoard</h1>
          <p className=" pl-6 text-lg ">
            Greenhouse: {greenhouse_data.greenhouse_id} &rarr;{" "}
            {greenhouse_data.greenhouse_location_str}
          </p>
          <p className=" pl-6 text-lg ">
            Controller: d4:h1:y7:i6:e2:4b &rarr; active
          </p>
        </div>
        <div className="">
          <DashSchedule />
        </div>
      </div>
      <div className="pt-3">
        <DashCameraContainer />
      </div>
      <div className="col-span-2">
        <div className="mb-4">
          <DashEnviroCntrl />
        </div>
        <div className="h-52">
          <h3 className="mb-4 text-xl font-bold">
            Culumative Avg Zone Sensor Readings
          </h3>
          <DashAvgChart />
        </div>
      </div>
    </main>
  );
}
