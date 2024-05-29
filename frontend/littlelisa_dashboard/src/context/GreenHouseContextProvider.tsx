import React, { createContext, useEffect, useRef, useState } from "react";
import {
  CameraSettings,
  GreenhouseData,
  Plot,
  Sensor,
  SquareId,
} from "../../types/common";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import { GreenHouseViewState } from "../../types/enums";
export interface GreenHouseContextType {
  //state
  unassignedSensorList: Sensor[]
  addUnassignedSensor: (sensor: Sensor) => void;
  refreshNoteList: boolean;
  setRefreshNoteList: (refresh: boolean) => void;
  setRefreshGreenhouseData: (refresh: boolean) => void;
  refreshGreenhouseData: boolean;
  fetchedGreenhouseData: GreenhouseData | undefined;
  setFetchedGreenhouseData: (
    fetchedGreenHouseData: GreenhouseData | undefined,
  ) => void;
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
  unassignedSensorList: [],
addUnassignedSensor: () =>{},

  refreshNoteList: false,
  setRefreshNoteList: () => {},
  refreshGreenhouseData: false,
  setRefreshGreenhouseData: () => {},
  fetchedGreenhouseData: undefined,
  setFetchedGreenhouseData: () => {},
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
  const [unassignedSensorList, setUnassignedSensorList] = useState<Sensor[]>([]);
  const [refreshNoteList, setRefreshNoteList] = useState<boolean>(true);
  const [currentCameraProperties, setCurrentCameraProperties] =
    useState<CameraSettings>(initalCameraProperties);

  const [refreshGreenhouseData, setRefreshGreenhouseData] =
    useState<boolean>(false);
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
  const [fetchedGreenhouseData, setFetchedGreenhouseData] =
    useState<GreenhouseData>();
  useEffect(() => {
    if (fetchedGreenhouseData && selectedSquareId) {
      setSelectedPlot(
        fetchedGreenhouseData.squares.find((plot) => {
          if (
            plot.zone_number === selectedZoneId &&
            plot.row ===
              selectedSquareId.y +
                fetchedGreenhouseData.zones[selectedZoneId].zone_start_point
                  .y &&
            plot.col ===
              selectedSquareId.x +
                fetchedGreenhouseData.zones[selectedZoneId].zone_start_point.x
          ) {
            if (plot.plant_type !== null && !plot.is_empty) {
              plot.plant_type && setSelectedPlant(plot.plant_type);
            } else {
              setSelectedPlant("");
            }
            return plot;
          }
        }),
      );
    }
  }, [selectedSquareId, selectedZoneId, fetchedGreenhouseData]);

  useEffect(() => {
    console.log("data fetched: ", fetchedGreenhouseData);
  }, [fetchedGreenhouseData]);

  const addUnassignedSensor = (sensor: Sensor) => {
    setUnassignedSensorList((prevList) => [...prevList, sensor]);
  };

  return (
    <GreenHouseContext.Provider
      value={{
        unassignedSensorList,
        addUnassignedSensor,
        refreshNoteList,
        setRefreshNoteList,
        setRefreshGreenhouseData,
        refreshGreenhouseData,
        fetchedGreenhouseData,
        setFetchedGreenhouseData,
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
