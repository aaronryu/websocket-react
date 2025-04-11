// import Stomp from "../libraries/stomp.umd.min.js";
importScripts("https://cdn.jsdelivr.net/npm/@stomp/stompjs@6.1.2/bundles/stomp.umd.min.js");

const STORE_ID = "2dhdj1we";

function createStompClient(page, callback, debug = false) {
  const topics = [
    `/${page}/routing`,
  ]

  const stompClient = new StompJs.Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      "accept-version": "1.2,1.1,1.0",
      // 'heart-beat': '4000,4000',
      "x-client-id": `${STORE_ID}-${page}`, // 8h12eh-t0
    },

    connectionTimeout: 1000, // 10000,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    heartbeatStrategy: "worker",
    debug: debug ? console.log : () => {},

    onConnect: () => {
      console.log("[STOMP in SERVICE_WORKER] Connected to WebSocket");  
      topics.forEach((topic) => {
        subscribe(topic, callback);
      });
    },
    onStompError: (frame) => {
      console.error("[STOMP in SERVICE_WORKER] Broker reported error: " + frame.headers["message"]);
      console.error("[STOMP in SERVICE_WORKER] Additional details: " + frame.body);
    },
  });

  const subscribe = (topic, callback) => {
    const destination = `/sub` + topic;
    //
    stompClient.subscribe(
      destination,
      (response) => {
        console.log(`[STOMP in SERVICE_WORKER] Received message - topic: ${topic}, message: ${response}`);
        callback(JSON.parse(response.body));
      },
    );
    console.log(`[STOMP in SERVICE_WORKER] Subscribed to topic: ${topic}`);
  };

  const publish = (topic, payload) => {
    const destination = `/pub` + topic;
    //
    stompClient.publish({
      destination,
      body: JSON.stringify(payload),
    });
    console.log(`[STOMP in SERVICE_WORKER] Published message - topic: ${topic}, payload: ${JSON.stringify(payload)}`);
  };

  return {
    client: stompClient,
    publish,
  };
}
