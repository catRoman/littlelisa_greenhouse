import { useContext, useState } from "react";
import {
  ControlPanelState,
  GreenHouseViewState,
  SubMenuState,
} from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import "react-datepicker/dist/react-datepicker.css";
import PlantInfoSubMenu from "./sub_components/update/updateSubMenu/PlantInfoSubMenu";
import ClearPlotSubMenu from "./sub_components/update/updateSubMenu/ClearPlotSubMenu";

export default function UpdateSection() {
  const { viewState } = useContext(GreenHouseContext);
  const [panelState, setPanelState] = useState<ControlPanelState>(
    ControlPanelState.Closed,
  );
  const [isSelected, setSelected] = useState<string>("Schedule");
  const [isSelectedSubMenu, setSelectedSubMenu] = useState<string>("plantInfo");

  let subMenu = <></>;
  switch (isSelectedSubMenu as SubMenuState) {
    case SubMenuState.PlantInfo:
      subMenu = <PlantInfoSubMenu />;

      break;
    case SubMenuState.Nodes:
      subMenu = <div className="pl-4">hello nodes</div>;

      break;
    case SubMenuState.Sensors:
      subMenu = <div className="pl-4">hello sensors</div>;
      break;
    case SubMenuState.Sprinklers:
      subMenu = <div className="pl-4">hello sprinklers</div>;
      break;
    case SubMenuState.ClearPlot:
      subMenu = <ClearPlotSubMenu />;
      break;
  }

  let controlPanel = <></>;
  switch (panelState) {
    case ControlPanelState.Reminder:
      controlPanel = (
        <>
          <div>reminder</div>
        </>
      );

      break;
    case ControlPanelState.Update:
      switch (viewState) {
        case GreenHouseViewState.GreenHouse:
          controlPanel = (
            <>
              <div>
                <h4>Update Greenhouse:</h4>
                <ul>
                  <li>add controller</li>
                  <li>add zone</li>
                  <li>update global sensors</li>
                </ul>
              </div>
            </>
          );
          break;

        case GreenHouseViewState.Zone:
          controlPanel = (
            <>
              <p>update zone</p>
            </>
          );
          break;
        case GreenHouseViewState.Plot:
          controlPanel = (
            <>
              <div className="grid grid-cols-4">
                <h4 className="col-span-1 font-bold text-blue-300">
                  Update Plot:
                </h4>
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

          break;
      }

      break;
    case ControlPanelState.Schedule:
      controlPanel = (
        <>
          <div>schedule</div>
        </>
      );
      break;
  }
  function subMenuHandler(event: React.MouseEvent<HTMLButtonElement>) {
    console.log((event.target as HTMLButtonElement).id);
    event.preventDefault();
    const buttonId = (event.target as HTMLButtonElement).id;

    setSelectedSubMenu(buttonId);
  }

  function panelSelectHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const buttonId = (event.target as HTMLButtonElement).id;

    setPanelState(buttonId as ControlPanelState);
    setSelected(buttonId);
  }

  return (
    <div className="">
      <h3 className="text-md font-bold text-orange-500">Control Panel</h3>
      <div className="flex gap-2  pt-2">
        <button
          id="Schedule"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Schedule" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Schedule
        </button>
        <button
          id="Reminder"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Reminder" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Add Reminder
        </button>
        <button
          id="Update"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Update" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Update
        </button>
      </div>
      <div className="h-48 rounded-bl-md rounded-br-md rounded-tr-md bg-zinc-800 p-2">
        {controlPanel}
      </div>
    </div>
  );
}
