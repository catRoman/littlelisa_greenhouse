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
import CameraContainer from "../components/greenhouse/CameraContainer";
import { useLocation } from "react-router-dom";

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

  const location = useLocation();

  useEffect(() => {
    // Force the component to update each time the location changes
    // This can help in reinitializing the component when you navigate back to it
  }, [location]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-2 mr-4  grid w-full  auto-rows-min  grid-cols-4 gap-6 px-4">
        <div className="col-span-3  ">
          <TitleSection />
        </div>
        <div className=" row-span-4">
          <OverviewSection />
        </div>

        <div className="z-1 col-span-3 row-span-2 h-96 cursor-pointer overflow-hidden">
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
        <div className="col-span-4  ">
          <SectionBody />
        </div>
      </div>

      <div className=" flex flex-col gap-6 pr-4">
        <div className="col-span-2 row-span-2">
          <CameraContainer src={"/api/users/1/greenhouses/1/cam/mainStream"} />
          {/* <CamStream /> */}
        </div>
        <div className=" col-span-2 row-span-1 ">
          <EventsSection />
        </div>

        <div className="col-span-2 row-span-3">
          <NotesSection />
        </div>
      </div>
    </div>
  );
}
