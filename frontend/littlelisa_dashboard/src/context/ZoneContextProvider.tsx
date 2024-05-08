import React, { createContext, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

export interface ZoneContextType {
  setZonePosition: (position: Vector3 | null) => void;
  zonePosition: Vector3 | null;
  setZoneSquarePosition: (position: Vector3 | null) => void;
  zoneSquarePosition: Vector3 | null;
  zoneId: number;
  setZoneId: (id: number) => void;
  inZone: boolean;
  setInZone: (value: boolean) => void;
  zoneSquareSelected: React.MutableRefObject<boolean>;
}

type ZoneContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue: ZoneContextType = {
  setZonePosition: () => {},
  zonePosition: null,
  setZoneSquarePosition: () => {},
  zoneSquarePosition: null,
  zoneId: 0,
  setZoneId: () => {},
  inZone: false,
  setInZone: () => {},

  zoneSquareSelected: { current: false },
};

export const ZoneContext = createContext<ZoneContextType>(defaultContextValue);

export default function ZoneContextProvider({
  children,
}: ZoneContextProviderProps) {
  const [zonePosition, setZonePosition] = useState<Vector3 | null>(null);
  const [zoneSquarePosition, setZoneSquarePosition] = useState<Vector3 | null>(
    null,
  );
  const [inZone, setInZone] = useState<boolean>(false);
  const zoneSquareSelected = useRef<boolean>(false);
  const [zoneId, setZoneId] = useState(0);
  useEffect(() => {
    console.log("Zone ID updated to:", zoneId);
  }, [zoneId]);
  return (
    <ZoneContext.Provider
      value={{
        setZonePosition,
        zonePosition,
        zoneId,
        zoneSquarePosition,

        zoneSquareSelected,
        setZoneSquarePosition,
        setZoneId,
        setInZone,
        inZone,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
}
