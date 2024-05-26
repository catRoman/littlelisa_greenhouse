import { Note as NoteType } from "../../../../../types/common";
import { format } from "date-fns";

type NoteProps = {
  note: NoteType;
};

function Note({ note }: NoteProps) {
  const createdDate = new Date(note.created_at);
  const formattedDate = format(createdDate, "yyy-MM-dd");

  console.log(formattedDate);

  return (
    <div className="flex rounded-md border bg-zinc-800  p-1">
      <span>{formattedDate}</span>
      <span>{note.title}</span>
    </div>
  );
}

export default Note;
