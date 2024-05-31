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

import ControlPanel from "../components/greenhouse/ControlPanel";

export default function GreenHouse() {
  const {
    setSelectedZoneNumber,
    inZone,
    setSelectedSquareId,
    zoneSquareSelected,
    enableControls,
    setCurrentCameraProperties,
    setFetchedGreenhouseData,
    setViewState,
    refreshGreenhouseData,
  } = useContext(GreenHouseContext);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGreenHouseData = async () => {
      const url = "/api/users/1/greenhouses/1/flatGreenhouseData";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setFetchedGreenhouseData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGreenHouseData();
  }, [setFetchedGreenhouseData, refreshGreenhouseData]);

  const zoomOutHandle = () => {
    if (!zoneSquareSelected.current) {
      console.log("greenhouse clicked");
      inZone.current = false;
      enableControls.current = true;
      setSelectedSquareId(null);
      setSelectedZoneNumber(0);
      setViewState(GreenHouseViewState.GreenHouse);

      setCurrentCameraProperties(initalCameraProperties);
    }
  };

  // if (loading) {
  //   return
  // }

  return (
    <div className=" mr-4  grid w-full  auto-rows-min  grid-cols-6 gap-6 px-4">
      <div className="col-span-3  ">
        <TitleSection />
      </div>
      <div className=" row-span-4">
        <OverviewSection />
      </div>
      <div className="col-span-2  row-span-2 ">
        <EventsSection />
      </div>
      <div className="z-1 col-span-3 h-96 cursor-pointer overflow-hidden">
        {loading ? (
          <div className="m-auto flex ">Loading...</div>
        ) : (
          <Canvas onPointerMissed={zoomOutHandle}>
            <GreenHouseModel />
          </Canvas>
        )}
      </div>

      <div className="col-span-3 row-span-2   ">
        <ControlPanel />
      </div>

      <div className="col-span-2 row-span-3">
        <NotesSection />
      </div>
      <div className="col-span-4  ">
        <SectionBody />
      </div>
    </div>
  );
}
