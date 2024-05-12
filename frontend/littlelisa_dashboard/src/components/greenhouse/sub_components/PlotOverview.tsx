import { useContext } from "react";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
export default function PlotOverview() {
  const { selectedZoneId, selectedSquareId, selectedPlot } =
    useContext(GreenHouseContext);

  return (
    <div className="flex flex-col gap-2">
      <div className="pl-4">
        <li>
          <span className="font-bold">Zone: </span>
          <span className="text-green-300">{selectedZoneId}</span>
        </li>
        <li>
          <span className="font-bold">Row: </span>
          <span className="text-green-300">{selectedPlot?.row}</span>
        </li>
        <li>
          <span className="font-bold">Columns: </span>
          <span className="text-green-300">{selectedPlot?.column}</span>
        </li>
        <li>
          <span className="font-bold">DB Id: </span>
          <span className="text-green-300">{selectedPlot?.square_db_id}</span>
        </li>
        <li>
          <span className="font-bold">Square Id: </span>
          <span className="text-green-300">
            {selectedSquareId?.x} - {selectedSquareId?.y}
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
                  {selectedPlot?.is_transplanted ? "Yes" : "No"}
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold">Planted: </span>
                <span className="pl-4 text-green-300">
                  {selectedPlot?.date_planted}
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold">Est. Harvest: </span>
                <span className="pl-4 text-green-300">
                  {selectedPlot?.date_expected_harvest}
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
