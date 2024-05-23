import { useContext } from "react";
import { current_enviromental } from "../../../data/static_info";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { GreenhouseData } from "../../../../types/common";
import { GreenHouseViewState } from "../../../../types/enums";

export default function GreenHouseOverview() {
  const { fetchedGreenhouseData, viewState } = useContext(GreenHouseContext);

  if (fetchedGreenhouseData) {
    const { lat, long, style, total, dimensions } =
      fetchedGreenhouseData as GreenhouseData;
    if (viewState === GreenHouseViewState.GreenHouse) {
      return (
        <div className="flex flex-col gap-2">
          <div className="pl-4">
            <li>
              <span className="font-bold">lat: </span>
              <span className="text-green-300">{lat}</span>
            </li>
            <li>
              <span className="font-bold">long: </span>
              <span className="text-green-300">{long}</span>
            </li>
            <li>
              <span className="font-bold">style: </span>
              <span className="text-green-300">{style}</span>
            </li>
            <li>
              <span className="font-bold">dimensions: </span>
              <span className="text-green-300">
                {dimensions.x} X {dimensions.y} X {dimensions.z}
              </span>
            </li>
            <li>
              <span className="font-bold">total zones: </span>
              <span className="text-green-300">{total.zones}</span>
            </li>
          </div>
          <div>
            <li className="">
              <h3 className="text-md font-bold text-orange-500">Modules</h3>
            </li>
            <div className="pl-4">
              <li>
                <span className="font-bold">total controllers: </span>
                <span className="text-green-300">{total.controllers}</span>
              </li>
              <li>
                <span className="font-bold">total nodes: </span>
                <span className="text-green-300">{total.nodes}</span>
              </li>
              <li>
                <span className="font-bold">total sensors: </span>
                <span className="text-green-300">{total.sensors}</span>
              </li>
            </div>
          </div>
          <div>
            <li className="">
              <h3 className="text-md font-bold text-orange-500">
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
        </div>
      );
    } else {
      console.log("yupppers");
    }
  } else {
    return <h1>loading</h1>;
  }
}
