import { Outlet } from "react-router-dom";
import { register, unregister } from "../service-worker/register";
import { PageType } from "../pages/types";

export default function TabletOneLayout() {
  register({ type: PageType.T1 });
  return (
    <>
      <h1>T1 Layout</h1>
      <p>T1 Layout</p>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
