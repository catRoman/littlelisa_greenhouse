import { useEffect, useRef } from "react";
//import ascii_ball from "../data/three_renders/test";
import * as THREE from "three";

type GreenHouseRenderProps = {
  cssClass: string;
};

export default function GreenHouseRender({ cssClass }: GreenHouseRenderProps) {
  const renderContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //react div container setup
    const container = renderContainer.current;

    //set up camer
    const camera = new THREE.PerspectiveCamera(
      75, //perspective in degrees
      container!.offsetWidth / container!.offsetHeight,
      0.1, //near clipping
      1000, //far clipping
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    //set up scene
    const scene = new THREE.Scene();

    //create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container!.offsetWidth, container!.offsetHeight);
    container!.appendChild(renderer.domElement);

    //create model
    const x_material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const y_material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const z_material = new THREE.LineBasicMaterial({ color: 0x00ffff });

    const x_points = [];
    x_points.push(new THREE.Vector3(0, 0, 0));
    x_points.push(new THREE.Vector3(10, 0, 0));
    const x_geometry = new THREE.BufferGeometry().setFromPoints(x_points);

    const y_points = [];
    y_points.push(new THREE.Vector3(0, 0, 0));
    y_points.push(new THREE.Vector3(0, 10, 0));
    const y_geometry = new THREE.BufferGeometry().setFromPoints(y_points);

    const z_points = [];
    z_points.push(new THREE.Vector3(0, 0, 0));
    z_points.push(new THREE.Vector3(0, 0, 10));
    const z_geometry = new THREE.BufferGeometry().setFromPoints(z_points);

    const x_line = new THREE.Line(x_geometry, x_material);
    const y_line = new THREE.Line(y_geometry, y_material);
    const z_line = new THREE.Line(z_geometry, z_material);

    //add model to scene
    scene.add(x_line); //everything gets set to 0,0,0
    scene.add(y_line); //everything gets set to 0,0,0
    scene.add(z_line); //everything gets set to 0,0,0

    //positioning
    camera.position.z = 50; //move the camera away form 0,0,0,

    //animate
    animate();
    function animate() {
      requestAnimationFrame(animate);
      x_line.rotation.x += 0.01;
      x_line.rotation.y += 0.01;
      y_line.rotation.x += 0.01;
      y_line.rotation.y += 0.01;
      z_line.rotation.x += 0.01;
      z_line.rotation.y += 0.01;

      renderer.render(scene, camera);
    }
  }, []);

  return <div className={cssClass} ref={renderContainer}></div>;
}
