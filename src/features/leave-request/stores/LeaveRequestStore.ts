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
  selectedLeaveRequest: LeaveRequest | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  selectLeaveRequest = (id: string) => {
    const request = this.list.find(r => r.id === id);
    console.log("Selected Leave Request:", request);
    if (request) this.selectedLeaveRequest = request;
  }

  // Hàm clear selected item khi đóng Modal
  clearSelectedLeaveRequest = () => {
    this.selectedLeaveRequest = null;
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
      await leaveRequestService.create(payload);
      await this.fetchList({ pageIndex: 1, pageSize: this.pageSize });
      
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Tạo đơn xin phép thất bại.";
      });
      throw err;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async update(id: string, payload: LeaveRequestUpdateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.update(id, payload);
      
      // THIẾU DÒNG NÀY: Cập nhật xong thì load lại đúng trang hiện tại
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Cập nhật thất bại.";
      });
      throw err;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async delete(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.delete(id);
      
      // THIẾU DÒNG NÀY: Xóa xong phải tính toán lại trang và load lại
      let targetPage = this.pageIndex;
      if (this.list.length === 1 && this.pageIndex > 1) {
        targetPage -= 1; 
      }
      await this.fetchList({ pageIndex: targetPage, pageSize: this.pageSize });
      
      runInAction(() => {
        if (this.selectedLeaveRequest?.id === id) this.selectedLeaveRequest = null;
      });
    } catch (err) {
      // ...
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async approve(id: string, _approvedBy: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.processStatus(id, {
        leaveRequestId: id,
        newStatus: 1, // 1 là Literal Type cho Approved (Khớp 100% với DTO 1 | 2)
      });
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Lỗi khi duyệt đơn xin phép.";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async reject(id: string, _rejectedBy: string) {
    this.isLoading = true;
    this.error = null;
    try {
      await leaveRequestService.processStatus(id, {
        leaveRequestId: id,
        newStatus: 2, // 2 là Literal Type cho Rejected
      });
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Lỗi khi từ chối đơn xin phép.";
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

  async processStatus(id: string, newStatus: Exclude<LeaveStatus, 0>) {
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
        this.error = apiError.message || "Lỗi khi xử lý đơn xin phép.";
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
