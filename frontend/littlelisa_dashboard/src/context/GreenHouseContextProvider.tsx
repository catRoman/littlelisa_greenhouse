import React, { createContext, useEffect, useRef, useState } from "react";
import { CameraSettings, Plot, SquareId } from "../../types/common";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import { GreenHouseViewState } from "../../types/enums";
import { square_data } from "../data/mock_json/square_data";
export interface GreenHouseContextType {
  //state
  currentCameraProperties: CameraSettings;
  setCurrentCameraProperties: (currentSettings: CameraSettings) => void;
  setSelectedPlant: (plant: string) => void;
  selectedPlant: string;
  selectedSquareId: SquareId | null;
  setSelectedSquareId: (position: SquareId | null) => void;
  selectedZoneId: number;
  setSelectedZoneId: (value: number) => void;
  selectedPlot: Plot | undefined;
  setSelectedPlot: (plot: Plot | undefined) => void;
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
  setSelectedPlant: () => {},
  selectedPlant: "",
  selectedPlot: undefined,
  setSelectedPlot: () => {},

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
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [selectedPlot, setSelectedPlot] = useState<Plot>();
  useEffect(() => {
    setSelectedPlot(
      square_data.find((plot) => {
        if (
          plot.zone_id === selectedZoneId &&
          plot.row - 1 === selectedSquareId?.y &&
          plot.column - 1 === selectedSquareId?.x
        ) {
          if (plot.plant_type !== undefined && !plot.is_empty) {
            setSelectedPlant(plot.plant_type);
          } else {
            setSelectedPlant("");
          }
          return plot;
        }
      }),
    );
  }, [selectedSquareId, selectedZoneId]);

  return (
    <GreenHouseContext.Provider
      value={{
        selectedPlot,
        setSelectedPlot,
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
        setSelectedPlant,
        selectedPlant,
      }}
    >
      {children}
    </GreenHouseContext.Provider>
  );
}
