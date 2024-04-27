export default function DashEnviroCntrl() {
  return (
    <div className="flex h-24 flex-col justify-between ">
      <p className="text-xl font-bold">Enviro controls</p>
      <ul className="align-center my-2 flex justify-around  ">
        <li className="flex items-center gap-2   rounded-md border-2 border-solid border-stone-500 px-4 py-2">
          <img
            width="50px"
            src="../../../public/assets/control icons/fans.svg"
          />
          <p>control 1</p>
        </li>
        <li className="flex items-center gap-2   rounded-md border-2 border-solid border-stone-500 px-4 py-2">
          <img
            width="50px"
            src="../../../public/assets/control icons/lights.svg"
          />
          <p>Control 1</p>
        </li>
        <li className="flex items-center gap-2   rounded-md border-2 border-solid border-stone-500 px-4 py-2">
          <img
            width="50px"
            src="../../../public/assets/control icons/water.svg"
          />
          <p>control 1</p>
        </li>
        <li className="flex items-center gap-2  rounded-md border-2 border-solid border-stone-500 px-4 py-2">
          <img
            width="50px"
            src="../../../public/assets/control icons/fertilizer.png"
          />
          <p>control 1</p>
        </li>
        <li className="flex items-center gap-2   rounded-md border-2 border-solid border-stone-500 px-4 py-2">
          <img
            width="50px"
            src="../../../public/assets/control icons/vent.svg"
          />
          <p>control 1</p>
        </li>
      </ul>
    </div>
  );
}
