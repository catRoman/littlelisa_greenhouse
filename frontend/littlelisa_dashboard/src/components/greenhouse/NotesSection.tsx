import { useContext, useEffect, useRef, useState } from "react";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { GreenHouseViewState } from "../../../types/enums";
import { Note as NoteType } from "../../../types/common";
import Note from "./sub_components/notes/Note";

export default function NotesSection() {
  const {
    viewState,
    selectedPlot,
    selectedZoneNumber,
    refreshNoteList,
    setRefreshNoteList,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);
  const greenhouseRef = useRef(fetchedGreenhouseData?.greenhouse_id);
  const userRef = useRef(fetchedGreenhouseData?.user_id);

  const [noteList, setNoteList] = useState<NoteType[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [noteInput, setNoteInput] = useState({
    title: "",
    body: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    greenhouseRef.current = fetchedGreenhouseData?.greenhouse_id;
    userRef.current = fetchedGreenhouseData?.user_id;
  }, [fetchedGreenhouseData]);

  useEffect(() => {
    const fetchNotes = async () => {
      let url;
      switch (viewState) {
        case GreenHouseViewState.GreenHouse:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/notes`;
          break;

        case GreenHouseViewState.Zone:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/notes`;
          break;
        case GreenHouseViewState.Plot:
          url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/squares/${selectedPlot?.square_db_id}/notes`;
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
    switch (viewState) {
      case GreenHouseViewState.GreenHouse:
        if (fetchedGreenhouseData) {
          fetchNotes();
        }
        break;

      case GreenHouseViewState.Zone:
        if (fetchedGreenhouseData && selectedZoneNumber) {
          fetchNotes();
        }
        break;
      case GreenHouseViewState.Plot:
        if (fetchedGreenhouseData && selectedZoneNumber && selectedPlot) {
          fetchNotes();
        }
        break;
    }
  }, [
    setNoteList,
    viewState,
    selectedZoneNumber,
    selectedPlot,
    refreshNoteList,
    fetchedGreenhouseData,
  ]);

  function deleteNoteHandler(
    event: React.MouseEvent<HTMLButtonElement>,
    noteId: number,
  ) {
    event.preventDefault();

    const deleteNote = async () => {
      try {
        const response = await fetch(
          `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/notes/${noteId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        console.log(responseData);
        setRefreshNoteList(!refreshNoteList);
      } catch (error) {
        console.log(error);
      }
    };

    deleteNote();
  }

  function submitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // Check for empty fields and set error messages
    let valid = true;
    const newErrors = { title: "", body: "" };

    if (noteInput.title === "") {
      newErrors.title = "Title cannot be empty";
      valid = false;
    }

    if (noteInput.body === "") {
      newErrors.body = "Note body cannot be empty";
      valid = false;
    }
    setErrors(newErrors);

    if (valid) {
      const noteFormData = new FormData();
      noteFormData.append("title", noteInput.title);
      noteFormData.append("body", noteInput.body);

      const postNote = async () => {
        let url;

        switch (viewState) {
          case GreenHouseViewState.GreenHouse:
            url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/notes`;

            break;

          case GreenHouseViewState.Zone:
            url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/notes`;

            break;
          case GreenHouseViewState.Plot:
            url = `/api/users/${userRef.current}/greenhouses/${greenhouseRef.current}/squares/${selectedPlot!.square_db_id}/notes`;

            break;
        }
        try {
          const response = await fetch(url, {
            method: "POST",
            body: noteFormData,
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const responseData = await response.json();
          setRefreshNoteList(!refreshNoteList);
          console.log(responseData);
        } catch (error) {
          console.log(error);
        } finally {
          setNoteInput({
            title: "",
            body: "",
          });
        }
      };

      postNote();
    } else {
      console.log(errors);
    }
  }

  function clearInputHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setNoteInput({
      title: "",
      body: "",
    });
  }

  const noteChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNoteInput({ ...noteInput, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-md font-bold text-orange-500">Journal</h3>
        <form className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              name="title"
              placeholder="title"
              value={noteInput.title}
              onChange={noteChangeHandler}
              className="w-full resize-none rounded-md bg-zinc-800 p-2"
            />
            <textarea
              name="body"
              placeholder="Start a new note"
              onChange={noteChangeHandler}
              value={noteInput.body}
              className="h-56 w-full resize-none rounded-md bg-zinc-800 p-2"
            ></textarea>
            {errors.title && (
              <p className="mt-1 text-red-500">{errors.title}</p>
            )}
            {errors.body && <p className="mt-1 text-red-500">{errors.body}</p>}
          </div>
          <div className="flex justify-end gap-4 ">
            <button
              onClick={submitHandler}
              className="rounded-md border bg-zinc-700 p-2  hover:bg-zinc-200 hover:font-bold hover:text-red-900"
            >
              Add
            </button>
            <button
              onClick={clearInputHandler}
              className="rounded-md border bg-zinc-700 p-2  hover:bg-zinc-200 hover:font-bold hover:text-red-900"
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
                  return (
                    <Note
                      key={note.note_id}
                      onDelete={deleteNoteHandler}
                      note={note}
                    />
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
