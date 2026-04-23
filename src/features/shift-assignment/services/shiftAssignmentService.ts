import { requests } from "../api/agent";
import type {
  GetAllShiftAssignmentsQuery,
  ShiftAssignmentCreateDTO,
  ShiftAssignmentResponse,
  ShiftAssignmentUpdateCommand,
  ShiftAssignmentUpdateDTO,
  PaginatedList,
} from "../types/shiftAssignment";

const endpoints = {
  list: "/ShiftAssignments",
  detail: (id: string) => `/ShiftAssignments/${id}`,
  create: "/ShiftAssignments",
  update: (id: string) => `/ShiftAssignments/${id}`,
  delete: (id: string) => `/ShiftAssignments/${id}`,
};

export const shiftAssignmentService = {
  list: async (query?: GetAllShiftAssignmentsQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as ShiftAssignmentResponse[];
      const totalCount = items.length;
      const pageSize = query?.pageSize ?? 5;
      const requestedPageIndex = query?.pageIndex ?? 1;
      const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
      const pageIndex = totalPages > 0 ? Math.min(Math.max(1, requestedPageIndex), totalPages) : 1;
      const start = (pageIndex - 1) * pageSize;
      const pagedItems = pageSize > 0 ? items.slice(start, start + pageSize) : items;

      return {
        items: pagedItems,
        totalCount,
        pageIndex,
        pageSize,
        totalPages,
        hasPreviousPage: pageIndex > 1,
        hasNextPage: pageIndex < totalPages,
      } satisfies PaginatedList<ShiftAssignmentResponse>;
    }

    const payload = data as {
      items?: ShiftAssignmentResponse[];
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
    } satisfies PaginatedList<ShiftAssignmentResponse>;
  },
  detail: (id: string) => requests.get<ShiftAssignmentResponse>(endpoints.detail(id)),
  create: (payload: ShiftAssignmentCreateDTO) =>
    requests.post<string>(endpoints.create, payload),
  update: (id: string, payload: ShiftAssignmentUpdateDTO) =>
    requests.put<void>(
      endpoints.update(id),
      { id, ...payload } satisfies ShiftAssignmentUpdateCommand,
    ),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
};
