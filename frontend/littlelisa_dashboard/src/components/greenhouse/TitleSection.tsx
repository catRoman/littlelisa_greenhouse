import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { greenhouse_data } from "../../data/static_info";
import { square_data } from "../../data/mock_json/square_data";

export default function TitleSection() {
  const { viewState, selectedZoneId, selectedSquareId } =
    useContext(GreenHouseContext);

  let header = "";
  let description = "";

  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      header = `GreenHouse Overview`;
      description = `Just some crap about using the greenhouse model maybe not sure`;
      break;

    case GreenHouseViewState.Zone:
      header = `Zone ${selectedZoneId} \u2192 ${greenhouse_data.zones[selectedZoneId - 1].name}`;
      description = `${greenhouse_data.zones[selectedZoneId - 1].description}`;
      break;
    case GreenHouseViewState.Plot:
      header = `Plot ${selectedSquareId!.x}-${selectedSquareId!.y}`;
      description = `tool time or quote maybe`;
      break;
  }

  return (
    <>
      <h1 className="mb-4 text-2xl">{header}</h1>
      <p className=" ">{description}</p>
    </>
  );
}
