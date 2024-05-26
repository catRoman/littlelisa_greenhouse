import { useContext, useState } from "react";
import { GreenHouseContext } from "../../../../../context/GreenHouseContextProvider";

export default function ClearPlotSubMenu() {
  const {
    selectedPlot,
    fetchedGreenhouseData,
    setRefreshNoteList,
    refreshNoteList,
    setRefreshGreenhouseData,
    refreshGreenhouseData,
  } = useContext(GreenHouseContext);
  const [emptyCheck, setEmptyCheck] = useState<boolean>(false);
  const [eraseNotesCheck, setEraseNotesCheck] = useState<boolean>(false);
  function emptySubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const updatePlotClearPlot = async () => {
      const { user_id, greenhouse_id } = fetchedGreenhouseData!;
      try {
        const plantInfoClearForm = new FormData();
        plantInfoClearForm.append("plant_type", "");
        plantInfoClearForm.append("is_transplant", "");
        plantInfoClearForm.append("date_planted", "");
        plantInfoClearForm.append("date_expected_harvest", "");

        const response = await fetch(
          `/api/users/${user_id}/greenhouses/${greenhouse_id}/squares/${selectedPlot?.square_db_id}`,
          {
            method: "PUT",
            body: plantInfoClearForm,
          },
        );

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
  function eraseNotesHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const deleteAllPlotNotes = async () => {
      const { user_id, greenhouse_id } = fetchedGreenhouseData!;
      try {
        const response = await fetch(
          `/api/users/${user_id}/greenhouses/${greenhouse_id}/squares/${selectedPlot?.square_db_id}/notes`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        setRefreshNoteList(!refreshNoteList);
        console.log("erses");

        console.log(responseData);
      } catch (error) {
        console.log(error);
      }
    };

    deleteAllPlotNotes();
    setEraseNotesCheck(!eraseNotesCheck);
  }
  return (
    <div className="grid grid-cols-4 gap-6 p-2 pl-4">
      <h5 className=" col-span-4  text-purple-300">Clear Plot Info...</h5>
      <div className="col-span-3 row-start-2">
        {emptyCheck ? (
          <p className="mt-1 text-sm text-red-500">
            Are you Sure? This is clear the plot for good
          </p>
        ) : (
          <p>Empty plot and clear data?</p>
        )}
      </div>
      <div>
        <div className="col-start-2 row-start-2 flex justify-end">
          {emptyCheck ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={emptySubmitHandler}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Empty
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setEmptyCheck(!emptyCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={(event) => {
                event.preventDefault();
                setEmptyCheck(!emptyCheck);
              }}
              className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
            >
              Empty
            </button>
          )}
        </div>
      </div>

      <div className="col-span-3">
        {eraseNotesCheck ? (
          <p className="mt-1 text-sm text-red-500">
            Are you Sure? This will delete all plot current notes...
          </p>
        ) : (
          <p>Erase all notes for plot?</p>
        )}
      </div>
      <div>
        <div className="col-start-2 row-start-2 flex justify-end">
          {eraseNotesCheck ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={eraseNotesHandler}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Erase
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setEraseNotesCheck(!eraseNotesCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={(event) => {
                event.preventDefault();
                setEraseNotesCheck(!eraseNotesCheck);
              }}
              className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
            >
              Empty
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
