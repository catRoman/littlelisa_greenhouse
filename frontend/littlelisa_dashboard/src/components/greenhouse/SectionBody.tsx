import ZoneInfo from "./sub_components/ZoneInfo";
import { greenhouse_data } from "../../data/static_info";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { useContext } from "react";
import SensorInfo from "./sub_components/SensorInfo";

export default function SectionBody() {
  const { viewState, selectedZoneId } = useContext(GreenHouseContext);

  let body: JSX.Element = <></>;
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      body = (
        <div className="flex flex-col gap-3">
          {greenhouse_data.zones.map((zone, index) => {
            return (
              <div key={`zone_info_${index}`}>
                <ZoneInfo zone={zone} zoneId={index + 1} />
              </div>
            );
          })}
        </div>
      );
      break;

    case GreenHouseViewState.Zone:
      body = (
        <div className="flex flex-col gap-3">
          <ZoneInfo
            zone={greenhouse_data.zones[selectedZoneId - 1]}
            zoneId={selectedZoneId}
          />
          {greenhouse_data.zones[selectedZoneId - 1].sensors &&
            greenhouse_data.zones[selectedZoneId - 1].sensors?.map(
              (sensor, index) => {
                return (
                  <div key={`sensor_info_${index}`}>
                    <SensorInfo sensor={sensor} sensorId={index + 1} />
                  </div>
                );
              },
            )}
        </div>
      );
      break;
    case GreenHouseViewState.Plot:
      break;
  }
  return <div>{body}</div>;
}
