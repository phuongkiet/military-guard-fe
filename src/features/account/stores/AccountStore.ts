import { makeAutoObservable, runInAction } from "mobx";
import { accountService } from "../services/accountService";
import type {
  Account,
  CreateAccountDTO,
  GetAllAccountsQuery,
  UpdateAccountDTO,
} from "../types/account";
import type { ApiError } from "../api/agent";

export class AccountStore {
  list: Account[] = [];
  detail: Account | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  currentQuery: GetAllAccountsQuery = { pageIndex: 1, pageSize: 10 };
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchList(query?: GetAllAccountsQuery) {
    this.isLoading = true;
    this.error = null;
    const resolvedQuery = {
      ...this.currentQuery,
      ...query,
    } satisfies GetAllAccountsQuery;

    try {
      const data = await accountService.list(resolvedQuery);
      runInAction(() => {
        this.list = data.items;
        this.pageIndex = data.pageIndex;
        this.pageSize = data.pageSize;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.hasPreviousPage = data.hasPreviousPage;
        this.hasNextPage = data.hasNextPage;
        this.currentQuery = {
          ...resolvedQuery,
          pageIndex: data.pageIndex,
          pageSize: data.pageSize,
        };
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch accounts";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchDetail(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await accountService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch account detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: CreateAccountDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const accountId = await accountService.create(payload);
      await this.fetchDetail(accountId);
      await this.fetchList(this.currentQuery);
      return accountId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create account";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async update(id: string, payload: UpdateAccountDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await accountService.update(id, payload);
      await this.fetchDetail(id);
      await this.fetchList(this.currentQuery);
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to update account";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async delete(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await accountService.delete(id);
      runInAction(() => {
        this.list = this.list.filter((item) => item.id !== id);
        this.totalCount = Math.max(0, this.totalCount - 1);
        this.totalPages =
          this.pageSize > 0 ? Math.ceil(this.totalCount / this.pageSize) : this.totalPages;
        this.hasPreviousPage = this.pageIndex > 1;
        this.hasNextPage = this.pageIndex < this.totalPages;
        if (this.detail?.id === id) {
          this.detail = null;
        }
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to delete account";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async ban(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await accountService.ban(id);
      await this.fetchDetail(id);
      await this.fetchList(this.currentQuery);
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to ban account";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async unban(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await accountService.unban(id);
      await this.fetchDetail(id);
      await this.fetchList(this.currentQuery);
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to unban account";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  clearError() {
    this.error = null;
  }

  resetDetail() {
    this.detail = null;
  }
}
