import {
  greenhouse_data,
  current_enviromental,
} from "../../../data/static_info";

export default function GreenHouseOverview() {
  const { greenhouse } = greenhouse_data;
  return (
    <>
      <div className="pl-4">
        <li>
          <span className="font-bold">lat: </span>
          <span className="text-green-300">{greenhouse.lat}</span>
        </li>
        <li>
          <span className="font-bold">long: </span>
          <span className="text-green-300">{greenhouse.long}</span>
        </li>
        <li>
          <span className="font-bold">type: </span>
          <span className="text-green-300">{greenhouse.type}</span>
        </li>
        <li>
          <span className="font-bold">dimensions: </span>
          <span className="text-green-300">
            {greenhouse.dimensions.x} X {greenhouse.dimensions.y}
          </span>
        </li>
        <li>
          <span className="font-bold">total zones: </span>
          <span className="text-green-300">{greenhouse.total_zones}</span>
        </li>
      </div>
      <div>
        <li className="">
          <h3 className="text-xl font-bold text-orange-500">Modules</h3>
        </li>
        <div className="pl-4">
          <li>
            <span className="font-bold">total controllers: </span>
            <span className="text-green-300">
              {greenhouse.total_controllers}
            </span>
          </li>
          <li>
            <span className="font-bold">total sensors: </span>
            <span className="text-green-300">{greenhouse.total_sensors}</span>
          </li>
        </div>
      </div>
      <div>
        <li className="">
          <h3 className="text-xl font-bold text-orange-500">
            Enviromental Status
          </h3>
        </li>
        <div className="pl-4">
          <li>
            <span className="font-bold">Fans: </span>
            <span>
              {current_enviromental.fans ? (
                <span className="text-green-500">On</span>
              ) : (
                <span className="text-red-500">Off</span>
              )}
            </span>
          </li>
          <li>
            <span className="font-bold">Lights: </span>
            <span>
              {current_enviromental.lights ? (
                <span className="text-green-500">On</span>
              ) : (
                <span className="text-red-500">Off</span>
              )}
            </span>
          </li>
          <li>
            <span className="font-bold">Water: </span>
            <span>
              {current_enviromental.water ? (
                <span className="text-green-500">Watering</span>
              ) : (
                <span className="text-red-500">Off</span>
              )}
            </span>
          </li>
          <li>
            <span className="font-bold">Vents: </span>
            <span>
              {current_enviromental.fans ? (
                <span className="text-green-500">Open</span>
              ) : (
                <span className="text-red-500">Shut</span>
              )}
            </span>
          </li>
          <li>
            <span className="font-bold">Fertilizer: </span>
            <span>
              {current_enviromental.fertilizers ? (
                <span className="text-green-500">Spraying</span>
              ) : (
                <span className="text-red-500">Off</span>
              )}
            </span>
          </li>
        </div>
      </div>
    </>
  );
}
