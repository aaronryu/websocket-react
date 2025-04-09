// import Stomp from "../libraries/stomp.umd.min.js";
importScripts(
  "https://cdn.jsdelivr.net/npm/@stomp/stompjs@6.1.2/bundles/stomp.umd.min.js"
);

const STORE_ID = "2dhdj1we";

function createStompClient({ debug = false, type, subscriptions = [] }) {
  const stompClient = new StompJs.Client({
    brokerURL: "ws://localhost:8080/ws",
    connectHeaders: {
      "accept-version": "1.2,1.1,1.0",
      // 'heart-beat': '4000,4000',
      "x-client-id": `${STORE_ID}-${type}`, // 8h12eh-t0
    },

    connectionTimeout: 1000, // 10000,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    heartbeatStrategy: "worker",
    debug: debug ? console.log : () => {},

    onConnect: () => {
      console.log("Connected to WebSocket");
      subscriptions.forEach((subscription) => {
        stompClient.subscribe(subscription.topic, (response) => {
          if (debug) {
            console.log(
              `Received message - topic: ${subscription.topic}, message: ` +
                response.body
            );
          }
          subscription.callback(JSON.parse(response.body));
        });
      });
    },
    onStompError: (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    },
  });

  const connect = () => {
    stompClient.activate();
  };
  const disconnect = () => {
    stompClient.deactivate();
  };
  const sendMessage = (message) => {
    stompClient.publish({
      destination: "/app/hello",
      body: JSON.stringify({ name: message }),
    });
  };
  const setMessage = (message) => {
    console.log("Message received: ", message);
    // setState({ message });
    // setTimeout(() => {
    //   setState({ message: "" });
    // }, 3000);
  };

  return {
    // stompClient,
    connect,
    disconnect,
    sendMessage,
  };
}
