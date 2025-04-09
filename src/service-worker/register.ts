import { StompSubscription } from "./../../node_modules/@stomp/stompjs/esm6/stomp-subscription.d";
import { PageType } from "../pages/types";

type StompSubscription = {
  topic: string;
  callback: (message: any) => void;
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
