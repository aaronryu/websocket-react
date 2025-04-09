import { Outlet } from "react-router-dom";
import {
  register,
  getRegistrations,
  unregister,
  getRegistration,
  postMessage,
} from "../service-worker/register";
import { PageType } from "../pages/types";
import { useCallback } from "react";

export default function ScreenOneLayout() {
  register({
    type: PageType.S1,
    subscriptions: [
      {
        topic: "/sub/screenOne",
        callback: (message) => {},
      },
      {
        topic: "/sub/all",
        callback: (message) => {},
      },
    ],
  }).then((registration) => {
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event?.source?.scriptURL?.includes(PageType.S1)) {
        const { type, payload } = event.data;
        console.log("[Client S1] Received message:", type, payload);
        if (type === "STOMP_MESSAGE") {
          // 메시지 처리
        } else if (type === "PONG") {
          console.log("SW 응답:", payload.text);
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

  return (
    <>
      <h1>S1 Layout</h1>
      <p>S1 Layout</p>
      <button onClick={sendMessageToServiceWorker}>
        Send Message to Service Worker
      </button>
      <button onClick={() => unregister()}>Unregister</button>
      <Outlet />
    </>
  );
}
