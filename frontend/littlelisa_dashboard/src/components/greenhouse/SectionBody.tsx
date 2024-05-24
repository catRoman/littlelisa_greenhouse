import ZoneInfo from "./sub_components/ZoneInfo";

import { GreenHouseViewState } from "../../../types/enums";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { useContext, useEffect, useState } from "react";
import SensorInfo from "./sub_components/SensorInfo";

export default function SectionBody() {
  const {
    viewState,
    selectedZoneId,
    selectedPlant,
    setSelectedPlant,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);

  const [plantInfo, setPlantInfo] = useState<string>(null!);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (selectedPlant === "") {
      return;
    }
    const fetchPlantPage = async () => {
      try {
        const data = await fetch(
          `/wikiApi/api.php?action=query&prop=extracts&format=json&exintro&explaintext&titles=${selectedPlant}/wikiApi/api.php?action=query&prop=extracts|pageimages&format=json&exintro&explaintext&titles=${selectedPlant}&pithumbsize=300`,
        );
        const jsonData = await data.json();
        if (jsonData.error) {
          setSelectedPlant("unknown");
          throw new Error(jsonData.error.info);
        }
        const pageId = Object.keys(jsonData.query.pages)[0];
        setPlantInfo(jsonData.query.pages[pageId].extract);

        if (jsonData.query.pages[pageId].thumbnail) {
          const imageUrl = jsonData.query.pages[pageId].thumbnail.source;
          setMainImage(imageUrl);
        } else {
          setMainImage(null);
        }
      } catch (error) {
        console.log("whoopsie: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlantPage();
  });

  let body: JSX.Element | string | JSX.Element[] = <></>;
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      body = (
        <div className="flex flex-col gap-3">
          {fetchedGreenhouseData?.zones.map((zone, index) => {
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
            zone={fetchedGreenhouseData!.zones[selectedZoneId]}
            zoneId={selectedZoneId}
          />
          {fetchedGreenhouseData?.zones[selectedZoneId].sensors &&
            fetchedGreenhouseData?.zones[selectedZoneId].sensors?.map(
              (sensor, index) => {
                return (
                  <div key={`sensor_info_${index}`}>
                    <SensorInfo sensor={sensor} sensorId={sensor.local_id} />
                  </div>
                );
              },
            )}
        </div>
      );
      break;
    case GreenHouseViewState.Plot:
      console.log(selectedPlant);
      if (selectedPlant === "") {
        body = <p>Hurry up and plant something already</p>;
      } else if (selectedPlant === "unknown") {
        body = <p> Couldnt find an entry on this particluar plant</p>;
      } else {
        if (loading) {
          body = <div>Loading...</div>;
        } else {
          body = (
            <div>
              <h3 className="text-md font-bold text-orange-500">
                Plant Information
              </h3>
              <div className="prose max-w-none border-r-4 border-zinc-500 pr-4">
                {mainImage ? (
                  <img
                    className="rounded-mdinline float-left mb-4 mr-4 h-48 w-48 object-cover"
                    src={mainImage}
                  />
                ) : (
                  ""
                )}
                <p>{plantInfo}</p>
              </div>
            </div>
          );
        }
      }

      break;
  }

  return <div>{body}</div>;
}
