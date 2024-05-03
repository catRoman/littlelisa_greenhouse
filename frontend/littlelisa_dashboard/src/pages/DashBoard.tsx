import DashAvgChart from "../components/dashboard/DashAvgChart";
import DashCameraContainer from "../components/dashboard/DashCameraContainer";
import DashEnviroCntrl from "../components/enviroCntrl/DashEnviroCntrl";
import DashSchedule from "../components/dashboard/DashSchedule";
import { greenhouse_data } from "../data/static_info";
import Title from "../components/dashboard/Title";
import Calendar from "react-calendar";

function DashBoard() {
  return (
    <div className="rows-2 container m-auto grid grid-cols-4 grid-rows-2 gap-8 px-4">
      <div className="flex flex-col justify-between gap-4">
        <Title />
        <div className="rounded-md border p-4">
          <Calendar />
        </div>
      </div>
      <div className="row-start-2">
        <DashSchedule />
      </div>
      <div className="col-span-2 flex flex-col gap-4">
        <DashCameraContainer />
      </div>
      <div className="col-span-3 row-start-2 mb-6 flex h-64 flex-col gap-2 rounded-md border p-4">
        <h3 className="text-xl font-bold">
          Culumative Avg Zone Sensor Readings
        </h3>
        <DashAvgChart />
      </div>
      <div className="overflow-auto">
        <DashEnviroCntrl />
      </div>
    </div>
  );
}
export default DashBoard;
