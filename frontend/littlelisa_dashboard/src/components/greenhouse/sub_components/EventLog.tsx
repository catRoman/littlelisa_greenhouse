import {format, parseISO} from 'date-fns'
import { EventLog as EventLogType} from '../../../../types/common';

type EventLogProps = {
  event: EventLogType;
};
export default function EventLog({ event }: EventLogProps) {
  const timestamp = parseISO(event.created_at)
  const formattedTime = format(timestamp, 'MMM dd HH:mm a')

  return (
    <div>

    <div className="mb-[0.5] flex justify-between">
      <div>
        <p>
          <span className="font-bold">{event.zone_id? 'Zone:' : 'Greenhouse'} </span>
          <span>{event.zone_id ? event.zone_id : null}   - </span>
          <span>
            {event.type.toLowerCase() === "light" ? (
              <span className="font-bold  text-purple-300">{event.type} </span>
            ) : event.type.toLowerCase() === "fan" ? (
              <span className="font-bold text-yellow-300">{event.type} </span>
            ) : event.type.toLowerCase() === "note" ? (
              <span className="font-bold text-blue-300">{event.type} </span>
            ) : (
              <span className="font-bold text-lime-300">{event.type} </span>
            )}
            -
            {event.action === "on" || event.action.toLowerCase().includes("added") ? (
              <span className="text-green-300"> {event.action}</span>
            ) : (
              <span className="text-red-300"> {event.action}</span>
            )}
          </span>
        </p>
      </div>
      <div>
        <span>{formattedTime}</span>
      </div>
</div>
<div className='pl-8 text-xs '>

        {event.details ! !== '' ? <span>{event.details}</span> : null}


    </div>
              </div>
  );
}
