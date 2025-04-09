import { Outlet } from "react-router-dom";
import { postMessage, register, unregister } from "../service-worker/register";
import { PageType } from "../pages/types";

export default function ScreenTwoLayout() {
  register({ type: PageType.S2 }).then((registration) => {
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event?.source?.scriptURL?.includes(PageType.S2)) {
        const { type, payload } = event.data;
        console.log("[Client S2] Received message:", type, payload);
        if (type === "STOMP_MESSAGE") {
          // 메시지 처리
        } else if (type === "PONG") {
          console.log("SW 응답:", payload.text);
        }
      }
    });
  });

  async function sendMessageToServiceWorker() {
    await postMessage(PageType.S2, {
      type: "PING",
      payload: { text: "(S2) Hello from client!" },
    });
  }

  return (
    <>
      <h1>S2 Layout</h1>
      <p>S2 Layout</p>
      <button onClick={() => sendMessageToServiceWorker()}>
        Send Message to Service Worker
      </button>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
