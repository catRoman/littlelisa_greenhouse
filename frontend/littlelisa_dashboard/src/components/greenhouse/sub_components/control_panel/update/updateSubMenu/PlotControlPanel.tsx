import { useState } from "react";

export default function PlotControlPanel() {
  const [isSelectedSubMenu, setSelectedSubMenu] = useState<string>("plantInfo");

  return (
    <>
      <div className="grid grid-cols-4">
        <h4 className="col-span-1 font-bold text-blue-300">Update Plot:</h4>
        <div className="row-start-2 mt-2 h-36 overflow-y-auto ">
          <ul className="ml-4 flex flex-col gap-1 border-r-2 ">
            <li
              className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === "plantInfo" ? "font-bold text-green-300" : ""} hover:text-green-300`}
            >
              <button id="plantInfo" onClick={subMenuHandler}>
                Plant Info
              </button>
            </li>
            <li
              className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === "nodes" ? "font-bold text-green-300" : ""} hover:text-green-300`}
            >
              <button id="nodes" onClick={subMenuHandler}>
                Nodes
              </button>
            </li>
            <li
              className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === "sensors" ? "font-bold text-green-300" : ""} hover:text-green-300`}
            >
              <button id="sensors" onClick={subMenuHandler}>
                Sensors
              </button>
            </li>
            <li
              className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === "sprinklers" ? "font-bold text-green-300" : ""} hover:text-green-300`}
            >
              <button id="sprinklers" onClick={subMenuHandler}>
                Sprinklers
              </button>
            </li>
            <li
              className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === "clearPlot" ? "font-bold text-green-300" : ""} hover:text-green-300`}
            >
              <button id="clearPlot" onClick={subMenuHandler}>
                Clear Plot
              </button>
            </li>
          </ul>
        </div>
        <div className="col-span-3 row-span-2">{subMenu}</div>
      </div>
    </>
  );
}
