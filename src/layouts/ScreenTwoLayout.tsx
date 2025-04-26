import { Outlet, useNavigate } from "react-router-dom";
import { PageType } from "../pages/types";
import useRemoteRouter from "../service-worker/routing";
import { HttpMethod, useQuery } from "../storage/entrypoint";
import { RevalidateTag } from "./ScreenOneLayout";

export default function ScreenTwoLayout() {
  const navigate = useNavigate();
  const { routing } = useRemoteRouter(PageType.S2, navigate);

  async function handleRouting(to: string) {
    await routing([
      {
        target: PageType.S1,
        to,
        // desc: `S1 페이지를 ${to} 로 이동시키자`,
      },
    ]);
  }
  const { data: users, isLoading } = useQuery({
    tag: RevalidateTag.USER_TAG,
    method: HttpMethod.GET,
    url: "http://localhost:8080/api/users",
  });

  return (
    <>
      <h1>S2 Layout</h1>
      <p>S2 Layout</p>
      <button onClick={() => handleRouting("/s1")}>{"S1 -> /s1"}</button>
      <button onClick={() => handleRouting("/s1/test")}>
        {"S1 -> /s1/test"}
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
      <Outlet />
    </>
  );
}
