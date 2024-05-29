import EnvirCntrlBtn from "./EnviroCntrlBtn";
import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { EnvState } from "../../../types/common";
import { cntrlDataList } from "../../data/static_info";

export default function DashEnviroCntrl() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [envState, setEnvState] = useState<EnvState[]>();

  const {fetchedGreenhouseData} = useContext(GreenHouseContext);

  useEffect(() => {
    const fetchEnvState = async () => {
      const {user_id, greenhouse_id} = fetchedGreenhouseData!;
      const url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/envState`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        setEnvState(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEnvState();

  },[fetchedGreenhouseData])



  return (
    <div className="flex flex-col h-36 justify-between pt-4">
        {error ? <p className="m-auto"> Error fetching data...</p> : loading ? <p className="m-auto"> Loading...</p> :

      <ul className="grid grid-cols-3 align-center   flex-col justify-center gap-3  ">

        {envState?.map((cntrl) => {
          const icon = cntrlDataList.find((icon)=>{
            if (icon.cntrl === cntrl.type){
              return icon;
            }
          })
          return (
            <EnvirCntrlBtn key={cntrl.id} state={cntrl.state} iconPath={icon?.iconPath}>
              {cntrl.type}
            </EnvirCntrlBtn>
          );
        })}
      </ul>
}
    </div>
  );
}
