import { useEffect, useRef } from "react";
import from "addon"
import * as THREE from "three";

type GreenHouseRenderProps = {
  cssClass: string;
};

export default function GreenHouseRender({ cssClass }: GreenHouseRenderProps) {
  const renderContainer = useRef<HTMLDivElement>(null);
  const previousTimeRef = useRef<number>(performance.now());
  const camera = useRef<THREE.OrthographicCamera | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    //react div container setup
    const container = renderContainer.current;

    const size = {
      height: container!.clientHeight,
      width: container!.clientWidth,
    };

    container?.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      const coord = {
        x: (event.clientX - rect.left) / size.width - 0.5,
        y: (event.clientY - rect.top) / size.height - 0.5,
      };

      mousePos.current = coord;

      console.log(`x: ${mousePos.current.x}`);
      console.log(`y: ${mousePos.current.y}`);
    });

    //axis helper
    const axisHelper = new THREE.AxesHelper(1000);

    const aspectRatio = size.width / size.height;
    camera.current = new THREE.OrthographicCamera(
      -100 * aspectRatio,
      100 * aspectRatio,
      100,
      -100,
      0.1,
      1000,
    );

    //set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(24, 24, 27)");

    //create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size.width, size.height);
    container!.appendChild(renderer.domElement);

    //++++++++++++++++++++++++++++++
    // Combine model with material-> meshes
    //+++++++++++++++++++
    const greenhouse_plot = new THREE.Mesh(
      new THREE.BoxGeometry(120, 160, 0),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
      }),
    );
    const zone1_plot = new THREE.Mesh(
      new THREE.BoxGeometry(40, 60, 15),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      }),
    );
    const zone2_plot = new THREE.Mesh(
      new THREE.BoxGeometry(40, 60, 30),
      new THREE.MeshBasicMaterial({
        color: 0x00ff,
        wireframe: true,
      }),
    );
    const zone3_plot = new THREE.Mesh(
      new THREE.BoxGeometry(40, 80, 15),
      new THREE.MeshBasicMaterial({
        color: 0xf0ff,
        wireframe: true,
      }),
    );
    const zone4_plot = new THREE.Mesh(
      new THREE.BoxGeometry(40, 10, 20),
      new THREE.MeshBasicMaterial({
        color: 0xaaaa0a,
        wireframe: true,
      }),
    );

    //==========
    // group
    //==========

    const greenhouse_zone_group = new THREE.Group();
    greenhouse_zone_group.add(greenhouse_plot);
    greenhouse_zone_group.add(zone1_plot);
    greenhouse_zone_group.add(zone2_plot);
    greenhouse_zone_group.add(zone3_plot);
    greenhouse_zone_group.add(zone4_plot);
    //++++++++++++++
    // position/scale/rotation
    //+++++++++++++

    //  box.scale.set(12, 16, 0);

    zone1_plot.position.set(-40, -50, 7.5);
    zone2_plot.position.set(-40, 10, 15);
    zone3_plot.position.set(40, -30, 7.5);
    zone4_plot.position.set(0, 75, 10);

    //==================
    //add model to scene
    //===================
    // scene.add(axisHelper);
    scene.add(camera.current);
    scene.add(greenhouse_zone_group);

    //==============
    //Position
    //===============
    greenhouse_zone_group.rotation.x = -(Math.PI / 2);
    camera.current.position.set(500, 500, 500);
    //animate
    camera.current.lookAt(0, 0, 0);

    tick();

    //animate
    function tick() {
      // delta time for react
      const currTime = performance.now();
      const deltaTime = (currTime - previousTimeRef.current) / 100;
      previousTimeRef.current = currTime;
      requestAnimationFrame(tick);

      //greenhouse_zone_group.rotation.z += ((Math.PI / 4) * deltaTime) / 100; // Rotate around the x-axis (z-x plane)

      if (mousePos.current.y >= 0.45 || mousePos.current.x >= 0.45) {
        greenhouse_zone_group.rotation.z += ((Math.PI / 4) * deltaTime) / 75;
      } else if (mousePos.current.y <= -0.45 || mousePos.current.x <= -0.45) {
        greenhouse_zone_group.rotation.z -= ((Math.PI / 4) * deltaTime) / 75;
      } 
      // else if (mousePos.current.x != 0 || mousePos.current.y != 0) {
      //   camera.current!.position.x = mousePos.current.x * 1000;
      //   // greenhouse_zone_group.rotation.z = Math.sin(
        //   mousePos.current.x * Math.PI * 2,
        // );
        // Math.cos(mousePos.current.x * Math.PI);
        // camera.current!.position.y = Math.abs(mousePos.current.y) * 1000;
        // camera.current!.lookAt(greenhouse_zone_group.position);
      // }

      render();
    }
    function render() {
      renderer.render(scene, camera.current!);
    }
  }, []);

  return <div className={cssClass} ref={renderContainer}></div>;
}
