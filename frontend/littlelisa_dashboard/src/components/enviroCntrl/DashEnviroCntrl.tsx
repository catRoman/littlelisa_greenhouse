import EnvirCntrlBtn from "./EnviroCntrlBtn";
import { cntrlData } from "../../data/static_info";

export default function DashEnviroCntrl() {
  return (
    <div className="flex flex-col justify-between pt-4 ">
      <ul className="align-center  flex flex-col justify-center gap-3  ">
        {cntrlData.map((cntrl) => {
          return (
            <EnvirCntrlBtn key={cntrl.cntrl} iconPath={cntrl.iconPath}>
              {cntrl.cntrl}
            </EnvirCntrlBtn>
          );
        })}
      </ul>
    </div>
  );
}
