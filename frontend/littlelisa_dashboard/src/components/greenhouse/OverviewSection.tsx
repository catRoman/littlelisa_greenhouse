import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";

import GreenHouseOverview from "./sub_components/GreenhouseOverview";
import ZoneOverview from "./sub_components/ZoneOverview";
import PlotOverview from "./sub_components/PlotOverview";

export default function OverviewSection() {
  const { viewState } = useContext(GreenHouseContext);

  let overview = <></>;
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      overview = (
        <>
          <GreenHouseOverview />
        </>
      );
      break;

    case GreenHouseViewState.Zone:
      overview = (
        <>
          <ZoneOverview />
        </>
      );
      break;
    case GreenHouseViewState.Plot:
      overview = (
        <>
          <PlotOverview />
        </>
      );
      break;
  }
  return (
    <div>
      <h2 className=" text-xl font-bold text-orange-500">Overview:</h2>
      <ul className="">{overview}</ul>
    </div>
  );
}
