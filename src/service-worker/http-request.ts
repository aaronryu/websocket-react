import { PageType } from "../pages/types";
import useStompServiceWorker, { BroadcastChannelType } from "./entrypoint";

interface Action {
  tag: string;
}

export default function useRemoteDispatcher(
  revalidate?: (tag: string) => void
) {
  const { publish } = useStompServiceWorker(
    BroadcastChannelType.CHANNEL_FOR_SYNCING,
    PageType.GLOBAL,
    (action: Action /* Subscribe Payload 타입으로 명시해주어야한다. */) => {
      revalidate && revalidate(action.tag);
    }
  );

  return {
    dispatch: (
      actions: Action[] /* Publish Payload 타입으로 명시해주어야한다. */
    ) => {
      publish(actions);
    },
  };
}
