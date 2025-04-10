import { Outlet } from "react-router-dom";
import {
  postMessage,
  publish,
  register,
  subscribe,
  unregister,
} from "../service-worker/entrypoint";
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
        } else if (type === "ROUTES") {
          console.log("나보고 여기로 이동하래요 :", payload);
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

  async function initSubscribe() {
    await subscribe(PageType.S2, {
      topic: "/s2/routing",
      // callback: callbackRef,
      // (message) => {
      //   console.log("dedededadsds");
      // },
    });
  }

  async function routing() {
    await publish(PageType.S2, [
      {
        target: PageType.S1,
        to: "/s1/test",
        desc: "S1 페이지를 /s1/test 로 이동시키자",
      },
    ]);
  }

  return (
    <>
      <h1>S2 Layout</h1>
      <p>S2 Layout</p>
      <button onClick={() => sendMessageToServiceWorker()}>
        Send Message to Service Worker
      </button>
      <button onClick={initSubscribe}>Subscribe</button>
      <button onClick={routing}>S1 페이지를 이동시키기</button>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
