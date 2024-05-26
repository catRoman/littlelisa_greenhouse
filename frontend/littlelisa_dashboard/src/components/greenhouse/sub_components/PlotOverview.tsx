import { useContext } from "react";
import { format } from "date-fns";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
export default function PlotOverview() {
  const {
    selectedZoneId,

    selectedPlot,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);
  if (fetchedGreenhouseData && selectedPlot) {
    return (
      <div className="flex flex-col gap-2">
        <div className="pl-4">
          <li>
            <span className="font-bold">DB Id: </span>
            <span className="text-green-300">{selectedPlot.square_db_id}</span>
          </li>
          <li>
            <span className="font-bold">Zone: </span>
            <span className="text-green-300">{selectedZoneId}</span>
          </li>
          <li>
            <span className="font-bold">Row: </span>
            <span className="text-green-300">
              {selectedPlot.row -
                fetchedGreenhouseData.zones[selectedZoneId].zone_start_point.y +
                1}
            </span>
          </li>
          <li>
            <span className="font-bold">Column: </span>
            <span className="text-green-300">
              {selectedPlot.col -
                fetchedGreenhouseData.zones[selectedZoneId].zone_start_point.x +
                1}
            </span>
          </li>
        </div>
        <div className="mt-4">
          <h3 className="text-md font-bold text-orange-500">Planted</h3>
          <ul className="pl-4">
            {selectedPlot?.is_empty ? (
              <li>plot is empty</li>
            ) : (
              <>
                <li className="flex flex-col">
                  <span className="font-bold">Type: </span>
                  <span className="pl-4 text-green-300">
                    {selectedPlot?.plant_type}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="font-bold">Transplant: </span>
                  <span className="pl-4 text-green-300">
                    {selectedPlot?.is_transplant ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="font-bold">Planted: </span>
                  <span className="pl-4 text-green-300">
                    {selectedPlot.date_planted
                      ? format(selectedPlot.date_planted, "MMMM d, yyyy")
                      : ""}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="font-bold">Est. Harvest: </span>
                  <span className="pl-4 text-green-300">
                    {selectedPlot.date_expected_harvest
                      ? format(
                          selectedPlot.date_expected_harvest,
                          "MMMM d, yyyy",
                        )
                      : ""}
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  }
}
