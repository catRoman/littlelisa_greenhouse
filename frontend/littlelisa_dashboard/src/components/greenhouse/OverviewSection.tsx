import { useContext } from "react";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { greenhouse_data } from "../../data/static_info";
import { square_data } from "../../data/mock_json/square_data";

const { greenhouse, zones };
export default function OverviewSection() {
  const { viewState, selectedZoneId, selectedSquareId } =
    useContext(GreenHouseContext);

  let content = <></>;
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      content = (
        <>
          <li></li>
        </>
      );
      break;

    case GreenHouseViewState.Zone:
      content = (
        <>
          <li>
            <span>lat:</span>
            <span>{}</span>
          </li>
        </>
      );
      break;
    case GreenHouseViewState.Plot:
      content = (
        <>
          <li></li>
        </>
      );
      break;
  }
  return (
    <div>
      <h2 className="text-xl">Overview:</h2>
      <ul>{content}</ul>
    </div>
  );
}
