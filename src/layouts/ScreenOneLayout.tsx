import { Outlet, useNavigate } from "react-router-dom";
import { PageType } from "../pages/types";
import useRemoteRouter from "../service-worker/routing";
import {
  HttpContentType,
  HttpMethod,
  useCommand,
  useQuery,
} from "../storage/entrypoint";
import { useRef } from "react";

export enum RevalidateTag {
  USER_TAG = "users",
}

export default function ScreenOneLayout() {
  const navigate = useNavigate();
  const { routing } = useRemoteRouter(PageType.S1, navigate);
  const inputRef = useRef(null);

  async function handleRouting(to: string) {
    await routing([
      {
        target: PageType.S2,
        to,
        // desc: `S2 페이지를 ${to} 로 이동시키자`,
      },
    ]);
  }

  const { data: updated, mutate } = useCommand({
    tag: RevalidateTag.USER_TAG,
    method: HttpMethod.PATCH,
    type: HttpContentType.JSON,
    url: "http://localhost:8080/api/users/1",
  });

  const { data: users, isLoading } = useQuery({
    tag: RevalidateTag.USER_TAG,
    method: HttpMethod.GET,
    url: "http://localhost:8080/api/users",
  });

  return (
    <>
      <h1>S1 Layout</h1>
      <p>S1 Layout</p>
      <button onClick={() => handleRouting("/s2")}>{"S2 -> /s2"}</button>
      <button onClick={() => handleRouting("/s2/test")}>
        {"S2 -> /s2/test"}
      </button>
      <div>
        {users?.map((user: any) => (
          <div key={user.id}>
            <div>{user.id}</div>
            <div>{user.name}</div>
            <div>{user.phoneNumber}</div>
          </div>
        ))}
      </div>
      <div>
        <input type="text" ref={inputRef} />
        <button
          onClick={() =>
            mutate({
              name: inputRef?.current?.value ?? "",
            })
          }
        >
          업데이트
        </button>
      </div>
      <Outlet />
    </>
  );
}
