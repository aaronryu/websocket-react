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
      // PageType.THIS 인 경우 현재 currentPage 대입하도록 한번 수정
      publish(routes.map((route) => ({...route, target: route.target === PageType.THIS ? currentPage : route.target })));
    },
  };
}