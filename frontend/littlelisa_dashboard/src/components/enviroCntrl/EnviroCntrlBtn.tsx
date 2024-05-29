import React, { useCallback, useContext,  useRef, useState } from "react";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";


type EnvirCntrlBtnProps = {
  iconPath: string | undefined;
  state: string;
  id: number;
  refresh: ()=>void;
  children: React.ReactNode;
};

export default function EnvirCntrlBtn({
  refresh,
  iconPath,
  state,
  id,
  children,
}: EnvirCntrlBtnProps) {
 const {fetchedGreenhouseData} = useContext(GreenHouseContext);
  const [showSubMenu, setShowSubMenu] = useState<boolean>(false);

  const user_id = useRef(fetchedGreenhouseData?.user_id);
  const greenhouse_id = useRef(fetchedGreenhouseData?.greenhouse_id)
  const cntrlId = useRef(id.toString());






  const updateEnvState = useCallback(async() => {
    console.log(cntrlId.current)
      const url = `/api/users/${user_id.current}/greenhouses/${greenhouse_id.current}/updateEnvState`;
      try {
        const response = await fetch(url,
          {
            method: 'PUT',
            headers : {
              'Content-type': 'text/plain',
            },
            body: cntrlId.current
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        refresh();
      } catch(error){
        console.log(error)
      }



  },[refresh])



  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu);
    updateEnvState();
  };

  return (
    <div className="flex flex-col">
      <li
        onClick={toggleSubMenu}
        className="cursor-pointer flex items-center gap-2 rounded-md border-2 border-solid border-stone-50 bg-zinc-800 px-6 py-2 hover:bg-stone-200 "
      >
        {iconPath && <img width="30px" src={iconPath} />}
        <p className="justifyself-end">{children} {state === "on" ? <span className="text-green-300">On</span>:<span className="text-red-300">Off</span>}</p>
      </li>
      {/* {showSubMenu && (
        <ul>
          <li className="flex justify-center mt-2 border-l-2">

          <p>clickety goes the relay</p>
          </li>
        </ul>
      )} */}
    </div>
  );
}
