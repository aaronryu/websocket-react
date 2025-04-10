import { PageType } from "../pages/types";

type StompSubscription = {
  topic: string;
  // callback: (message: any) => void;
};

export const register = async ({
  type,
  subscriptions = [],
}: {
  type: PageType;
  subscriptions?: StompSubscription[];
}) => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        `./${type}/worker.js`
        // { scope: `/${type}/` }
      );
      if (registration.installing) {
        console.log(`Service worker installing - page-type: ${type}`);
        // subscriptions.forEach(async (subscription) => {
        //   await subscribe(type, subscription);
        //   console.log(
        //     `Callback registering - page-type: ${type}, topic: ${subscription.topic}`
        //   );
        // });
      } else if (registration.waiting) {
        console.log(`Service worker installed - page-type: ${type}`);
      } else if (registration.active) {
        console.log(`Service worker active - page-type: ${type}`);
      }
      return registration;
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

export const getRegistrations = async () => {
  const registrations = [];
  if ("serviceWorker" in navigator) {
    const retreived = await navigator.serviceWorker.getRegistrations();
    registrations.push(...retreived);
    // console.log(registrations);
  }
  return registrations;
};

export const getRegistration = async (type: PageType) => {
  const registrations = await getRegistrations();
  return registrations.find((registration) =>
    registration.active?.scriptURL.includes(type)
  );
};

export const subscribe = async (type: PageType, payload: StompSubscription) => {
  await postMessage(type, {
    type: "SUBSCRIBE",
    payload: {
      topic: payload.topic,
      // callback: payload.callback,
    },
  });
};

export const publish = async (
  type: PageType,
  payload: [
    {
      target: PageType;
      to: string; // TODO - 모든 경로들에 대해 Enum 같은것으로 저장해두는것이 어떨까? React Router 설정도 JSON 으로 하는게 좋아보인다.
      desc: string;
    }
  ]
) => {
  await postMessage(type, {
    type: "ROUTING",
    payload: payload,
  });
};

export const postMessage = async (
  type: PageType,
  message: {
    type: string;
    payload?: any;
  }
) => {
  const registration = await getRegistration(type);
  if (!registration) {
    console.error(`No active service worker found for page-type: ${type}`);
    return;
  }
  console.log(message);
  registration?.active?.postMessage(message);
  console.log(`Message sent to service worker for page-type: ${type}`, message);
};

export const unregister = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log("Service worker unregistered");
    }
  }
};
