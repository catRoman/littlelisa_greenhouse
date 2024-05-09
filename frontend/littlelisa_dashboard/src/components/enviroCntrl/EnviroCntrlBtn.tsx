import React, { useState } from "react";

type EnvirCntrlBtnProps = {
  iconPath: string;

  children: React.ReactNode;
};

export default function EnvirCntrlBtn({
  iconPath,

  children,
}: EnvirCntrlBtnProps) {
  const [showSubMenu, setShowSubMenu] = useState(false);

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
  };

  return (
    <>
      <li
        onClick={toggleSubMenu}
        className="flex items-center gap-2 rounded-md border-2  border-solid border-stone-50 px-6 py-2 hover:bg-stone-200 "
      >
        <img width="50px" src={iconPath} />
        <p>{children}</p>
      </li>
      {showSubMenu && (
        <ul>
          {}
          <p>Hi there</p>
        </ul>
      )}
    </>
  );
}
