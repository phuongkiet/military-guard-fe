import { requests } from "../api/agent";
import type {
  GetAllMilitiasQuery,
  MilitiaCreateDTO,
  MilitiaResponse,
  MilitiaUpdateCommand,
  MilitiaUpdateDTO,
  PaginatedList,
} from "../types/militia";

const endpoints = {
  list: "/Militias",
  detail: (id: string) => `/Militias/${id}`,
  create: "/Militias",
  update: (id: string) => `/Militias/${id}`,
  delete: (id: string) => `/Militias/${id}`,
};

export const militiaService = {
  list: async (query?: GetAllMilitiasQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as MilitiaResponse[];
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
      } satisfies PaginatedList<MilitiaResponse>;
    }

    const payload = data as {
      items?: MilitiaResponse[];
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
    } satisfies PaginatedList<MilitiaResponse>;
  },
  detail: (id: string) => requests.get<MilitiaResponse>(endpoints.detail(id)),
  create: (payload: MilitiaCreateDTO) =>
    requests.post<string>(endpoints.create, payload),
  update: (id: string, payload: MilitiaUpdateDTO) =>
    requests.put<void>(
      endpoints.update(id),
      { id, ...payload } satisfies MilitiaUpdateCommand,
    ),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
};
