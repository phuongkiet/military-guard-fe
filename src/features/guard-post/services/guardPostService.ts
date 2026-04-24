import { requests } from "../../../api/agent";
import type { PaginatedList } from "../../../types/common";
import type {
  GetAllGuardPostsQuery,
  GuardPostResponse,
  GuardPostCreateDTO,
  GuardPostUpdateCommand,
  GuardPostUpdateDTO,
} from "../types/guardPost";

const endpoints = {
  list: "/GuardPosts",
  detail: (id: string) => `/GuardPosts/${id}`,
  create: "/GuardPosts",
  update: (id: string) => `/GuardPosts/${id}`,
  delete: (id: string) => `/GuardPosts/${id}`,
};

export const guardPostService = {
  list: async (query?: GetAllGuardPostsQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as GuardPostResponse[];
      const totalCount = items.length;
      const pageSize = query?.pageSize ?? (totalCount || 10);
      const pageIndex = query?.pageIndex ?? 1;

      return {
        items,
        totalCount,
        pageIndex,
        pageSize,
        totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1,
        hasPreviousPage: pageIndex > 1,
        hasNextPage: pageIndex * pageSize < totalCount,
      } satisfies PaginatedList<GuardPostResponse>;
    }

    const payload = data as {
      items?: GuardPostResponse[];
      pageIndex?: number;
      pageSize?: number;
      totalCount?: number;
      totalPages?: number;
      hasPreviousPage?: boolean;
      hasNextPage?: boolean;
    };

    const items = payload.items ?? [];
    const pageIndex = payload.pageIndex ?? query?.pageIndex ?? 1;
    const pageSize = payload.pageSize ?? query?.pageSize ?? 10;
    const totalCount = payload.totalCount ?? items.length;
    const totalPages =
      payload.totalPages ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1);
    const hasPreviousPage = payload.hasPreviousPage ?? pageIndex > 1;
    const hasNextPage = payload.hasNextPage ?? pageIndex < totalPages;

    return {
      items,
      pageIndex,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    } satisfies PaginatedList<GuardPostResponse>;
  },
  detail: (id: string) => requests.get<GuardPostResponse>(endpoints.detail(id)),
  create: (payload: GuardPostCreateDTO) =>
    requests.post<string>(endpoints.create, payload),
  update: (id: string, payload: GuardPostUpdateDTO) =>
    requests.put<void>(
      endpoints.update(id),
      { id, ...payload } satisfies GuardPostUpdateCommand,
    ),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
};
