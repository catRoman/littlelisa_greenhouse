import { useContext } from "react";
import { ControlPanelClearContext } from "../../../../../../../context/ControlPanelClearContext";

type ClearRenderType = {
  type: string;
  emptySubmitHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function ClearRender({
  type,
  emptySubmitHandler,
}: ClearRenderType) {
  const {
    emptyCheck,
    setEmptyCheck,
    eraseNotesCheck,
    setEraseNotesCheck,
    eraseNotesHandler,
  } = useContext(ControlPanelClearContext);

  return (
    <div className="grid grid-cols-4 gap-6 p-2 pl-4">
      <h5 className=" col-span-4  text-purple-300">
        Clear {type.charAt(0).toUpperCase() + type.slice(1)} Info...
      </h5>
      <div className="col-span-3 row-start-2">
        {emptyCheck ? (
          <p className="mt-1 text-sm text-red-500">
            Are you Sure? This is clear the {type} for good
          </p>
        ) : (
          <p>Empty {type} and clear all plot data?</p>
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
            Are you Sure? This will delete all the {type}s notes...
          </p>
        ) : (
          <p>Erase all notes for {type}?</p>
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
