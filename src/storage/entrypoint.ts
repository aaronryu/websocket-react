import { useEffect, useState } from "react";
import useRemoteDispatcher from "../service-worker/http-request";

/**
 * 모든 API 호출은 useQuery, useCommand 을 사용한다.
 * CQRS(Command and Query Responsibility Segregation) : CRUD 에서 CRD 와 U 를 분리
 *
 * 1) Command : 데이터를 변경하는 API 호출 (POST, PUT, DELETE)
 *  - fetch().then() 호출 완료 시 Service Worker(STOMP) 통해
 *    > PUBLISH = useQuery 로직에 일괄적으로 API 재호출을 요청
 *
 * 2) Query : 데이터를 조회하는 API 호출 (GET)
 *  - fetch().then() 호출 완료 시 Service Worker(STOMP) 통해
 *    > SUBSCRIBE = useCommand 로직으로부터 일괄적으로 API 재호출 요청받기 위함
 */

/**
 * TODO : Class 로 만들면 아래에 useCommand, useQuery 에 들어가는 RevalidateTag 같은 파라미터를 일관화하기 좋을거같음
 * Class 정의했다면 이제 /store/user.ts 같은 파일들이 많이 생겨날텐데
 * 각각의 파일 내 private 내부에서만 사용하는 RevalidateTag enum 을 정의하여
 * 어떤 useCommand 가 어떤 useQuery 를 갱신하는지 RevalidateTag 통해 서로 명확히 알 수 있도록 하자
 */
// enum UserRevalidateTag {
//   USER_TOTAL = "/users",
//   USER_SINGLE = "/users/{}",
// }

// const {data, isLoading, error} = useQuery({
//   queryKey: ['reservation'],
//   queryFn: () => userApi.entrance({userId: userId, currentDate: currentDate}),
// });

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum HttpContentType {
  PARAM = "application/x-www-form-urlencoded",
  JSON = "application/json",
  FORM = "multipart/form-data",
}

interface HttpRequest {
  tag: string;
  method?: HttpMethod;
  type?: HttpContentType;
  url: string;
  body?: any;
}

interface HttpCommandResponse {
  data: any;
  isLoading: boolean /*; error: any, onError 등의 콜백 연결도 가능 */;
  mutate: (body: any) => void;
}

interface HttpQueryResponse {
  data: any;
  isLoading: boolean /*; error: any, onError 등의 콜백 연결도 가능 */;
}

export function useCommand({
  tag,
  method,
  type = HttpContentType.PARAM,
  url,
}: HttpRequest): HttpCommandResponse {
  const { dispatch } = useRemoteDispatcher();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState();

  async function mutate(body: any) {
    setLoading(false);
    const request = (function () {
      if (body === undefined) {
        return undefined;
      }
      switch (type) {
        case HttpContentType.PARAM:
          return new URLSearchParams(body);
        case HttpContentType.JSON:
          return JSON.stringify(body);
        case HttpContentType.FORM:
          return new FormData(body);
      }
    })();

    fetch(url, { method, headers: { "Content-Type": type }, body: request })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(true);
      })
      .then(() => {
        dispatch([{ tag }]);
      });
  }

  return { data, isLoading, mutate: mutate };
}

export function useQuery({
  tag,
  method = HttpMethod.GET,
  type = HttpContentType.PARAM,
  url,
  body: request,
}: HttpRequest): HttpQueryResponse {
  async function fetchData() {
    setLoading(false);
    const body = (function () {
      if (request === undefined) {
        return undefined;
      }
      switch (type) {
        case HttpContentType.PARAM:
          return new URLSearchParams(request);
        case HttpContentType.JSON:
          return JSON.stringify(request);
        case HttpContentType.FORM:
          return new FormData(request);
      }
    })();

    fetch(url, { method, headers: { "Content-Type": type }, body })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data.result);
        setLoading(true);
      });
  }

  const [isLoading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState();
  const { dispatch } = useRemoteDispatcher((receivedTag: string) => {
    if (receivedTag === tag) {
      fetchData();
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading };
}
