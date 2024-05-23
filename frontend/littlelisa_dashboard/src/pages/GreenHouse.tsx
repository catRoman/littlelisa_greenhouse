import { Canvas } from "@react-three/fiber";

import GreenHouseModel from "../components/greenhouse/greenhouse_render/GreenHouseModel";
import { GreenHouseContext } from "../context/GreenHouseContextProvider";
import { useContext, useEffect, useState } from "react";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import TitleSection from "../components/greenhouse/TitleSection";
import SectionBody from "../components/greenhouse/SectionBody";
import EventsSection from "../components/greenhouse/EventsSection";
import OverviewSection from "../components/greenhouse/OverviewSection";
import NotesSection from "../components/greenhouse/NotesSection";
import { GreenHouseViewState } from "../../types/enums";
import { GreenhouseData } from "../../types/common";

export default function GreenHouse() {
  const {
    fetchedGreenhouseData,
    setFetchedGreenhouseData,
    selectedZoneId,
    setSelectedZoneId,
    inZone,
    setSelectedSquareId,
    zoneSquareSelected,
    enableControls,
    setCurrentCameraProperties,
    viewState,
    setViewState,
  } = useContext(GreenHouseContext);

  const [greenHouseData, setGreenHouseData] = useState<GreenhouseData>({});

  useEffect(() => {
    const fetchGreenHouseData = async () => {
      const url = "/api/users/1/greenhouses/1";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFetchedGreenhouseData(data);
        setGreenHouseData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    const fetchZoneData = async () => {
      const url = `/api/users/1/greenhouses/1/zones/${selectedZoneId + 1}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFetchedGreenhouseData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    switch (viewState) {
      case GreenHouseViewState.GreenHouse:
        fetchGreenHouseData();
        break;
      case GreenHouseViewState.Zone:
        fetchZoneData();
    }
  }, [viewState, selectedZoneId, setFetchedGreenhouseData]);

  const zoomOutHandle = () => {
    if (!zoneSquareSelected.current) {
      console.log("greenhouse clicked");
      inZone.current = false;
      enableControls.current = true;
      setSelectedSquareId(null);
      setSelectedZoneId(0);
      setViewState(GreenHouseViewState.GreenHouse);

      setCurrentCameraProperties(initalCameraProperties);
    }
  };
  if (fetchedGreenhouseData) {
    return (
      <div className="mr-4 grid  w-full auto-rows-min  grid-cols-6  gap-6 px-4">
        <div className="col-span-3  ">
          <TitleSection />
        </div>
        <div className="row-span-2 h-96">
          <OverviewSection />
        </div>
        <div className="col-span-2  row-span-2 ">
          <EventsSection />
        </div>
        <div className="z-1 col-span-3 row-span-2 h-96 cursor-pointer overflow-hidden">
          <Canvas onPointerMissed={zoomOutHandle}>
            <GreenHouseModel model_info={greenHouseData!} />
          </Canvas>
        </div>
        <div className="col-span-3 h-16 border">
          {GreenHouseViewState.Plot ? <p>Update</p> : <p>Schedule</p>}
        </div>
        <div className="col-span-4  ">
          <SectionBody />
        </div>
        <div className="col-span-2 ">
          <NotesSection />
        </div>
      </div>
    );
  } else {
    return <h1>loading...</h1>;
  }
}
