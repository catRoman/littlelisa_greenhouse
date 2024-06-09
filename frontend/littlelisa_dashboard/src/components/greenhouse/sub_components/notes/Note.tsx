import { useState } from "react";
import { Note as NoteType } from "../../../../../types/common";
import { format } from "date-fns";

type NoteProps = {
  note: NoteType;
  onDelete: (
    event: React.MouseEvent<HTMLButtonElement>,
    noteId: number,
  ) => void;
};

function Note({ note, onDelete }: NoteProps) {
  const [showNote, setShowNote] = useState<boolean>(false);
  //   const [editing, setEditing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const createdDate = new Date(note.created_at);
  const formattedDate = format(createdDate, "MMM dd");
  const formattedTime = format(createdDate, "hh:mm a");

  const toggleNoteBody = () => {
    // if (!editing) {
    setShowNote(!showNote);
    // }
  };

  //   function updateNoteHandler(event: React.MouseEvent<HTMLButtonElement>) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     setEditing(true);
  //   }

  return (
    <div
      onClick={toggleNoteBody}
      className="flex cursor-pointer flex-col gap-2 rounded-md border bg-zinc-800  p-1"
    >
      <div className="flex flex-nowrap gap-2">
        <span className="whitespace-nowrap text-green-300">
          {formattedDate}
        </span>
        <span className="truncate">{note.title}</span>
      </div>
      {showNote ? (
        <div className=" flex flex-col gap-1 p-2">
          <p>
            created at <span className="text-blue-300">{formattedTime}</span>
          </p>
          <span className=" w-full resize-none overflow-hidden break-all rounded-md bg-zinc-800">
            {note.note}
          </span>
          <div className="mt-4 flex gap-2">
            {/* <button
              onClick={updateNoteHandler}
              className="rounded-md border bg-zinc-700 px-1 text-sm  hover:bg-zinc-200 hover:font-bold hover:text-red-900"
            >
              Update
            </button> */}
            {!deleting ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleting(true);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Delete
              </button>
            ) : (
              <div className="flex flex-col gap-2 text-sm">
                <p className=" text-red-500">Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(event) => {
                      onDelete(event, note.note_id);
                    }}
                    className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleting(false);
                    }}
                    className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Note;
