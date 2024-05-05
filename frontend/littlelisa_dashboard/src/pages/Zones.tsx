import DashAvgChart from "../components/dashboard/DashAvgChart";
import AsciiTest from "../components/greenhouse_render/fooling_around/AsciiTest";
import FiberTest from "../components/greenhouse_render/fooling_around/FiberTest";

export default function Zones() {
  return (
    <div className="mr-4 grid grid-cols-4 gap-6 px-4">
      <div className="col-span-4 ">
        <h1 className="mb-4 text-2xl">Zones</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore porro
          dignissimos voluptatibus recusandae sed excepturi tempore ipsa
          facilis. Fuga tenetur sed enim inventore atque quo laborum architecto
          veniam asperiores reprehenderit.
        </p>
      </div>
      <div className="z-1 col-span-2 h-96 overflow-hidden">
        {/* <GreenHouseRender cssClass="h-96" /> */}
        <AsciiTest cssClass="h-96" />
      </div>
      <div className="border">zone information</div>
      <div className="border">recent activity</div>
      <div className="h-24 border">zone 1</div>
      <div className="border">zone 2</div>
      <div className="border">zone 3</div>
      <div className="border">zone 4</div>
    </div>
  );
}
