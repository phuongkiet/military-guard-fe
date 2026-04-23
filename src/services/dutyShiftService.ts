import { requests } from "../api/agent";
import type {
  GetAllDutyShiftsQuery,
  DutyShiftResponse,
  DutyShiftCreateDTO,
  DutyShiftUpdateCommand,
  DutyShiftUpdateDTO,
  PaginatedList,
} from "../types/dutyShift";

const endpoints = {
  list: "/DutyShifts",
  detail: (id: string) => `/DutyShifts/${id}`,
  create: "/DutyShifts",
  update: (id: string) => `/DutyShifts/${id}`,
  delete: (id: string) => `/DutyShifts/${id}`,
};

export const dutyShiftService = {
  list: async (query?: GetAllDutyShiftsQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as DutyShiftResponse[];
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
      } satisfies PaginatedList<DutyShiftResponse>;
    }

    const payload = data as {
      items?: DutyShiftResponse[];
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
    } satisfies PaginatedList<DutyShiftResponse>;
  },
  detail: (id: string) => requests.get<DutyShiftResponse>(endpoints.detail(id)),
  create: (payload: DutyShiftCreateDTO) =>
    requests.post<string>(endpoints.create, payload),
  update: (id: string, payload: DutyShiftUpdateDTO) =>
    requests.put<void>(
      endpoints.update(id),
      { id, ...payload } satisfies DutyShiftUpdateCommand,
    ),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
};
