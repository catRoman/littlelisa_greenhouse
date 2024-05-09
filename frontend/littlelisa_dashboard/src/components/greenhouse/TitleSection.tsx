import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";

export default function TitleSection() {
  const { viewState } = useContext(GreenHouseContext);

  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      return (
        <>
          <h1 className="mb-4 text-2xl">Greenhouse</h1>
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
          <h1 className="mb-4 text-2xl">Zone</h1>
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
          <h1 className="mb-4 text-2xl">Square</h1>
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
