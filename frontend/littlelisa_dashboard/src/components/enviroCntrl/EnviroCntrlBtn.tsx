import React, { useState } from "react";

type EnvirCntrlBtnProps = {
  iconPath: string | undefined;
  state: string;
  children: React.ReactNode;
};

export default function EnvirCntrlBtn({
  iconPath,
  state,
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
        className="flex items-center gap-2 rounded-md border-2 border-solid border-stone-50 bg-zinc-800 px-6 py-2 hover:bg-stone-200 "
      >
        {iconPath && <img width="30px" src={iconPath} />}
        <p className="justifyself-end">{children} {state === "on" ? <span className="text-green-300">On</span>:<span className="text-red-300">Off</span>}</p>
      </li>
      {showSubMenu && (
        <ul>
<li>

          <p>Hi there</p>
</li>
        </ul>
      )}
    </>
  );
}
