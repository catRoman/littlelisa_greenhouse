import { Euler, Vector3 } from "three";
import { CameraSettings } from "../../../../../types/common";

export const zoneCameraViews = [
  //zone 1
  {
    posX: -6,
    posY: 7,
    posZ: 11,
    rotX: -0.5,
    rotY: 0,
    rotZ: 0,
    zoom: 1,
  },
  //zone2
  {
    posX: -3,
    posY: 8,
    posZ: 7,
    rotX: -0.5,
    rotY: 0,
    rotZ: 0,
    zoom: 1,
  },
  //zone3
  {
    posX: 2,
    posY: 6,
    posZ: 14,
    rotX: -0.5,
    rotY: 0,
    rotZ: 0,
    zoom: 1,
  },
  //zone4
  {
    posX: 6,
    posY: 7,
    posZ: 3,
    rotX: -0.5,
    rotY: 0,
    rotZ: 0,
    zoom: 1,
  },
];

export const initalCameraProperties: CameraSettings = {
  fov: 35,
  zoom: 1,
  near: 0.1,
  far: 5000,
  position: new Vector3(0, 10, 16),
  rotation: new Euler(-0.5, 0, 0),
};
