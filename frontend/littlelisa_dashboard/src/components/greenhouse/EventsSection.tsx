import UpcomingEvents from "./eventPanel/UpcomingEvents";
import RecentEvents from "./eventPanel/RecentEvents";
import { useState } from "react";
import { EventPanelState } from "../../../types/enums";

export default function EventsSection() {
  const [panelState, setPanelState] = useState<EventPanelState>(
    EventPanelState.Recent,
  );
  const [isSelected, setSelected] = useState<string>("Recent");

  function panelSelectHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const buttonId = (event.target as HTMLButtonElement).id;

    setPanelState(buttonId as EventPanelState);
    setSelected(buttonId);
  }

  let eventPanel = <></>;
  switch (panelState) {
    case EventPanelState.Upcoming:
      eventPanel = <UpcomingEvents />;

      break;
    case EventPanelState.Recent:
      eventPanel = <RecentEvents />;
      break;
  }

  return (
    <div className="">
      <h3 className="text-md font-bold text-orange-500">Events</h3>
      <div className="flex gap-2  pt-2">
        <button
          id="Upcoming"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Upcoming" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Upcoming
        </button>
        <button
          id="Recent"
          onClick={panelSelectHandler}
          className={`rounded-tl-md rounded-tr-md border p-2 ${isSelected === "Recent" ? "bg-zinc-500" : "bg-zinc-700  hover:bg-zinc-200 hover:font-bold hover:text-red-900"}`}
        >
          Recent
        </button>
      </div>
      <div className="flex h-52 flex-col overflow-y-scroll rounded-bl-md rounded-br-md  bg-zinc-800 py-2">
        {eventPanel}
      </div>
    </div>
  );
}
