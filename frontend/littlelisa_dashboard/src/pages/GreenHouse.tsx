import { Canvas } from "@react-three/fiber";
import GreenHouseRender from "../components/greenhouse_render/GreenHouseRender";
export default function GreenHouse() {
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
        {/* <GreenHouseRender cssClass="h-96" /> */}
        <Canvas
          orthographic
          camera={{
            //fov: 35,
            zoom: 25,
            near: 0.1,
            far: 200,
            position: [15, 15, 15],
          }}
        >
          <GreenHouseRender />
        </Canvas>
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
