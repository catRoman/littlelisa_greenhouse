import ZoneInfo from "./sub_components/ZoneInfo";
import { greenhouse_data } from "../../data/static_info";
import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { useContext, useEffect, useState } from "react";
import SensorInfo from "./sub_components/SensorInfo";
// import { tomatoe_data } from "../../data/wikiarticles/tomatoe.ts";
// import { square_data } from "../../data/mock_json/square_data.ts";
// import { Plot } from "../../../types/common.ts";

type WikiPage = {
  content: string | TrustedHTML;
};
export default function SectionBody() {
  const { viewState, selectedZoneId, selectedPlant } =
    useContext(GreenHouseContext);

  const [plantInfo, setPlantInfo] = useState<WikiPage>(null!);

  useEffect(() => {
    if (selectedPlant === "") {
      return;
    }
    console.log("in async: ", selectedPlant);
    const fetchPlantPage = async () => {
      try {
        const data = await fetch(
          `/wikiApi/api.php?action=parse&format=json&page=${selectedPlant}&prop=text&disableeditsection=true`,
        );
        console.log("fetch ok");
        const jsonData = await data.json();
        // console.log(jsonData);
        if (jsonData.error) {
          throw new Error(jsonData.error.info);
        }
        setPlantInfo(jsonData.parse.text["*"]);
      } catch (error) {
        console.log("whoopsie: ", error);
      }
    };
    fetchPlantPage();
  }, [selectedPlant, plantInfo]);

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
      if (selectedPlant === "") {
        body = <p>Hurry up and plant something already</p>;
      } else {
        body = <div dangerouslySetInnerHTML={{ __html: plantInfo }} />;
      }
      console.log("inviewstate:", selectedPlant);
      // body = <p>{selectedPlant}</p>;
      break;
  }
  return <div>{body}</div>;
}
