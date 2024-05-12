import { greenhouse_data } from "../../data/static_info";

export default function Title() {
  const { greenhouse } = greenhouse_data;
  return (
    <div className="flex flex-col  justify-around gap-3">
      <h1 className=" flex-shrink text-4xl tracking-widest ">DashBoard</h1>
      <div className="text-md flex flex-col gap-3">
        <div className="flex gap-3">
          <h3 className="font-bold text-orange-500">Greenhouse</h3>
          <span>{greenhouse.greenhouse_id} </span>

          <span>{greenhouse.greenhouse_location_str}</span>
        </div>
        <div className=" ">
          <h3 className=" font-bold text-orange-500">Controllers:</h3>
          <ul>
            {greenhouse.controllers.map((controller) => {
              return (
                <div className="flex gap-3 pl-4">
                  <li>
                    {controller.moduleId} &rarr;{" "}
                    <span className="text-green-300">active</span> &rarr;
                  </li>
                  <li>
                    location: [ {controller.loc_coord.x} ,{" "}
                    {controller.loc_coord.y} ]
                  </li>
                </div>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
