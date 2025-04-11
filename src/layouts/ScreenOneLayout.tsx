import { Outlet, useNavigate } from "react-router-dom";
import useStompServiceWorker from "../service-worker/entrypoint";
import { PageType } from "../pages/types";
import { useCallback, useRef } from "react";

export default function ScreenOneLayout() {
  const navigate = useNavigate();
  const { routing } = useStompServiceWorker(PageType.S1, navigate);

  async function handleRouting(to: string) {
    await routing([
      {
        target: PageType.S2,
        to,
        // desc: `S2 페이지를 ${to} 로 이동시키자`,
      },
    ]);
  }

  return (
    <>
      <h1>S1 Layout</h1>
      <p>S1 Layout</p>
      <button onClick={() => handleRouting("/s2")}>{"S2 -> /s2"}</button>
      <button onClick={() => handleRouting("/s2/test")}>
        {"S2 -> /s2/test"}
      </button>
      <Outlet />
    </>
  );
}
