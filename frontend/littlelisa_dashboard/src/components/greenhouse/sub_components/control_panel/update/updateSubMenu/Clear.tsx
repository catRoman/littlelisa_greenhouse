import { useContext } from "react";
import { GreenHouseContext } from "../../../../../../context/GreenHouseContextProvider";
import ClearRender from "./render/ClearRender";
import { ControlPanelClearContext } from "../../../../../../context/ControlPanelClearContext";
import { GreenHouseViewState } from "../../../../../../../types/enums";

export default function Clear() {
  const {
    selectedPlot,
    fetchedGreenhouseData,
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    viewState,
    selectedZoneNumber,
  } = useContext(GreenHouseContext);

  const { setEmptyCheck, emptyCheck } = useContext(ControlPanelClearContext);

  const { user_id, greenhouse_id } = fetchedGreenhouseData!;

  let url = "";
  let clearForm: FormData;
  let type = "";
  switch (viewState) {
    case GreenHouseViewState.GreenHouse:
      url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/emptyAll`;
      clearForm = new FormData();
      clearForm.append("greenhouse_id", `${greenhouse_id}`);
      type = "greenhouse";
      break;
    case GreenHouseViewState.Zone:
      clearForm = new FormData();
      url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/emptyAll`;
      clearForm.append(
        "zone_id",
        `${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}`,
      );
      type = "zone";
      break;
    case GreenHouseViewState.Plot:
      clearForm = new FormData();
      type = "plot";
      url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/squares/${selectedPlot?.square_db_id}`;
      clearForm.append("plant_type", "");
      clearForm.append("is_transplant", "");
      clearForm.append("date_planted", "");
      clearForm.append("date_expected_harvest", "");
      break;
  }

  function emptySubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const updatePlotClearPlot = async () => {
      try {
        const response = await fetch(url, {
          method: "PUT",
          body: clearForm,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        setRefreshGreenhouseData(!refreshGreenhouseData);
        console.log("emptyied");

        console.log(responseData);
      } catch (error) {
        console.log(error);
      }
    };
    updatePlotClearPlot();
    setEmptyCheck(!emptyCheck);
  }

  return <ClearRender type={type} emptySubmitHandler={emptySubmitHandler} />;
}
