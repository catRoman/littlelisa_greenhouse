import { Canvas } from "@react-three/fiber";
import { greenhouse_data } from "../data/static_info";
import GreenHouseModel from "../components/greenhouse/greenhouse_render/GreenHouseModel";
import { GreenHouseContext } from "../context/GreenHouseContextProvider";
import { useContext } from "react";
import { initalCameraProperties } from "../components/greenhouse/greenhouse_render/render_components/data/zoneCameras";
import TitleSection from "../components/greenhouse/TitleSection";
import SectionBody from "../components/greenhouse/SectionBody";
import EventsSection from "../components/greenhouse/EventsSection";
import OverviewSection from "../components/greenhouse/OverviewSection";
import NotesSection from "../components/greenhouse/NotesSection";
import { GreenHouseViewState } from "../../types/enums";

export default function GreenHouse() {
  const {
    setSelectedZoneId,
    inZone,
    setSelectedSquareId,
    zoneSquareSelected,
    enableControls,
    setCurrentCameraProperties,
    setViewState,
  } = useContext(GreenHouseContext);
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
          <GreenHouseModel model_info={greenhouse_data} />
        </Canvas>
      </div>
      <div className="col-span-3 h-24 border">
        <p>Schedule</p>
      </div>
      <div className="col-span-4  ">
        <SectionBody />
      </div>
      <div className="col-span-2 border">
        <NotesSection />
      </div>
    </div>
  );
}
