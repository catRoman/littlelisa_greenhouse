import { useContext, useEffect, useRef, useState } from "react";
import { GreenHouseViewState } from "../../../../types/enums.js";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider.js";

import EventLog from "../sub_components/EventLog.js";
import { EventLog as EventLogType } from "../../../../types/common.js";

export default function RecentEvents() {
  const {
    viewState,
    selectedZoneNumber,
    fetchedGreenhouseData,
    selectedPlot,
    envCntrlStates,
    refreshNoteList,
  } = useContext(GreenHouseContext);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);
  const greenhouseRef = useRef(fetchedGreenhouseData?.greenhouse_id);
  const userRef = useRef(fetchedGreenhouseData?.user_id);
  const [recentEventLog, setRecentEventLog] = useState<EventLogType[]>([]);

  useEffect(() => {
    greenhouseRef.current = fetchedGreenhouseData?.greenhouse_id;
    userRef.current = fetchedGreenhouseData?.user_id;
  }, [fetchedGreenhouseData]);

  const recent: JSX.Element[] = [];

  useEffect(() => {
    const fetchEventLog = async () => {
      let url;
      switch (viewState) {
        case GreenHouseViewState.GreenHouse:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/eventLog`;
          break;

        case GreenHouseViewState.Zone:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/eventLog`;
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

    switch (viewState) {
      case GreenHouseViewState.GreenHouse:
        if (fetchedGreenhouseData) {
          fetchEventLog();
        }
        break;

      case GreenHouseViewState.Zone:
        if (fetchedGreenhouseData && selectedZoneNumber) {
          fetchEventLog();
        }
        break;
      case GreenHouseViewState.Plot:
        if (fetchedGreenhouseData && selectedZoneNumber && selectedPlot) {
          fetchEventLog();
        }
        break;
    }
  }, [
    selectedZoneNumber,
    selectedPlot,
    viewState,
    fetchedGreenhouseData,
    envCntrlStates,
    refreshNoteList,
  ]);

  recentEventLog &&
    recentEventLog.map((event) => {
      recent.push(<EventLog event={event} />);
    });

  return (
    <ul className="">
      {loadingRecent ? (
        <p className="m-auto flex">Loading Recent Events...</p>
      ) : recent.length > 0 ? (
        recent?.map((event) => event)
      ) : (
        <p className="m-auto flex">No recorded events</p>
      )}
    </ul>
  );
}
