import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { GreenHouseViewState } from "../../../types/enums";
import { Note as NoteType } from "../../../types/common";
import Note from "./sub_components/notes/Note";

export default function NotesSection() {
  const { viewState, selectedPlot, selectedZoneId } =
    useContext(GreenHouseContext);
  const [noteList, setNoteList] = useState<NoteType[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGreenHouseData = async () => {
      let url;
      switch (viewState) {
        case GreenHouseViewState.GreenHouse:
          url = "/api/users/1/greenhouses/1/notes";
          break;

        case GreenHouseViewState.Zone:
          url = `/api/users/1/greenhouses/1/zones/${selectedZoneId}/notes`;
          break;
        case GreenHouseViewState.Plot:
          url = `/api/users/1/greenhouses/1/squares/${selectedPlot!.square_db_id}/notes`;
          break;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setNoteList(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGreenHouseData();
  }, [setNoteList, viewState, selectedZoneId, selectedPlot]);

  function formButtomHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-md font-bold text-orange-500">Journal</h3>
        <form className="flex flex-col gap-4">
          <textarea className="h-56 w-full resize-none rounded-md bg-zinc-800 p-2">
            Start a new note
          </textarea>
          <div className="flex justify-end gap-4 ">
            <button
              onClick={formButtomHandler}
              className="boarder rounded-md bg-zinc-800 p-2"
            >
              Add
            </button>
            <button
              onClick={formButtomHandler}
              className="boarder rounded-md bg-zinc-800 p-2"
            >
              Clear
            </button>
          </div>
        </form>
        <div className="h-36">
          {loading ? (
            <div>
              <p>Loading...</p>
            </div>
          ) : (
            noteList && (
              <div className="mt-4 flex flex-col gap-2">
                {noteList.map((note) => {
                  return <Note note={note} />;
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
