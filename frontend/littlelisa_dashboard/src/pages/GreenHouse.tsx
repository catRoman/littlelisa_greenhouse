import { Canvas } from "@react-three/fiber";
import { greenhouse_data } from "../data/static_info";
import GreenHouseModel from "../components/greenhouse_render/GreenHouseModel";
import ZoneContextProvider, {
  ZoneContext,
} from "../context/ZoneContextProvider";
import { Leva } from "leva";
import { useContext, useEffect, useState } from "react";
import { Euler, Vector3 } from "three";
import { CameraSettings } from "../../types/common";

const initalCameraSettings: CameraSettings = {
  fov: 35,
  zoom: 1,
  near: 0.1,
  far: 5000,
  position: new Vector3(0, 10, 16),
  rotation: new Euler(-0.5, 0, 0),
};

export default function GreenHouse() {
  const [zoneZoom, setZoneZoom] = useState<boolean>(false);
  const [cameraSettings, setCameraSettings] =
    useState<CameraSettings>(initalCameraSettings);
  const { zoneId, setZoneId } = useContext(ZoneContext);

  const zoomOutHandle = () => {
    setCameraSettings(initalCameraSettings);
    setZoneZoom(false);
    console.log("greenhouse clicked");
    setZoneId(0);
  };
  useEffect(() => {
    console.log("zoom: ", zoneZoom);
    console.log("GreenHouse->zoneId: ", zoneId);
  }, [zoneZoom, zoneId]);
  useEffect(() => {
    console.log("greenhouse zoneid:", zoneId);
  }, [zoneId]);
  // useEffect(() => {}, [setCameraSettings]);
  return (
    <div className="mr-4 grid grid-cols-4 gap-6 px-4">
      <div className="col-span-4 ">
        <h1 className="mb-4 text-2xl">Greenhouse</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore porro
          dignissimos voluptatibus recusandae sed excepturi tempore ipsa
          facilis. Fuga tenetur sed enim inventore atque quo laborum architecto
          veniam asperiores reprehenderit.
        </p>
      </div>
      <div className="z-1 col-span-2 h-96 cursor-pointer overflow-hidden">
        <Canvas onPointerMissed={zoomOutHandle}>
          <GreenHouseModel
            model_info={greenhouse_data}
            zoneZoom={zoneZoom}
            setZoneZoom={setZoneZoom}
            cameraSettings={cameraSettings}
            setCameraSettings={setCameraSettings}
          />
        </Canvas>
        <Leva collapsed={false} />
      </div>
      <div className="border">2</div>
      <div className="border">3</div>
      <div className="h-24 border">4</div>
      <div className="border">5</div>
      <div className="border">6</div>
      <div className="border">7</div>
    </div>
  );
}
