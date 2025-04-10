import { Outlet } from "react-router-dom";
import {
  register,
  getRegistrations,
  unregister,
  getRegistration,
  postMessage,
  subscribe,
  publish,
} from "../service-worker/entrypoint";
import { PageType } from "../pages/types";
import { useCallback, useRef } from "react";

export default function ScreenOneLayout() {
  register({
    type: PageType.S1,
    // subscriptions: [
    //   {
    //     topic: "/s1/routing",
    //     callback: (message) => {},
    //   },
    //   {
    //     topic: "/sub/all",
    //     callback: (message) => {},
    //   },
    // ],
  }).then((registration) => {
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event?.source?.scriptURL?.includes(PageType.S1)) {
        const { type, payload } = event.data;
        console.log("[Client S1] Received message:", type, payload);
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
    await postMessage(PageType.S1, {
      type: "PING",
      payload: { text: "(S1) Hello from client!" },
    });
  }

  async function initSubscribe() {
    await subscribe(PageType.S1, {
      topic: "/s1/routing",
      // callback: callbackRef,
      // (message) => {
      //   console.log("dedededadsds");
      // },
    });
  }

  async function routing() {
    await publish(PageType.S1, [
      {
        target: PageType.S2,
        to: "/s2/test",
        desc: "S2 페이지를 /s2/test 로 이동시키자",
      },
    ]);
  }

  return (
    <>
      <h1>S1 Layout</h1>
      <p>S1 Layout</p>
      <button onClick={sendMessageToServiceWorker}>
        Send Message to Service Worker
      </button>
      <button onClick={initSubscribe}>Subscribe</button>
      <button onClick={routing}>S2 페이지를 이동시키기</button>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
