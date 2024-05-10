import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { greenhouse_data } from "../../data/static_info";

export default function TitleSection() {
  const { viewState, selectedZoneId, selectedSquareId } =
    useContext(GreenHouseContext);

  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      return (
        <>
          <h1 className="mb-4 text-2xl">
            Greenhouse &rarr;{" "}
            {greenhouse_data.greenhouse.greenhouse_location_str}
          </h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore
            porro dignissimos voluptatibus recusandae sed excepturi tempore ipsa
            facilis. Fuga tenetur sed enim inventore atque quo laborum
            architecto veniam asperiores reprehenderit.
          </p>
        </>
      );

    case GreenHouseViewState.Zone:
      return (
        <>
          <h1 className="mb-4 text-2xl">Zone {selectedZoneId}</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore
            porro dignissimos voluptatibus recusandae sed excepturi tempore ipsa
            facilis. Fuga tenetur sed enim inventore atque quo laborum
            architecto veniam asperiores reprehenderit.
          </p>
        </>
      );
    case GreenHouseViewState.Plot:
      return (
        <>
          <h1 className="mb-4 text-2xl">
            Plot {selectedSquareId!.x}-{selectedSquareId!.y}
          </h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore
            porro dignissimos voluptatibus recusandae sed excepturi tempore ipsa
            facilis. Fuga tenetur sed enim inventore atque quo laborum
            architecto veniam asperiores reprehenderit.
          </p>
        </>
      );
  }
}
