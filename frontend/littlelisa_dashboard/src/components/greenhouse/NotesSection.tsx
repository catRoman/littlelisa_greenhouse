import React from "react";

export default function NotesSection() {
  function formButtomHandler(event) {
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
          <p>existing notes</p>
        </div>
      </div>
    </div>
  );
}
