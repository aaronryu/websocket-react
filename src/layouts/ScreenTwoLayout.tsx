import { Outlet } from "react-router-dom";
import { register, unregister } from "../service-worker/register";
import { PageType } from "../pages/types";

export default function ScreenTwoLayout() {
  register({ type: PageType.S2 });
  return (
    <>
      <h1>S2 Layout</h1>
      <p>S2 Layout</p>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
