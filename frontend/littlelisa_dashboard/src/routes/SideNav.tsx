import NavItem from "./NavItem";

export default function SideNave() {
  return (
    <nav className="m-4 flex list-none flex-col items-center gap-4 text-xl font-bold tracking-wider text-stone-700">
      <div className="flex justify-center">
        <img
          width="70px"
          src="../../public/assets/noun-greenhouse-6514676.svg"
          alt="little greenhouse icon"
        />
      </div>

      <div className="flex flex-col">
        <NavItem>dashboard</NavItem>
        <NavItem>zones</NavItem>
        <NavItem>sensors</NavItem>
        <NavItem>settings</NavItem>
      </div>
    </nav>
  );
}
