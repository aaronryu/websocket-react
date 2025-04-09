importScripts("../libraries/stomp/client.js");

const clients = [];

self.addEventListener("install", (event) => {
  const client = createStompClient({ debug: true, type: "s2" });
  clients.push(client);
  console.log(clients);
  event.waitUntil(
    new Promise((resolve) => {
      client.connect();
      resolve();
    })
  );
});

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  console.log("[S2] Received from client:", type, payload);

  if (type === "PING") {
    // 클라이언트에게 응답 보내기
    event.source.postMessage({
      type: "PONG",
      payload: { text: "(S2) Hello back from Service Worker!" },
    });
  }
});
