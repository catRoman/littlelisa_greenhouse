import { Link } from "react-router-dom";

type NavItemProp = {
  children: string;
};

export default function NavItem({ children }: NavItemProp) {
  return (
    <Link className="p-2 hover:bg-stone-100" to={`/${children}`}>
      {children.toUpperCase()}
    </Link>
  );
}
