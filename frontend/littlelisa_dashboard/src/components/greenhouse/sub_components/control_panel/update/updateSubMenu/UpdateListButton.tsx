import React from "react";

type UpdateListButtonProps = {
  isSelectedSubMenu: string;
  subMenuHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
};
export default function UpdateListButton({
  isSelectedSubMenu,
  subMenuHandler,
  children,
}: UpdateListButtonProps) {
  return (
    <li
      className={`hover:cursor-pointer hover:font-bold ${isSelectedSubMenu === children ? "font-bold text-green-300" : ""} hover:text-green-300`}
    >
      <button id={`${children}`} onClick={subMenuHandler}>
        {children}
      </button>
    </li>
  );
}
