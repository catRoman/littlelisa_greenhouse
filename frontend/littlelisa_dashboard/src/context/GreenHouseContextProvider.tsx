import React, { createContext, useRef, useState } from "react";
import { CameraSettings, SquareId } from "../../types/common";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import { GreenHouseViewState } from "../../types/enums";
export interface GreenHouseContextType {
  //state
  currentCameraProperties: CameraSettings;
  setCurrentCameraProperties: (currentSettings: CameraSettings) => void;

  selectedSquareId: SquareId | null;
  setSelectedSquareId: (position: SquareId | null) => void;
  selectedZoneId: number;
  setSelectedZoneId: (value: number) => void;
  //ref
  previousCameraProperties: React.MutableRefObject<CameraSettings>;
  inZone: React.MutableRefObject<boolean>;
  zoneSquareSelected: React.MutableRefObject<boolean>;
  enableControls: React.MutableRefObject<boolean>;
  viewState: GreenHouseViewState;
  setViewState: (value: GreenHouseViewState) => void;
}

type GreenHouseContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue: GreenHouseContextType = {
  //state
  selectedSquareId: null,
  setSelectedSquareId: () => {},
  setCurrentCameraProperties: () => {},
  currentCameraProperties: initalCameraProperties,
  viewState: GreenHouseViewState.GreenHouse,
  setViewState: () => {},

  //refs
  previousCameraProperties: { current: initalCameraProperties },
  setSelectedZoneId: () => {},
  selectedZoneId: 0,
  enableControls: { current: true },
  inZone: { current: false },
  zoneSquareSelected: { current: false },
};

export const GreenHouseContext =
  createContext<GreenHouseContextType>(defaultContextValue);

export default function GreenHouseContextProvider({
  children,
}: GreenHouseContextProviderProps) {
  const [currentCameraProperties, setCurrentCameraProperties] =
    useState<CameraSettings>(initalCameraProperties);

  const [selectedSquareId, setSelectedSquareId] = useState<SquareId | null>(
    null,
  );
  const previousCameraProperties = useRef<CameraSettings>(
    initalCameraProperties,
  );
  const enableControls = useRef<boolean>(true);
  const inZone = useRef<boolean>(false);
  const zoneSquareSelected = useRef<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(0);
  const [viewState, setViewState] = useState<GreenHouseViewState>(
    GreenHouseViewState.GreenHouse,
  );

  return (
    <GreenHouseContext.Provider
      value={{
        viewState,
        setViewState,
        selectedZoneId,
        setSelectedZoneId,
        previousCameraProperties,
        currentCameraProperties,
        setCurrentCameraProperties,
        zoneSquareSelected,
        inZone,
        enableControls,
        selectedSquareId,
        setSelectedSquareId,
      }}
    >
      {children}
    </GreenHouseContext.Provider>
  );
}