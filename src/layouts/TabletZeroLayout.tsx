import { Outlet } from "react-router-dom";
import { register, unregister } from "../service-worker/register";
import { PageType } from "../pages/types";

export default function TabletZeroLayout() {
  register({ type: PageType.T0 });
  return (
    <>
      <h1>T0 Layout</h1>
      <p>T0 Layout</p>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
