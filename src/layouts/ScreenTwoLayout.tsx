import { Outlet, useNavigate } from "react-router-dom";
import useStompServiceWorker from "../service-worker/entrypoint";
import { PageType } from "../pages/types";

export default function ScreenTwoLayout() {
  const navigate = useNavigate();
  const { routing } = useStompServiceWorker(PageType.S2, navigate);

  async function handleRouting(to: string) {
    await routing([
      {
        target: PageType.S1,
        to,
        // desc: `S1 페이지를 ${to} 로 이동시키자`,
      },
    ]);
  }

  return (
    <>
      <h1>S2 Layout</h1>
      <p>S2 Layout</p>
      <button onClick={() => handleRouting("/s1")}>{"S1 -> /s1"}</button>
      <button onClick={() => handleRouting("/s1/test")}>
        {"S1 -> /s1/test"}
      </button>
      <Outlet />
    </>
  );
}
