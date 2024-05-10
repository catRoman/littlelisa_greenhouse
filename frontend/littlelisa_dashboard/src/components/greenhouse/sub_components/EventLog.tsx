type GreenHouseEvent = {
  event: string;
  timestamp: string;
  action: string;
  zone: string;
};
type EventLogProps = {
  event: GreenHouseEvent;
};
export default function EventLog({ event }: EventLogProps) {
  return (
    <div className="mb-[0.5] flex justify-between">
      <div>
        <p>
          <span className="font-bold">Zone: </span>
          <span>{event.zone} - </span>
          <span>
            {event.event === "lights" ? (
              <span className="font-bold  text-purple-300">{event.event} </span>
            ) : event.event === "fans" ? (
              <span className="font-bold text-yellow-300">{event.event} </span>
            ) : event.event === "water" ? (
              <span className="font-bold text-blue-300">{event.event} </span>
            ) : (
              <span className="font-bold text-lime-300">{event.event} </span>
            )}
            -
            {event.action === "on" ? (
              <span className="text-green-300"> {event.action}</span>
            ) : (
              <span className="text-red-300"> {event.action}</span>
            )}
          </span>
        </p>
      </div>
      <div>
        <span>{event.timestamp}</span>
      </div>
    </div>
  );
}
