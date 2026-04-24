import { requests } from "../../../api/agent";
import type { PaginatedList } from "../../../types/common";
import type {
  GetPagedLeaveRequestsQuery,
  LeaveRequestResponse,
  LeaveRequestCreateDTO,
  LeaveRequestUpdateDTO,
  ProcessLeaveRequestCommand,
} from "../types/leaveRequest";

const endpoints = {
  list: "/LeaveRequests",
  detail: (id: string) => `/LeaveRequests/${id}`,
  create: "/LeaveRequests",
  update: (id: string) => `/LeaveRequests/${id}`,
  delete: (id: string) => `/LeaveRequests/${id}`,
  processStatus: (id: string) => `/LeaveRequests/${id}/status`,
};

export const leaveRequestService = {
  list: async (query?: GetPagedLeaveRequestsQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as LeaveRequestResponse[];
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
      } satisfies PaginatedList<LeaveRequestResponse>;
    }

    const payload = data as {
      items?: LeaveRequestResponse[];
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
    } satisfies PaginatedList<LeaveRequestResponse>;
  },
  detail: (id: string) => requests.get<LeaveRequestResponse>(endpoints.detail(id)),
  create: (payload: LeaveRequestCreateDTO) =>
    requests.post<string>(endpoints.create, payload),
  update: (id: string, payload: LeaveRequestUpdateDTO) =>
    requests.put<void>(endpoints.update(id), payload),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
  processStatus: (id: string, command: ProcessLeaveRequestCommand) =>
    requests.patch<void>(endpoints.processStatus(id), {
      leaveRequestId: command.leaveRequestId,
      newStatus: command.newStatus,
    }),
};
