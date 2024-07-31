<<<<<<< HEAD
export default function Debug() {
  return (
    <div className="pr-6">
      <h1>Debug page</h1>
    </div>
=======
import { ChangeEvent, useContext, useState } from "react";
import { DebugPanelState } from "../../types/enums";
import DeviceInfo from "../components/debug/DeviceInfo";
import NetworkInfo from "../components/debug/NetworkInfo";
import OTAUpdate from "../components/debug/OTAUpdate";
import { Module } from "../../types/common";
import { GreenHouseContext } from "../context/GreenHouseContextProvider";

export default function Debug() {
  const { fetchedGreenhouseData } = useContext(GreenHouseContext);

  const defaultModuleList: Module[] = [];
  if (fetchedGreenhouseData) {
    fetchedGreenhouseData.controllers.map((controller) => {
      defaultModuleList.push(controller);
    });
    fetchedGreenhouseData.zones.map((zone) => {
      zone.nodes?.map((node) => {
        defaultModuleList.push(node);
      });
    });
  }
  const [currentModule, setCurrentModule] = useState<string>("");

  const [moduleList, setModuleList] = useState<Module[]>(defaultModuleList);

  const [panelState, setPanelState] = useState<DebugPanelState>(
    DebugPanelState.Device,
  );
  const [isSelected, setSelected] = useState<string>("Device Info");

  let debugPanel = <></>;
  switch (panelState) {
    case DebugPanelState.Device:
      debugPanel = <DeviceInfo />;

      break;
    case DebugPanelState.Network:
      debugPanel = <NetworkInfo />;
      break;
    case DebugPanelState.System:
      debugPanel = <h3>system</h3>;
      break;
    case DebugPanelState.DB:
      debugPanel = (
        <>
          <div>db info</div>
        </>
      );
      break;
    case DebugPanelState.OTA:
      debugPanel = <OTAUpdate />;
      break;
  }
  function panelSelectHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const buttonId = (event.target as HTMLButtonElement).id;

    setPanelState(buttonId as DebugPanelState);
    setSelected(buttonId);
  }

  function moduleSelectionHandler(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    console.log("current target: ", event.target.textContent);
    console.log("currentMdouel: ", currentModule);
    setCurrentModule(event.target.textContent || "");
  }
  return (
    <main className="p-4">
      <div className="pb-6">
        <h1 className="mb-4  pb-4 text-2xl">Debug</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus fugiat
          saepe id aspernatur officia recusandae cumque in quia officiis?
          Laboriosam eum debitis incidunt voluptates temporibus distinctio
          velit, voluptatum accusamus? Doloribus.
        </p>
        <form>
          <label htmlFor="module">Module:</label>
          <select
            name="module"
            id="module"
            className="border p-2"
            onChange={moduleSelectionHandler}
          >
            {moduleList.map((module) => (
              <option key={module.module_id} value={module.module_id}>
                {module.module_id}
              </option>
            ))}
          </select>
        </form>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 flex flex-col gap-4 border">
          <div>
            <h2 className="text-xl">Log Feed -</h2>
            <h3 className=""> {currentModule}</h3>
          </div>
          <div className="h-96 border">
            <textarea
              className="h-full w-full resize-none overflow-y-scroll"
              readOnly
            >
              Log stream starting ...
            </textarea>
          </div>
        </div>
        <div className="col-span-2 col-start-3 flex gap-4 border">
          <div className="border">
            <h2>Module Details</h2>
            <div className="flex gap-2  pt-2">
              <button
                id="Device"
                onClick={panelSelectHandler}
                className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Device" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
              >
                Device Info
              </button>
              <button
                id="Network"
                onClick={panelSelectHandler}
                className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Network" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
              >
                Network
              </button>
              <button
                id="System"
                onClick={panelSelectHandler}
                className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "System" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
              >
                System
              </button>
              <button
                id="DB"
                onClick={panelSelectHandler}
                className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "DB" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
              >
                DB Info
              </button>
              <button
                id="OTA"
                onClick={panelSelectHandler}
                className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "OTA" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
              >
                OTA Update
              </button>
            </div>
            <div className="h-48 rounded-bl-md rounded-br-md rounded-tr-md bg-zinc-800 p-2">
              {debugPanel}
            </div>
          </div>
        </div>
      </div>
    </main>
>>>>>>> landing_page
  );
}
