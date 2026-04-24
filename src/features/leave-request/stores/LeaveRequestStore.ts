import { makeAutoObservable, runInAction } from "mobx";
import { leaveRequestService } from "../services/leaveRequestService";
import type {
  GetPagedLeaveRequestsQuery,
  LeaveRequest,
  LeaveRequestCreateDTO,
  LeaveStatus,
  LeaveRequestUpdateDTO,
} from "../types/leaveRequest";
import type { ApiError } from "../../../api/agent";

export class LeaveRequestStore {
  list: LeaveRequest[] = [];
  detail: LeaveRequest | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async fetchList(query?: GetPagedLeaveRequestsQuery) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await leaveRequestService.list(query);
      runInAction(() => {
        this.list = data.items;
        this.pageIndex = data.pageIndex;
        this.pageSize = data.pageSize;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.hasPreviousPage = data.hasPreviousPage;
        this.hasNextPage = data.hasNextPage;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch leave requests";
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
      const data = await leaveRequestService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch leave request detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: LeaveRequestCreateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const leaveRequestId = await leaveRequestService.create(payload);
      await this.fetchDetail(leaveRequestId);
      return leaveRequestId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create leave request";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async update(id: string, payload: LeaveRequestUpdateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.update(id, payload);
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to update leave request";
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
      await leaveRequestService.delete(id);
      runInAction(() => {
        this.list = this.list.filter((item) => item.id !== id);
        if (this.detail?.id === id) {
          this.detail = null;
        }
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to delete leave request";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async approve(id: string, _approvedBy: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.processStatus(id, {
        leaveRequestId: id,
        newStatus: "approved",
      });
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to approve leave request";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async reject(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.processStatus(id, {
        leaveRequestId: id,
        newStatus: "rejected",
      });
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to reject leave request";
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

  async processStatus(id: string, newStatus: Exclude<LeaveStatus, "pending">) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.processStatus(id, {
        leaveRequestId: id,
        newStatus,
      });
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to process leave request";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  resetDetail() {
    this.detail = null;
  }
}
