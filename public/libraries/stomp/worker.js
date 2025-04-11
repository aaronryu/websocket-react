importScripts("./client.js");

/**
 * - production  : 단일 STOMP Client 사용
 * - development : 다수 STOMP Client 사용 (하나의 웹브라우저 = 하나의 서비스워커에서 4개의 탭)
 *  {
 *    "t0": StompClient { subscribe: "/sub/t0/routing" },
 *    "t1": StompClient { subscribe: "/sub/t1/routing" },
 *    "s1": StompClient { subscribe: "/sub/s1/routing" },
 *    "s2": StompClient { subscribe: "/sub/s2/routing" },
 *  }
 */
const STOMP_CLIENTS = {};
const BROADCAST_CHANNEL = new BroadcastChannel("between-window-client-and-service-worker");

const receiver = (page) => (message) => {
  BROADCAST_CHANNEL.postMessage({
    from: "service-worker",
    type: "RECEIVE",
    page,
    payload: { to: message.to, desc: message.desc },
  })
}

/**
 * Service Worker 설치/등록될 때 STOMP Client 생성하지 않고, SUBCRIBE 요청이 들어올 때 생성한다.
 * - 이유는 production 환경과 달리 development 환경에서는 하나의 웹브라우저에서 각각 4개의 탭마다 STOMP Client 를 갖도록 할것이기때문
 * - 왜? 각 탭마다 STOMP Client 를 갖느냐면, 배터리라던가 인터넷 혹은 기기 문제로 Connection 이 끊겼을때 서버에서 어떤 기기가 끊겼는지 알고싶음
 * = 결과적으로 단일(1) 웹브라우저에 - 단일(1) 서비스워커 설치 후 - 다수(4) STOMP Client 를 가질 수 있게되고 - 서버에서 4개의 STOMP Client 각각 관리 가능
 * 
 * - (단일) install : 최초로 Service Worker 가 로드/설치되었을때
 * - (다수) activate : 로드/설치된 이후 Service Worker 에 접속할때마다 이벤트 발행
 */
self.addEventListener("install", (event) => {
  BROADCAST_CHANNEL.postMessage({
    from: "service-worker",
    type: "INSTALLED",
  })
  BROADCAST_CHANNEL.onmessage = (event) => {
    const from = event.data.from
    const type = event.data.type
    const page = event.data.page;
    if (from === "window-client") {
      switch(type) {
        case "SUBSCRIBE":
          if (STOMP_CLIENTS[page]) { break; }
          STOMP_CLIENTS[page] = createStompClient(page, receiver(page));
          new Promise((resolve) => {
            STOMP_CLIENTS[page].client.activate();
            resolve();
          })
          break;
        case "PUBLISH":
          if (!STOMP_CLIENTS[page]) { console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] (${type}) STOMP Client doesn't exist. from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`); }
          const topic = `/routing`;
          const routes = event.data.payload.map((each) => ({
            target: each.target,
            to: each.to,
            desc: each.desc,
          }));
          STOMP_CLIENTS[page].publish(topic, routes);
          break;
        default:
          console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] Unknown message type: ${type}, from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`);
          break;
      }
    }
  }
});
