import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import {
  upcoming_event_data,
  recent_event_data,
} from "../../data/mock_json/event_data";
import EventLog from "./sub_components/EventLog";

export default function EventsSection() {
  const { viewState, selectedZoneId } = useContext(GreenHouseContext);

  const upcoming: JSX.Element[] = [];
  const recent: JSX.Element[] = [];

  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      upcoming_event_data.map((event) => {
        upcoming.push(<EventLog event={event} />);
      });
      recent_event_data.map((event) => {
        recent.push(<EventLog event={event} />);
      });
      break;
    case GreenHouseViewState.Zone:
      upcoming_event_data.map((event) => {
        if (event.zone === selectedZoneId.toString()) {
          upcoming.push(<EventLog event={event} />);
        }
      });
      recent_event_data.map((event) => {
        if (event.zone === selectedZoneId.toString()) {
          recent.push(<EventLog event={event} />);
        }
      });
      break;
    case GreenHouseViewState.Plot:
      upcoming_event_data.map((event) => {
        if (event.zone === selectedZoneId.toString()) {
          upcoming.push(<EventLog event={event} />);
        }
      });
      recent_event_data.map((event) => {
        if (event.zone === selectedZoneId.toString()) {
          recent.push(<EventLog event={event} />);
        }
      });
      break;
  }

  return (
    <div>
      <div>
        <h2 className="text-md  font-bold text-orange-500">Upcoming Events:</h2>
        <ul className="hide-scrollbar mt-1 h-52 overflow-scroll rounded-md bg-zinc-800 px-4 py-2">
          {upcoming?.map((event) => event)}
        </ul>
      </div>
      <div className="my-2">
        <h2 className=" text-md font-bold text-orange-500">Recent Events:</h2>
        <ul className="hide-scrollbar mt-1 h-52 overflow-scroll rounded-md bg-zinc-800 px-4 py-2">
          {recent?.map((event) => event)}
        </ul>
      </div>
    </div>
  );
}
