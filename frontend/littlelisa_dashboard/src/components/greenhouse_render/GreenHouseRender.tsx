import { useEffect, useRef } from "react";
//import ascii_ball from "../data/three_renders/test";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

type GreenHouseRenderProps = {
  cssClass: string;
};

export default function GreenHouseRender({ cssClass }: GreenHouseRenderProps) {
  const renderContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //react div container setup
    const container = renderContainer.current;

    //axis helper
    const axisHelper = new THREE.AxesHelper(10);
    //set up camer
    const camera = new THREE.PerspectiveCamera(
      75, //perspective in degrees
      container!.offsetWidth / container!.offsetHeight,
      0.1, //near clipping
      1000, //far clipping
    );
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    //set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(24, 24, 27)");

    //create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container!.offsetWidth, container!.offsetHeight);
    container!.appendChild(renderer.domElement);
    const controls = new TrackballControls(camera, renderer.domElement);
    //===========
    //create model geometry
    //===========
    //+++++++++
    // material
    //++++++++
    const box_material = new THREE.MeshBasicMaterial({
      color: 0x000ff,
      wireframe: true,
    });

    //++++++++
    //geometry
    //+++++++++
    const greenhouse_geometery = new THREE.BoxGeometry(12, 16, 0);
    const zone1_geometry = new THREE.BoxGeometry(4, 6, 1.5);
    const zone2_geometry = new THREE.BoxGeometry(4, 6, 3);
    const zone3_geometry = new THREE.BoxGeometry(4, 8, 1.5);
    const zone4_geometry = new THREE.BoxGeometry(4, 1, 2);

    //+++++++++++++++++++
    // Combine model with material-> meshes
    //+++++++++++++++++++
    const greenhouse_plot = new THREE.Mesh(greenhouse_geometery, box_material);
    const zone1_plot = new THREE.Mesh(zone1_geometry, box_material);
    const zone2_plot = new THREE.Mesh(zone2_geometry, box_material);
    const zone3_plot = new THREE.Mesh(zone3_geometry, box_material);
    const zone4_plot = new THREE.Mesh(zone4_geometry, box_material);

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

    zone1_plot.position.set(-4, -5, 0.75);
    zone2_plot.position.set(-4, 1, 1.5);
    zone3_plot.position.set(4, -3, 0.75);
    zone4_plot.position.set(0, 7.5, 1);

    // greenhouse_zone_group.rotation.x = -1;
    // greenhouse_zone_group.rotation.z = -7;
    //greenhouse_zone_group.rotation.z = Math.PI;

    // greenhouse_plot.rotation.x = 2;
    // zone1_plot.rotation.x = 2;
    // zone2_plot.rotation.x = 2;
    // zone3_plot.rotation.x = 2;
    // zone4_plot.rotation.x = 2;
    //positioning
    camera.position.z = 20; //move the camera away form 0,0,0,
    // camera.rotateX(90);

    //==================
    //add model to scene
    //===================
    scene.add(greenhouse_zone_group);
    // scene.add(greenhouse_plot);
    // scene.add(zone1_plot);
    // scene.add(zone2_plot);
    // scene.add(zone3_plot);
    // scene.add(zone4_plot);
    scene.add(axisHelper);

    //animate
    animate();

    if (container) {
      window.addEventListener("resize", () => onWindowResize(container));
    }

    function onWindowResize(container: HTMLDivElement) {
      camera.aspect = container.clientWidth / container.clientHeight;
      //camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(container.clientWidth, container.clientHeight);
      //renderer.setSize(window.innerWidth, window.innerHeight);
      // effect.setSize(container.clientWidth, container.clientHeight);
      //effect.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      // greenhouse_plot.rotation.z += 0.01;
      render();
    }
    function render() {
      controls.update();
      renderer.render(scene, camera);
    }
  }, []);

  return <div className={cssClass} ref={renderContainer}></div>;
}
