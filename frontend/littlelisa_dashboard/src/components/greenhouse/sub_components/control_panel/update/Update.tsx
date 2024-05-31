import { useContext, useState } from "react";
import {
  GreenHouseViewState,
  UpdateSubMenu,
} from "../../../../../../types/enums";
import UpdateListButton from "./updateSubMenu/UpdateListButton";
import { GreenHouseContext } from "../../../../../context/GreenHouseContextProvider";
import PlantInfoSubMenu from "./updateSubMenu/plot/PlantInfoSubMenu";
import Clear from "./updateSubMenu/Clear";
import ControlPanelClearContextProvider from "../../../../../context/ControlPanelClearContext";

export default function Update() {
  const { viewState } = useContext(GreenHouseContext);
  const [isSelectedSubMenu, setSelectedSubMenu] =
    useState<string>("Plant Info");

  let subMenu = <></>;

  function subMenuHandler(event: React.MouseEvent<HTMLButtonElement>) {
    console.log((event.target as HTMLButtonElement).id);
    event.preventDefault();
    const buttonId = (event.target as HTMLButtonElement).id;

    setSelectedSubMenu(buttonId);
  }

  switch (isSelectedSubMenu as UpdateSubMenu) {
    case UpdateSubMenu.Greenhouse:
      subMenu = <div className="pl-4">hello greenhouse</div>;
      break;
    case UpdateSubMenu.Zone:
      subMenu = <div className="pl-4">hello zone</div>;
      break;
    case UpdateSubMenu.Controller:
      subMenu = <div className="pl-4">hello controller</div>;
      break;
    case UpdateSubMenu.GlobalSensors:
      subMenu = <div className="pl-4">hello global sensors</div>;
      break;
    case UpdateSubMenu.PlantInfo:
      subMenu = <PlantInfoSubMenu />;
      break;
    case UpdateSubMenu.Nodes:
      subMenu = <div className="pl-4">hello nodes</div>;
      break;
    case UpdateSubMenu.Sensors:
      subMenu = <div className="pl-4">hello sensors</div>;
      break;
    case UpdateSubMenu.Sprinklers:
      subMenu = <div className="pl-4">hello sprinklers</div>;
      break;
    case UpdateSubMenu.Clear:
      subMenu = (
        <ControlPanelClearContextProvider>
          <Clear />
        </ControlPanelClearContextProvider>
      );
      break;
  }
  const subMenuMap: { [key in GreenHouseViewState]: UpdateSubMenu[] } = {
    [GreenHouseViewState.GreenHouse]: [
      UpdateSubMenu.Greenhouse,
      UpdateSubMenu.Controller,
      UpdateSubMenu.GlobalSensors,
      UpdateSubMenu.Clear,
    ],
    [GreenHouseViewState.Zone]: [
      UpdateSubMenu.Zone,
      UpdateSubMenu.Sprinklers,
      UpdateSubMenu.Clear,
    ],
    [GreenHouseViewState.Plot]: [
      UpdateSubMenu.PlantInfo,
      UpdateSubMenu.Nodes,
      UpdateSubMenu.Sensors,
      UpdateSubMenu.Clear,
    ],
  };

  return (
    <div className="grid grid-cols-4">
      <h4 className="col-span-1 font-bold text-blue-300">Update Plot:</h4>
      <div className="row-start-2 mt-2 h-36 overflow-y-auto ">
        <ul className="ml-4 flex flex-col gap-1 border-r-2 ">
          {Object.values(subMenuMap[viewState as GreenHouseViewState]).map(
            (item) => (
              <UpdateListButton
                isSelectedSubMenu={isSelectedSubMenu}
                subMenuHandler={subMenuHandler}
              >
                {item}
              </UpdateListButton>
            ),
          )}
        </ul>
      </div>
      <div className="col-span-3 row-span-2">{subMenu}</div>
    </div>
  );
}
