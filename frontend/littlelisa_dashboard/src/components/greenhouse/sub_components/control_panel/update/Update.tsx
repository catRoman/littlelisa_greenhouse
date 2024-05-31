import UpdateListButton from "./updateSubMenu/UpdateListButton";

type UpdateProps<T> = {
  isSelectedSubMenu: string;
  subMenuHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  subMenu: JSX.Element;
  subMenuList: T;
};
export default function Update<T extends Record<string, string>>({
  isSelectedSubMenu,
  subMenuHandler,
  subMenu,
  subMenuList,
}: UpdateProps<T>) {
  return (
    <div className="grid grid-cols-4">
      <h4 className="col-span-1 font-bold text-blue-300">Update Plot:</h4>
      <div className="row-start-2 mt-2 h-36 overflow-y-auto ">
        <ul className="ml-4 flex flex-col gap-1 border-r-2 ">
          {Object.values(subMenuList).map((item) => (
            <UpdateListButton
              isSelectedSubMenu={isSelectedSubMenu}
              subMenuHandler={subMenuHandler}
            >
              {item}
            </UpdateListButton>
          ))}
        </ul>
      </div>
      <div className="col-span-3 row-span-2">{subMenu}</div>
    </div>
  );
}
