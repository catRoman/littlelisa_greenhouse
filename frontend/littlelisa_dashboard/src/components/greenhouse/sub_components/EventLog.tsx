import { format, parseISO } from "date-fns";
import { EventLog as EventLogType } from "../../../../types/common";
import { useContext } from "react";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { GreenHouseViewState } from "../../../../types/enums";

type EventLogProps = {
  event: EventLogType;
};
export default function EventLog({ event }: EventLogProps) {
  const timestamp = parseISO(event.created_at);
  const formattedTime = format(timestamp, "MMM dd HH:mm a");
  const { viewState, fetchedGreenhouseData } = useContext(GreenHouseContext);

  const zone_number = fetchedGreenhouseData?.zones.find(
    (zone) => event.zone_id === zone.zone_id,
  )?.zone_number;
  const row = fetchedGreenhouseData?.squares.find(
    (square) => event.square_id === square.square_db_id,
  )?.row;
  const col = fetchedGreenhouseData?.squares.find(
    (square) => event.square_id === square.square_db_id,
  )?.col;
  const squareHeader = `Row: ${row} - Col: ${col}`;
  let sectionHeader;
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      sectionHeader = (
        <>
          <span className="font-bold">
            {event.zone_id && event.zone_id > 0 ? "Zone:" : "Greenhouse"}{" "}
          </span>
          <span>{event.zone_id && event.zone_id ? zone_number : null} - </span>
        </>
      );
      break;

    case GreenHouseViewState.Zone:
      sectionHeader = (
        <>
          <span className="font-bold">
            {event.square_id ? (
              <span className="text-xs">{squareHeader}</span>
            ) : (
              "Zone"
            )}{" "}
            -{" "}
          </span>
        </>
      );

      break;
    case GreenHouseViewState.Plot:
      sectionHeader = null;
      break;
  }

  return (
    <div className="px-4 hover:bg-zinc-700 ">
      <div className="mb-[0.5] flex justify-between ">
        <div>
          <p>
            {sectionHeader}
            <span>
              {event.type.toLowerCase() === "plot" ? (
                <span className="font-bold  text-orange-300">
                  {event.type}{" "}
                </span>
              ) : event.type.toLowerCase() === "light" ? (
                <span className="font-bold  text-purple-300">
                  {event.type}{" "}
                </span>
              ) : event.type.toLowerCase() === "fan" ? (
                <span className="font-bold text-yellow-300">{event.type} </span>
              ) : event.type.toLowerCase() === "note" ? (
                <span className="font-bold text-blue-300">{event.type} </span>
              ) : event.type.toLowerCase() === "node" ? (
                <span className="font-bold text-pink-300">{event.type} </span>
              ) : (
                <span className="font-bold text-lime-300">{event.type} </span>
              )}
              -
              {event.action === "on" ||
              event.action.toLowerCase().includes("added") ||
              event.action.toLowerCase().includes("updated") ? (
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
      <div className="pl-8 text-xs ">
        {event.details! !== "" ? <span>{event.details}</span> : null}
      </div>
    </div>
  );
}
