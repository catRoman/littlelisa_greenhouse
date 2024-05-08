import React, { createContext, useEffect, useState } from "react";
import { Vector3 } from "three";
import { SquareId } from "../../types/common";

export interface SquareContextType {
  clickSelected: boolean;
  isClickable: boolean;
  setIsClickable: (clickable: boolean) => void;
  setClickSelected: (clicked: boolean) => void;
  selectedObjectId: number | null | undefined;
  setSelectedObjectId: (objId: number | null | undefined) => void;
  selectedSquarePos: Vector3 | null;
  setSelectedSquarePos: (position: Vector3 | null) => void;
  selectedSquareId: SquareId | null;
  setSelectedSquareId: (position: SquareId | null) => void;
}

type SquareContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue: SquareContextType = {
  selectedSquareId: null,
  setSelectedSquareId: () => {},
  isClickable: true,
  setIsClickable: () => {},
  clickSelected: false,
  setClickSelected: () => {},
  selectedObjectId: null,
  setSelectedObjectId: () => {},
  selectedSquarePos: null,
  setSelectedSquarePos: () => {},
};

export const SquareContext =
  createContext<SquareContextType>(defaultContextValue);

export default function SquareContextProvider({
  children,
}: SquareContextProviderProps) {
  const [isClickable, setIsClickable] = useState(true);
  const [selectedSquareId, setSelectedSquareId] = useState<SquareId | null>(
    null,
  );
  const [clickSelected, setClickSelected] = useState<boolean>(false);
  const [selectedObjectId, setSelectedObjectId] = useState<
    number | null | undefined
  >();
  const [selectedSquarePos, setSelectedSquarePos] = useState<Vector3 | null>(
    null,
  );
  useEffect(() => {
    // console.log("clickable? ", isClickable);
    // console.log("clickselected:", clickSelected);
    console.log("selected squareId:", selectedSquareId);
    // console.log("ObjectId", selectedObjectId);
    // console.log("");
  }, [selectedSquareId]);

  return (
    <SquareContext.Provider
      value={{
        selectedSquareId,
        setSelectedSquareId,
        isClickable,
        setIsClickable,
        clickSelected,
        setClickSelected,
        selectedObjectId,
        setSelectedObjectId,
        selectedSquarePos,
        setSelectedSquarePos,
      }}
    >
      {children}
    </SquareContext.Provider>
  );
}
