import { upcoming_event_data } from "../../data/mock_json/event_data";
import EventLog from "../greenhouse/sub_components/EventLog";
export default function DashSchedule() {
  const upcoming: JSX.Element[] = [];
  upcoming_event_data.map((event) => {
    upcoming.push(<EventLog event={event} />);
  });
  return (
    <div>
      <h2 className="text-md  font-bold text-orange-500">Upcoming Events:</h2>
    <ul className="hide-scrollbar mt-1 h-48 overflow-scroll rounded-md bg-zinc-800 px-4 py-2">
        {upcoming?.map((event) => event)}
      </ul>
    </div>
  );
}
