import { useEffect } from "react";
import { PageType } from "../pages/types";

enum BroadcastChannelContextType {
  WINDOW_CLIENT = "window-client",
  SERVICE_WORKER = "service-worker",
}

enum BroadcastChannelClient {
  INSTALLED = "INSTALLED",
  SUBSCRIBE = "SUBSCRIBE",
  PUBLISH = "PUBLISH",
  RECEIVE = "RECEIVE",
}

interface BroadcastChannelSubscribe {
  from: BroadcastChannelContextType.WINDOW_CLIENT;
  type: BroadcastChannelClient;
  page: PageType;
}

interface Route {
  to: string;
  desc?: string;
}

interface RouteRequest extends Route {
  target: PageType;
}

interface BroadcastChannelPublish {
  from: BroadcastChannelContextType.WINDOW_CLIENT;
  type: BroadcastChannelClient;
  page: PageType;
  payload: RouteRequest[];
}

interface BroadcastChannelReceive {
  from: BroadcastChannelContextType.SERVICE_WORKER;
  type: BroadcastChannelClient;
  page?: PageType;
  payload?: Route;
}

/**
 * Service Worker 와 WindowClient 간의 통신을 위한 BroadcastChannel 을 사용
 * 
 * - production  : 단일 BroadcastChannel Context = 단일 WindowClient
 * - development : 다수 BroadcastChannel Context = 다수 WindowClient (4개의 탭)
 *  - 각각의 탭마다 따로 BroadcastChannel 만들지 않고, 단일 BroadcastChannel 을 사용한다.
 *  - 단일 BroadcastChannel 을 사용하면, 각 탭에서 발생하는 이벤트를 모두 수신하기 때문에 if 문이 조금 많음
 */
export default function useStompServiceWorker(
  currentPage: PageType,
  navigate: (to: string) => void
) {
  const registration = registerServiceWorker(currentPage);
  const BROADCAST_CHANNEL = new BroadcastChannel(
    "between-window-client-and-service-worker"
  );

  // 현재의 PageType 에 대한 STOMP Client 를 등록한다 = 현재의 PageType 에 대한 Subscribe 등록
  const subscribe = () => {
    const subscribe: BroadcastChannelSubscribe = {
      from: BroadcastChannelContextType.WINDOW_CLIENT,
      type: BroadcastChannelClient.SUBSCRIBE,
      page: currentPage,
    };
    BROADCAST_CHANNEL.postMessage(subscribe);
  }

  useEffect(() => {
    // B.2. Service Worker 가 이미 등록이 되어있을지 모르니 "매 페이지 로드마다", 현재의 PageType 에 대한 STOMP Client = Subscribe 를 등록한다
    subscribe();
    // A. React Routing 을 위한 메세지 리시버 (메세지 핸들러의 반복된 재등록을 방지해야한다)
    BROADCAST_CHANNEL.onmessage = (event) => {
      const receive = event.data as BroadcastChannelReceive;
      const from = receive.from;
      const type = receive.type;
      const receivedPage = receive.page;
      if (from === BroadcastChannelContextType.SERVICE_WORKER) {
        switch (type) {
          // B.1. "Service Worker 가 등록이 완료되었을때", 현재의 PageType 에 대한 STOMP Client = Subscribe 를 등록한다
          case BroadcastChannelClient.INSTALLED:
            subscribe();
            break;
          case BroadcastChannelClient.RECEIVE:
            const route: Route = receive.payload!;
            if (receivedPage === currentPage) {
              navigate(route.to);
            }
            break;
          default:
            console.error(
              `[BROADCAST_CHANNEL in WINDOW_CLIENT] Unknown message type: ${type}, from: ${from}, payload: ${event.data.payload}`
            );
            break;
        }
      }
    };
    return () => {
      BROADCAST_CHANNEL.close();
    };
  }, []);

  return {
    routing: (request: RouteRequest[]) => {
      const routes: BroadcastChannelPublish = {
        from: BroadcastChannelContextType.WINDOW_CLIENT,
        type: BroadcastChannelClient.PUBLISH,
        page: currentPage,
        payload: request,
      };
      BROADCAST_CHANNEL.postMessage(routes);
    },
  };
}

const registerServiceWorker = async (page: PageType) => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `${window.location.origin}/libraries/stomp/worker.js`,
      );
      if (registration.installing) {
        console.log(
          `[WINDOW_CLIENT] Service worker installing - page: ${page}`
        );
      } else if (registration.waiting) {
        console.log(`[WINDOW_CLIENT] Service worker installed - page: ${page}`);
      } else if (registration.active) {
        console.log(`[WINDOW_CLIENT] Service worker active - page: ${page}`);
      }
      return registration;
    } catch (error) {
      console.error(`[WINDOW_CLIENT] Registration failed with ${error}`);
    }
  }
};
