import { Outlet } from "react-router-dom";
import { PageType } from "../pages/types";

export default function TabletOneLayout() {
  return (
    <>
      <h1>T1 Layout</h1>
      <p>T1 Layout</p>
      <Outlet />
    </>
  );
}
