import EnvirCntrlBtn from "./EnviroCntrlBtn";

type cntrlIconPair = {
  cntrl: string;
  iconPath: string;
};

const iconPathPairs: cntrlIconPair[] = [
  {
    cntrl: "fans",
    iconPath: "../../../public/assets/control icons/fans.svg",
  },
  {
    cntrl: "lights",
    iconPath: "../../../public/assets/control icons/lights.svg",
  },
  {
    cntrl: "water",
    iconPath: "../../../public/assets/control icons/water.svg",
  },
  {
    cntrl: "fertilizer",
    iconPath: "../../../public/assets/control icons/fertilizer.png",
  },
  {
    cntrl: "ventilation",
    iconPath: "../../../public/assets/control icons/vent.svg",
  },
];

export default function DashEnviroCntrl() {
  return (
    <div className="flex h-24 flex-col justify-between ">
      <p className="mb-4 text-xl font-bold">Enviro controls</p>
      <ul className="align-center my-2 flex flex-col justify-center gap-2 pr-4  ">
        {iconPathPairs.map((cntrl) => {
          return (
            <EnvirCntrlBtn iconPath={cntrl.iconPath}>
              {cntrl.cntrl}
            </EnvirCntrlBtn>
          );
        })}
      </ul>
    </div>
  );
}
