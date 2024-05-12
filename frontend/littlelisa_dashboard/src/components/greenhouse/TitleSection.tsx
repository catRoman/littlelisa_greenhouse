import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { greenhouse_data } from "../../data/static_info";

export default function TitleSection() {
  const { viewState, selectedZoneId, selectedPlot } =
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
      header = `Plot: ${selectedPlot?.is_empty ? "Empty" : selectedPlot?.plant_type}`;
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
