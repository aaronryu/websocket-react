import { PageType } from "../pages/types";

export const register = async ({ type }: { type: PageType }) => {
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
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

export const unregister = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(registrations);
    for (const registration of registrations) {
      await registration.unregister();
      console.log("Service worker unregistered");
    }
  }
};
