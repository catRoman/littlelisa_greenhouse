type NavItemProp = {
  children: string;
};

export default function NavItem({ children }: NavItemProp) {
  return (
    <a className="p-2 hover:bg-stone-100" href={`/${children}`}>
      {children.toUpperCase()}
    </a>
  );
}
