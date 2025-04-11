import { Outlet } from "react-router-dom";
import { PageType } from "../pages/types";

export default function TabletZeroLayout() {
  return (
    <>
      <h1>T0 Layout</h1>
      <p>T0 Layout</p>
      <Outlet />
    </>
  );
}
