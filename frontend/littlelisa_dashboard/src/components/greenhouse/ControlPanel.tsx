import { useContext, useState } from "react";
import {
  ControlPanelState,
  GreenHouseViewState,
  UpdatePlotSubMenuState,
} from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import "react-datepicker/dist/react-datepicker.css";
import PlantInfoSubMenu from "./sub_components/control_panel/update/updateSubMenu/PlantInfoSubMenu";
import ClearPlotSubMenu from "./sub_components/control_panel/update/updateSubMenu/ClearPlotSubMenu";

import DashEnviroCntrl from "../enviroCntrl/DashEnviroCntrl";
import Update from "./sub_components/control_panel/update/Update";

export default function ControlPanel() {
  const { viewState } = useContext(GreenHouseContext);
  const [panelState, setPanelState] = useState<ControlPanelState>(
    ControlPanelState.Enviroment,
  );
  const [isSelected, setSelected] = useState<string>("Enviroment");
  const [isSelectedSubMenu, setSelectedSubMenu] =
    useState<string>("Plant Info");

  let subMenu = <></>;
  switch (isSelectedSubMenu as UpdatePlotSubMenuState) {
    case UpdatePlotSubMenuState.PlantInfo:
      subMenu = <PlantInfoSubMenu />;
      break;
    case UpdatePlotSubMenuState.Nodes:
      subMenu = <div className="pl-4">hello nodes</div>;
      break;
    case UpdatePlotSubMenuState.Sensors:
      subMenu = <div className="pl-4">hello sensors</div>;
      break;
    case UpdatePlotSubMenuState.Sprinklers:
      subMenu = <div className="pl-4">hello sprinklers</div>;
      break;
    case UpdatePlotSubMenuState.ClearPlot:
      subMenu = <ClearPlotSubMenu />;
      break;
  }

  let controlPanel = <></>;
  let updateSubMenu;
  switch (panelState) {
    case ControlPanelState.Enviroment:
      controlPanel = (
        <>
          <div>
            <h4>Enviromental Controls</h4>
            <div className="h-36 overflow-y-auto ">
              <DashEnviroCntrl />
            </div>
          </div>
        </>
      );

      break;
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
          updateSubMenu = UpdatePlotSubMenuState;
          break;
        case GreenHouseViewState.Zone:
          updateSubMenu = UpdatePlotSubMenuState;
          break;
        case GreenHouseViewState.Plot:
          updateSubMenu = UpdatePlotSubMenuState;
          break;
      }
      controlPanel = (
        <Update
          subMenu={subMenu}
          subMenuHandler={subMenuHandler}
          isSelectedSubMenu={isSelectedSubMenu}
          subMenuList={updateSubMenu}
        />
      );
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
          id="Enviroment"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Enviroment" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Enviroment
        </button>
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
