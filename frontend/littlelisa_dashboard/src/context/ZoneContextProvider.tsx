import React, { createContext, useState } from "react";
import { Vector3 } from "three";

export interface ZoneContextType {
  setZonePosition: (position: Vector3 | null) => void;
  zonePosition: Vector3 | null;
  zoneId: number;
  setZoneId: (id: number) => void;
}

type ZoneContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue: ZoneContextType = {
  setZonePosition: () => {}, // No-operation function
  zonePosition: null, // Default to null
  zoneId: 0, // Default ID
  setZoneId: () => {}, // No-operation function
};

export const ZoneContext = createContext<ZoneContextType>(defaultContextValue);

export default function ZoneContextProvider({
  children,
}: ZoneContextProviderProps) {
  const [zonePosition, setZonePosition] = useState<Vector3 | null>(null);
  const [zoneId, setZoneId] = useState(0);
  return (
    <ZoneContext.Provider
      value={{ setZonePosition, zonePosition, zoneId, setZoneId }}
    >
      {children}
    </ZoneContext.Provider>
  );
}
