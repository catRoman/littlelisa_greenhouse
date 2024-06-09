import NavItem from "./NavItem";
import WeatherApp from "../weather/WeatherApp";
import { Link } from "react-router-dom";

export default function SideNave() {
  return (
    <nav className="fixed m-0 flex h-[calc(100vh-64px)] list-none flex-col items-center justify-between gap-4 border-r p-4 text-xl tracking-wider text-stone-700">
      <div className="flex flex-col font-bold">
        <Link className="p-2 hover:bg-stone-100" to={`/`}>
          OVERVIEW
        </Link>

        <NavItem>Calender</NavItem>

        <NavItem>sensors</NavItem>
        <NavItem>settings</NavItem>
        <NavItem>Debug</NavItem>
      </div>
      <div className="">
        <WeatherApp />
      </div>
    </nav>
  );
}
