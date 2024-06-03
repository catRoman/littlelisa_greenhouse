import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CameraSettings,
  EnvState,
  GreenhouseData,
  Node,
  Plot,
  Sensor,
  SquareId,
} from "../../types/common";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import { GreenHouseViewState } from "../../types/enums";
export interface GreenHouseContextType {
  //state
  translateZone: number | null;
  setTranslateZone: (zone: number | null) => void;
  envCntrlStates: EnvState[];
  setEnvCntrlStates: (state: EnvState[]) => void;
  unassignedSensorList: Sensor[];
  addUnassignedSensor: (sensor: Sensor) => void;
  unassignedNodeList: Node[];
  addUnassignedNode: (sensor: Node) => void;
  refreshEnvCntrlList: boolean;
  setRefreshEnvCntrlList: (refresh: boolean) => void;
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
  selectedZoneNumber: number;
  setSelectedZoneNumber: (value: number) => void;
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
  translateZone: null,
  setTranslateZone: () => {},
  envCntrlStates: [],
  setEnvCntrlStates: () => {},
  unassignedSensorList: [],
  addUnassignedSensor: () => {},
  unassignedNodeList: [],
  addUnassignedNode: () => {},
  refreshEnvCntrlList: false,
  setRefreshEnvCntrlList: () => {},
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
  setSelectedZoneNumber: () => {},
  selectedZoneNumber: 0,
  enableControls: { current: true },
  inZone: { current: false },
  zoneSquareSelected: { current: false },
};

export const GreenHouseContext =
  createContext<GreenHouseContextType>(defaultContextValue);

export default function GreenHouseContextProvider({
  children,
}: GreenHouseContextProviderProps) {
  const [envCntrlStates, setEnvCntrlStates] = useState<EnvState[]>([]);
  const [unassignedSensorList, setUnassignedSensorList] = useState<Sensor[]>(
    [],
  );

  const [translateZone, setTranslateZone] = useState<number | null>(null);
  const [unassignedNodeList, setUnassignedNodeList] = useState<Node[]>([]);
  const [refreshNoteList, setRefreshNoteList] = useState<boolean>(true);
  const [currentCameraProperties, setCurrentCameraProperties] =
    useState<CameraSettings>(initalCameraProperties);

  const [refreshGreenhouseData, setRefreshGreenhouseData] =
    useState<boolean>(false);
  const [refreshEnvCntrlList, setRefreshEnvCntrlList] =
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
  const [selectedZoneNumber, setSelectedZoneNumber] = useState<number>(0);
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
            plot.zone_number === selectedZoneNumber &&
            plot.row ===
              selectedSquareId.y +
                fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point
                  .y &&
            plot.col ===
              selectedSquareId.x +
                fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point
                  .x
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
  }, [selectedSquareId, selectedZoneNumber, fetchedGreenhouseData]);

  const addUnassignedSensor = useCallback((sensor: Sensor) => {
    setUnassignedSensorList((prevList) => [...prevList, sensor]);
    console.log(`unasigned sensor added: `, sensor);
  }, []);

  const addUnassignedNode = useCallback((node: Node) => {
    setUnassignedNodeList((prevList) => [...prevList, node]);
    console.log(`unasigned node added: `, node);
  }, []);

  useEffect(() => {
    console.log("data fetched: ", fetchedGreenhouseData);
    setUnassignedNodeList([]);
    if (fetchedGreenhouseData?.zones[0].sensors) {
      fetchedGreenhouseData.zones[0].sensors.forEach((sensor) => {
        if (
          sensor.zn_rel_pos &&
          sensor.zn_rel_pos?.x <= 0 &&
          sensor.zn_rel_pos?.y <= 0 &&
          sensor.zn_rel_pos?.z <= 0
        ) {
          addUnassignedSensor(sensor);
        }
      });
    }
    if (fetchedGreenhouseData?.zones[0].nodes) {
      fetchedGreenhouseData.zones[0].nodes.forEach((node) => {
        if (
          node.zn_rel_pos &&
          node.zn_rel_pos?.x <= 0 &&
          node.zn_rel_pos?.y <= 0 &&
          node.zn_rel_pos?.z <= 0
        ) {
          addUnassignedNode(node);
        }
      });
    }
  }, [fetchedGreenhouseData, addUnassignedSensor, addUnassignedNode]);

  return (
    <GreenHouseContext.Provider
      value={{
        translateZone,
        setTranslateZone,
        envCntrlStates,
        setEnvCntrlStates,
        unassignedNodeList,
        addUnassignedNode,
        unassignedSensorList,
        addUnassignedSensor,
        refreshEnvCntrlList,
        setRefreshEnvCntrlList,
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
        selectedZoneNumber,
        setSelectedZoneNumber,
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
