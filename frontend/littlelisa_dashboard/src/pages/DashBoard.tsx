import DashAvgChart from "../components/dashboard/GreenhouseAvgChart";
import DashCameraContainer from "../components/dashboard/DashCameraContainer";
import DashEnviroCntrl from "../components/enviroCntrl/DashEnviroCntrl";
import DashSchedule from "../components/dashboard/DashSchedule";
import Title from "../components/dashboard/Title";
import Calendar from "react-calendar";
import "../components/dashboard/dasboard.css";

function DashBoard() {
  //TODO:figure out this for sharing values possible individual fetchhes
  //or user context
  const greenhouse_id = 1;
  return (
    <div className="container grid w-full  grid-cols-6  gap-8 px-4">
      <div className="col-span-2 flex flex-col justify-between gap-4">
        <Title />
        <div className="rounded-md bg-zinc-800 p-4">
          <Calendar />
        </div>
      </div>
      <div className="col-span-2 row-start-2 ">
        <DashSchedule />
      </div>
      <div className="col-span-3 flex flex-col gap-4">
        <DashCameraContainer />
      </div>
      <div className="col-span-3 row-start-2 flex flex-col gap-2">
        <h3 className="text-md  font-bold text-orange-500">
          Culumative Avg Greenhouse Sensor Readings
        </h3>
        <div className="h-48 rounded-md  bg-zinc-800 p-4">
          <DashAvgChart greenhouseId={greenhouse_id} />
        </div>
      </div>
      <div className="hide-scrollbar row-span-2 h-auto overflow-auto">
        <h3 className="text-md  font-bold text-orange-500">
          Enviromental Control
        </h3>
        <div>
          <DashEnviroCntrl />
        </div>
      </div>
    </div>
  );
}
export default DashBoard;
