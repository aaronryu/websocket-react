import { Client, TickerStrategy, Versions } from "@stomp/stompjs";

export function createStompClient({ debug = false, storeId, type }) {
  const stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws",
    // webSocketFactory,
    stompVersions: new Versions(["1.2", "1.1", "1.0"]),
    connectHeaders: {
      // 'accept-version': '1.2,1.1,1.0',
      // 'heart-beat': '4000,4000',
      "x-client-id": `${storeId}-${type}`, // 8h12eh-t0
    },

    connectionTimeout: 1000, // 10000,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    heartbeatStrategy: TickerStrategy.Worker,
    debug: debug ? console.log : () => {},

    onConnect: () => {
      console.log("Connected to WebSocket");
      stompClient.subscribe("/topic/greetings", (response) => {
        console.log("Received message:", response.body);
        setMessage(JSON.parse(response.body).content);
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
