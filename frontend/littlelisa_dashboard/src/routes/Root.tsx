import SideNave from "./SideNav";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div className="">
        <SideNave />
        <main className="m-0 ml-40">
          <Outlet />
        </main>
      </div>
    </>
  );
}
