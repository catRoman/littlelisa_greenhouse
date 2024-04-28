import WeatherAp from "../components/WeatherApp";
import NavItem from "./NavItem";

export default function SideNave() {
  return (
    <nav className="fixed m-0 flex h-screen  list-none flex-col items-center gap-4 p-4 text-xl tracking-wider text-stone-700">
      <div className="flex justify-center">
        <img
          className=""
          width="70px"
          src="../../public/assets/noun-greenhouse-6514676.svg"
          alt="little greenhouse icon"
        />
      </div>

      <div className="flex flex-col font-bold">
        <NavItem>dashboard</NavItem>
        <NavItem>zones</NavItem>
        <NavItem>sensors</NavItem>
        <NavItem>settings</NavItem>
      </div>
      <div className="fixed bottom-2">
        <WeatherAp />
      </div>
    </nav>
  );
}
