import SideNave from "./SideNav";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div className="flex">
        <SideNave />
        <main className="m-4">
          <Outlet />
        </main>
      </div>
    </>
  );
}
