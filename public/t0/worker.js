importScripts("../libraries/stomp/client.js");

const clients = [];

self.addEventListener("install", (event) => {
  const client = createStompClient({ debug: true, type: "t0" });
  clients.push(client);
  console.log(clients);
  event.waitUntil(
    new Promise((resolve) => {
      client.connect();
      resolve();
    })
  );
});
