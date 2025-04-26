import { PageType } from "../pages/types";
import useStompServiceWorker, { BroadcastChannelType } from "./entrypoint";

interface Route {
  to: string;
  desc?: string;
}

interface RouteRequest extends Route {
  target: PageType;
}

export default function useRemoteRouter(
  currentPage: PageType,
  navigate: (to: string) => void
) {
  const { publish } = useStompServiceWorker(
    BroadcastChannelType.CHANNEL_FOR_ROUTING,
    currentPage,
    (route: Route/* Subscribe Payload 타입으로 명시해주어야한다. */) => {
      navigate(route.to)
    },
  );

  return {
    routing: (routes: RouteRequest[]/* Publish Payload 타입으로 명시해주어야한다. */) => {
      publish(routes);
    },
  };
}