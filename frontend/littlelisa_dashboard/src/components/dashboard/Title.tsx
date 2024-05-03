import { greenhouse_data } from "../../data/static_info";

export default function Title() {
  return (
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
  );
}
