import React from "react";
import "./styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import DashBoard from "./pages/DashBoard.tsx";
import Sensors from "./pages/Sensors.tsx";
import Settings from "./pages/Settings.tsx";
import SideNave from "./components/sideNav/SideNav.tsx";
import TopNav from "./components/topNav/TopNav.tsx";

import { Outlet } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Scheduling from "./pages/Scheduling.tsx";
import Debug from "./pages/Debug.tsx";
import GreenHouse from "./pages/GreenHouse.tsx";
import GreenHouseContextProvider from "./context/GreenHouseContextProvider.tsx";

export default function App() {
  const Layout = () => {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-auto">
          <TopNav />
        </div>
        <div>
          <div className="">
            <SideNave />
          </div>
          <main className="m-0 ml-48">
            <Outlet />
          </main>
        </div>
        {/* <div className="b-0 sticky">
          <Footer />
        </div> */}
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,

      children: [
        {
          path: "dashboard",
          element: <DashBoard />,
        },
        {
          path: "greenhouse",
          element: (
            <GreenHouseContextProvider>
              <GreenHouse />,
            </GreenHouseContextProvider>
          ),
        },
        {
          path: "schedule",
          element: <Scheduling />,
        },
        {
          path: "sensors",
          element: <Sensors />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "debug",
          element: <Debug />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

  return <RouterProvider router={router} />;
}
