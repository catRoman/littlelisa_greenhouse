import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./routes/Root.tsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage.tsx";
import DashBoard from "./routes/DashBoard.tsx";
import Zones from "./routes/Zones.tsx";
import Sensors from "./routes/Sensors.tsx";
import Settings from "./routes/Settings.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,

    children: [
      {
        path: "dashboard",
        element: <DashBoard />,
      },
      {
        path: "zones",
        element: <Zones />,
      },
      {
        path: "sensors",
        element: <Sensors />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
