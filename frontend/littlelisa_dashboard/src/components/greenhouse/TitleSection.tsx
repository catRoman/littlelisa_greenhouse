import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";

export default function TitleSection() {
  const { viewState, selectedZoneId, fetchedGreenhouseData, selectedPlot } =
    useContext(GreenHouseContext);

  let header = "";
  let description = "";

  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      header = `GreenHouse Overview`;
      description = `${fetchedGreenhouseData?.location}`;
      break;

    case GreenHouseViewState.Zone:
      header = `${fetchedGreenhouseData?.zones[selectedZoneId].name}  `;
      description = `${fetchedGreenhouseData?.zones[selectedZoneId].description}`;
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
