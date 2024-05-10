import { useContext } from "react";
import { square_data } from "../../../data/mock_json/square_data";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { Plot } from "../../../../types/common";
export default function PlotOverview() {
  const { selectedZoneId, selectedSquareId } = useContext(GreenHouseContext);

  const plot: Plot | undefined = square_data.find((plot) => {
    if (
      plot.row - 1 === selectedSquareId?.y &&
      plot.column - 1 === selectedSquareId?.x
    ) {
      return plot;
    }
  });

  return (
    <>
      <div className="pl-4">
        <li>
          <span className="font-bold">Zone: </span>
          <span className="text-green-300">{selectedZoneId}</span>
        </li>
        <li>
          <span className="font-bold">Row: </span>
          <span className="text-green-300">{plot?.row}</span>
        </li>
        <li>
          <span className="font-bold">Columns: </span>
          <span className="text-green-300">{plot?.column}</span>
        </li>
        <li>
          <span className="font-bold">DB Id: </span>
          <span className="text-green-300">{plot?.square_db_id}</span>
        </li>
        <li>
          <span className="font-bold">Square Id: </span>
          <span className="text-green-300">
            {selectedSquareId?.x} - {selectedSquareId?.y}
          </span>
        </li>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold text-orange-500">Planted</h3>
        <ul className="pl-4">
          {plot!.is_empty ? (
            <li>plot is empty</li>
          ) : (
            <>
              <li className="flex flex-col">
                <span className="font-bold">Type: </span>
                <span className="pl-4 text-green-300">{plot?.plant_type}</span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold">Transplant: </span>
                <span className="pl-4 text-green-300">
                  {plot?.is_transplanted ? "Yes" : "No"}
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold">Planted: </span>
                <span className="pl-4 text-green-300">
                  {plot?.date_planted}
                </span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold">Est. Harvest: </span>
                <span className="pl-4 text-green-300">
                  {plot?.date_expected_harvest}
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}
