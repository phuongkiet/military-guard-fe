import { requests } from "../api/agent";
import type {
  AccountResponse,
  CreateAccountDTO,
  GetAllAccountsQuery,
  PaginatedList,
  UpdateAccountCommand,
  UpdateAccountDTO,
} from "../types/account";

const endpoints = {
  list: "/Accounts",
  detail: (id: string) => `/Accounts/${id}`,
  create: "/Accounts",
  update: (id: string) => `/Accounts/${id}`,
  delete: (id: string) => `/Accounts/${id}`,
  ban: (id: string) => `/Accounts/${id}/ban`,
  unban: (id: string) => `/Accounts/${id}/unban`,
};

export const accountService = {
  list: async (query?: GetAllAccountsQuery) => {
    const data = await requests.get<unknown>(endpoints.list, query);

    if (Array.isArray(data)) {
      const items = data as AccountResponse[];
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
      } satisfies PaginatedList<AccountResponse>;
    }

    const payload = data as {
      items?: AccountResponse[];
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
    } satisfies PaginatedList<AccountResponse>;
  },
  detail: (id: string) => requests.get<AccountResponse>(endpoints.detail(id)),
  create: async (payload: CreateAccountDTO) => {
    const data = await requests.post<unknown>(endpoints.create, payload);

    if (typeof data === "string") {
      return data;
    }

    const created = data as { id?: string; Id?: string };
    const accountId = created.id ?? created.Id;

    if (!accountId) {
      throw new Error("Invalid create account response: missing id");
    }

    return accountId;
  },
  update: (id: string, payload: UpdateAccountDTO) =>
    requests.put<void>(
      endpoints.update(id),
      { id, ...payload } satisfies UpdateAccountCommand,
    ),
  delete: (id: string) => requests.delete<void>(endpoints.delete(id)),
  ban: (id: string) => requests.put<void>(endpoints.ban(id)),
  unban: (id: string) => requests.put<void>(endpoints.unban(id)),
};
