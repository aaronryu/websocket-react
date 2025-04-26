importScripts("./client.js");

/**
 * 본 worker.js 는 Service Worker 내 STOMP Client 들을 생성하기 위한 파일이다.
 * - 2개의 Broadcast Channel 을 사용하여, Service Worker 와 Window Client 간의 통신을 담당
 * - 각 Broadcast Channel 마다 목적이 다른데, 아래와 같이 정리하면 이해가 쉽다.
 * 
 *    (1) 원격 "Routing" 을 위한 Broadcast Channel
 *     = 채널명 "routing"-between-window-client-and-service-worker
 *      - 아래와 같은 StompClient 가 등록된다.
 *          {
 *            "t0": StompClient { subscribe: "/sub/t0/routing" },
 *            "t1": StompClient { subscribe: "/sub/t1/routing" },
 *            "s1": StompClient { subscribe: "/sub/s1/routing" },
 *            "s2": StompClient { subscribe: "/sub/s2/routing" },
 *          }
 * 
 *    (2) 원격 "Syncing" 을 위한 Broadcast Channel
 *     = 채널명 "syncing"-between-window-client-and-service-worker
 *      - 아래와 같은 StompClient 가 등록된다.
 *          { "global": StompClient { subscribe: "/sub/dispatch" }, } 
 */

/**
 * (1) 원격 "Routing" 을 위한 Broadcast Channel
 * = 채널명 "routing"-between-window-client-and-service-worker
 *  - 아래와 같은 StompClient 가 등록된다.
 *    - production  : 단일 STOMP Client 사용
 *    - development : 다수 STOMP Client 사용 (하나의 웹브라우저 = 하나의 서비스워커에서 4개의 탭)
 *      {
 *        "t0": StompClient { subscribe: "/sub/t0/routing" },
 *        "t1": StompClient { subscribe: "/sub/t1/routing" },
 *        "s1": StompClient { subscribe: "/sub/s1/routing" },
 *        "s2": StompClient { subscribe: "/sub/s2/routing" },
 *      }
 *  - 주고받는 메세지는 아래와 같다.
 *    (1) Window Client -> Service Worker
 *      [ { target: 's1', to: '/s1/another', desc: 'S1에서 무엇을 표기하라' }
 *      , { target: 's2', to: '/s2/another', desc: 'S2에서 무엇을 표기하라' } ]
 *    (2) Window Client <- Service Worker
 *      { '/s2/another', desc: 'S2에서 무엇을 표기하라' }
 */
const __1_STOMP_CLIENTS_FOR_ROUTING = {};
const __1_BROADCAST_CHANNEL_FOR_ROUTING = new BroadcastChannel("routing-between-window-client-and-service-worker");

const router = (page) => (message) => {
  __1_BROADCAST_CHANNEL_FOR_ROUTING.postMessage({
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
  __1_BROADCAST_CHANNEL_FOR_ROUTING.postMessage({
    from: "service-worker",
    type: "INSTALLED",
  })
  __1_BROADCAST_CHANNEL_FOR_ROUTING.onmessage = (event) => {
    const from = event.data.from
    const type = event.data.type
    const page = event.data.page;
    if (from === "window-client") {
      switch(type) {
        case "SUBSCRIBE":
          if (__1_STOMP_CLIENTS_FOR_ROUTING[page]) { break; }
          __1_STOMP_CLIENTS_FOR_ROUTING[page] = createStompClient(page, [
            { topic: `/${page}/routing`, callback: router(page) },
          ]);
          new Promise((resolve) => {
            __1_STOMP_CLIENTS_FOR_ROUTING[page].client.activate();
            resolve();
          })
          break;
        case "PUBLISH":
          if (!__1_STOMP_CLIENTS_FOR_ROUTING[page]) { console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] (${type}) STOMP Client doesn't exist. from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`); }
          const topic = `/routing`;
          const routes = event.data.payload.map((each) => ({
            target: each.target,
            to: each.to,
            desc: each.desc,
          }));
          __1_STOMP_CLIENTS_FOR_ROUTING[page].publish(topic, routes);
          break;
        default:
          console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] Unknown message type: ${type}, from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`);
          break;
      }
    }
  }
});

/**
 * (2) 원격 "Syncing" 을 위한 Broadcast Channel
 * = 채널명 "syncing"-between-window-client-and-service-worker
 *  - 아래와 같은 StompClient 가 등록된다.
 *      {
 *        "global": StompClient { subscribe: "/sub/dispatch" },
 *      }
 *  - 주고받는 메세지는 아래와 같다. 브로드캐스트 형식으로 보내기때문에 target 이랄게 없다.
 *    (1) Window Client -> Service Worker
 *      { tag: 'users' }
 *    (2) Window Client <- Service Worker
 *      { tag: 'users' }
 */
const __2_STOMP_CLIENTS_FOR_SYNCING = {};
const __2_BROADCAST_CHANNEL_FOR_SYNCING = new BroadcastChannel("syncing-between-window-client-and-service-worker");

const syncer = (page) => (message) => {
  __2_BROADCAST_CHANNEL_FOR_SYNCING.postMessage({
    from: "service-worker",
    type: "RECEIVE",
    page,
    payload: { tag: message.tag },
  })
}

self.addEventListener("install", (event) => {
  __2_BROADCAST_CHANNEL_FOR_SYNCING.postMessage({
    from: "service-worker",
    type: "INSTALLED",
  })
  __2_BROADCAST_CHANNEL_FOR_SYNCING.onmessage = (event) => {
    const from = event.data.from
    const type = event.data.type
    const page = event.data.page;
    if (from === "window-client") {
      switch(type) {
        case "SUBSCRIBE":
          if (__2_STOMP_CLIENTS_FOR_SYNCING[page]) { break; }
          __2_STOMP_CLIENTS_FOR_SYNCING[page] = createStompClient(page, [
            { topic: `/dispatch`, callback: syncer(page) },
          ]);
          new Promise((resolve) => {
            __2_STOMP_CLIENTS_FOR_SYNCING[page].client.activate();
            resolve();
          })
          break;
        case "PUBLISH":
          if (!__2_STOMP_CLIENTS_FOR_SYNCING[page]) { console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] (${type}) STOMP Client doesn't exist. from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`); }
          const topic = `/dispatch`;
          const tags = event.data.payload.map((each) => ({
            tag: each.tag,
          }));
          __2_STOMP_CLIENTS_FOR_SYNCING[page].publish(topic, tags);
          break;
        default:
          console.error(`[BROADCAST_CHANNEL in SERVICE_WORKER] Unknown message type: ${type}, from: ${from}, page: ${page}, payload: ${JSON.stringify(event.data.payload)}`);
          break;
      }
    }
  }
});
