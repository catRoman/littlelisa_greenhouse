import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { greenhouse_data, current_enviromental } from "../../data/static_info";
import { square_data } from "../../data/mock_json/square_data";
import GreenHouseOverview from "./sub_components/GreenhouseOverview";
import ZoneOverview from "./sub_components/ZoneOverview";
import PlotOverview from "./sub_components/PlotOverview";

const { greenhouse } = greenhouse_data;
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
