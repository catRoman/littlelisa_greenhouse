import React, { createContext, useContext, useState } from "react";
import { GreenHouseContext } from "./GreenHouseContextProvider";
import { GreenHouseViewState } from "../../types/enums";

export interface ControlPanelClearContextType {
  //state
  eraseNotesCheck: boolean;
  setEraseNotesCheck: (ceck: boolean) => void;
  emptyCheck: boolean;
  setEmptyCheck: (check: boolean) => void;
  eraseNotesHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

type ControlPanelClearContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue: ControlPanelClearContextType = {
  //state
  eraseNotesCheck: false,
  setEraseNotesCheck: () => {},
  emptyCheck: false,
  setEmptyCheck: () => {},
  eraseNotesHandler: () => {},
};
export const ControlPanelClearContext =
  createContext<ControlPanelClearContextType>(defaultContextValue);

export default function ControlPanelClearContextProvider({
  children,
}: ControlPanelClearContextProviderProps) {
  const [eraseNotesCheck, setEraseNotesCheck] = useState<boolean>(false);
  const [emptyCheck, setEmptyCheck] = useState<boolean>(false);

  const {
    viewState,
    fetchedGreenhouseData,
    setRefreshNoteList,
    refreshNoteList,
    selectedPlot,
    selectedZoneNumber,
  } = useContext(GreenHouseContext);

  const deleteAllPlotNotes = async () => {
    const { user_id, greenhouse_id } = fetchedGreenhouseData!;

    let url;
    switch (viewState) {
      case GreenHouseViewState.GreenHouse:
        url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/notes`;
        break;

      case GreenHouseViewState.Zone:
        url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/notes`;
        break;
      case GreenHouseViewState.Plot:
        url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/squares/${selectedPlot?.square_db_id}/notes`;
        break;
    }
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      setRefreshNoteList(!refreshNoteList);
      console.log("erses");

      console.log(responseData);
    } catch (error) {
      console.log(error);
    }
  };

  const eraseNotesHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    deleteAllPlotNotes();
    setEraseNotesCheck(!eraseNotesCheck);
  };

  return (
    <ControlPanelClearContext.Provider
      value={{
        eraseNotesCheck,
        setEraseNotesCheck,
        emptyCheck,
        setEmptyCheck,
        eraseNotesHandler,
      }}
    >
      {children}
    </ControlPanelClearContext.Provider>
  );
}
