import { useState } from "react";
import { ControlPanelState } from "../../../types/enums";

export default function UpdateSection() {
  const [panelState, setPanelState] = useState<ControlPanelState>(
    ControlPanelState.Closed,
  );
  const [isSelected, setSelected] = useState<string>("Schedule");

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
      controlPanel = (
        <>
          <div>update</div>
        </>
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
      <div className="h-36 rounded-bl-md rounded-br-md rounded-tr-md bg-zinc-800 p-2">
        {controlPanel}
      </div>
    </div>
  );
}
