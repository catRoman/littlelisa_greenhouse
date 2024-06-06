import EnvirCntrlBtn from "./EnviroCntrlBtn";
import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { EnvState } from "../../../types/common";
import { cntrlDataList } from "../../data/static_info";

export default function DashEnviroCntrl() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const { fetchedGreenhouseData, setEnvCntrlStates, envCntrlStates } =
    useContext(GreenHouseContext);

  useEffect(() => {
    const fetchStateList = async () => {
      const { user_id, greenhouse_id } = fetchedGreenhouseData!;
      const url = `/api/users/${user_id}/greenhouses/${greenhouse_id}/envState`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const newState = Object.values(data) as EnvState[];

        setEnvCntrlStates(newState);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (fetchedGreenhouseData) {
      fetchStateList();
    }
  }, [setEnvCntrlStates, fetchedGreenhouseData]);

  return (
    <div className="flex h-36 flex-col justify-between pt-4">
      {error ? (
        <p className="m-auto"> Controller Offline...</p>
      ) : loading ? (
        <p className="m-auto"> Loading...</p>
      ) : (
        <ul className="align-center grid grid-cols-3   flex-col justify-center gap-3  ">
          {envCntrlStates.length > 0 &&
            envCntrlStates.map((cntrl) => {
              const icon = cntrlDataList.find((icon) => {
                if (icon.cntrl === cntrl.type) {
                  return icon;
                }
              });
              return (
                <EnvirCntrlBtn
                  key={cntrl.id}
                  id={cntrl.id}
                  state={cntrl.state}
                  iconPath={icon?.iconPath}
                >
                  {cntrl.type}
                </EnvirCntrlBtn>
              );
            })}
        </ul>
      )}
    </div>
  );
}
