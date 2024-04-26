import NavItem from "./NavItem";
import SideNave from "./SideNav";

export default function Root() {
  return (
    <>
      <div className="flex">
        <SideNave />
        <main className="m-4">
          <h1>hello im a page</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus
            fugiat saepe id aspernatur officia recusandae cumque in quia
            officiis? Laboriosam eum debitis incidunt voluptates temporibus
            distinctio velit, voluptatum accusamus? Doloribus.
          </p>
        </main>
      </div>
    </>
  );
}
