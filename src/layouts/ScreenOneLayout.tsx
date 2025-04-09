import { Outlet } from "react-router-dom";
import { register, unregister } from "../service-worker/register";
import { PageType } from "../pages/types";

export default function ScreenOneLayout() {
  register({ type: PageType.S1 });
  return (
    <>
      <h1>S1 Layout</h1>
      <p>S1 Layout</p>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
