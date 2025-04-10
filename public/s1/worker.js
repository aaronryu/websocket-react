importScripts("../libraries/stomp/client.js");

let client;

self.addEventListener("install", (event) => {
  client = createStompClient({ debug: true, type: "s1" });
  event.waitUntil(
    new Promise((resolve) => {
      client.connect();
      resolve();
    })
  );
});

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  console.log("[S1--] Received from client:", type, payload);

  if (type === "PING") {
    // 클라이언트에게 응답 보내기
    event.source?.postMessage({
      type: "PONG",
      payload: { text: "(S1) Hello back from Service Worker!" },
    });
  }
  if (type === "SUBSCRIBE") {
    // 클라이언트에게 응답 보내기
    client.subscribe(payload.topic, (message) => {
      console.log("[S1] Received message:", message);
      event.source?.postMessage({
        type: "ROUTES",
        payload: { to: message.body.to, desc: message.body.desc },
      });
    });
  }
  if (type === "ROUTING") {
    console.log(payload);
    // # 기존에는 /s2/routing 처럼 각각 라우팅을 위한 토픽을 만들었는데, 그냥 다 합치는게나은듯
    // payload.forEach((each) => {
    //   const topic = `/${each.target}/routing`;
    //   client.publish(topic, {
    //     to: each.to,
    //     desc: each.desc,
    //   });
    // });
    // # 다 합쳐서 /pub/routing 에서 처리하자
    payload.forEach((each) => {
      const topic = `/${each.target}/routing`;
      client.publish(topic, {
        to: each.to,
        desc: each.desc,
      });
    });
  }
});
