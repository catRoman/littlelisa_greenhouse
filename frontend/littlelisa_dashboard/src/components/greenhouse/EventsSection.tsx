import { useContext, useEffect, useRef, useState } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import {
  upcoming_event_data,
  recent_event_data,
} from "../../data/mock_json/event_data";
import EventLog from "./sub_components/EventLog";
import { EventLog as EventLogType } from "../../../types/common";

export default function EventsSection() {
  const { viewState, selectedZoneId, fetchedGreenhouseData, selectedPlot, envCntrlStates , refreshNoteList} = useContext(GreenHouseContext);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);
  const greenhouseRef = useRef(fetchedGreenhouseData?.greenhouse_id)
  const userRef = useRef(fetchedGreenhouseData?.user_id)
  const [recentEventLog, setRecentEventLog] = useState<EventLogType[]>([]);
  useEffect(()=>{
    greenhouseRef.current = fetchedGreenhouseData?.greenhouse_id;
    userRef.current = fetchedGreenhouseData?.user_id;
  }, [fetchedGreenhouseData])



  const upcoming: JSX.Element[] = [];
  const recent: JSX.Element[] = [];



  useEffect(()=>{
    const fetchEventLog = async () => {
      let url;
      switch (viewState) {
        case GreenHouseViewState.GreenHouse:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/eventLog`;
          break;

        case GreenHouseViewState.Zone:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/zones/${fetchedGreenhouseData?.zones[selectedZoneId].zone_id}/eventLog`;
          break;
        case GreenHouseViewState.Plot:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/squares/${selectedPlot?.square_db_id}/eventLog`;
          break;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const eventLog = await response.json();

        setRecentEventLog(eventLog);
        setLoadingRecent(false);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchEventLog();


  },[selectedZoneId, selectedPlot, viewState, fetchedGreenhouseData, envCntrlStates , refreshNoteList])





     recentEventLog && recentEventLog.map((event) => {
        recent.push(<EventLog event={event} />);
      });


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
        <ul className="flex  flex-col hide-scrollbar mt-1 h-52 overflow-scroll rounded-md bg-zinc-800 py-2">
        {loadingRecent ? <p className="flex m-auto">Loading Recent Events...</p> :
         recent.length > 0 ? recent?.map((event) => event) : <p className="flex m-auto">No recorded events</p>
         }
        </ul>
      </div>
    </div>
  );
}
