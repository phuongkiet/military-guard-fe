import { makeAutoObservable, runInAction } from "mobx";
import { shiftAssignmentService } from "../services/shiftAssignmentService";
import type {
  AvailableMilitiaDto,
  GetAllShiftAssignmentsQuery,
  ShiftAssignment,
  ShiftAssignmentCreateDTO,
  ShiftAssignmentUpdateDTO,
} from "../types/shiftAssignment";
import type { ApiError } from "../../../api/agent";

export class ShiftAssignmentStore {
  list: ShiftAssignment[] = [];
  detail: ShiftAssignment | null = null;
  pageIndex: number = 1;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  availableSubstitutes: AvailableMilitiaDto[] = [];
  isLoadingSubstitutes = false;
  isSubstituting = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  loadAvailableSubstitutes = async (absentAssignmentId: string) => {
    this.isLoadingSubstitutes = true;
    this.availableSubstitutes = []; // Reset list cũ
    try {
      // Nhớ viết thêm method getAvailableSubstitutes trong service nhé
      const data = await shiftAssignmentService.getAvailableSubstitutes(absentAssignmentId);
      runInAction(() => {
        this.availableSubstitutes = data;
      });
    } catch (error) {
      window.alert("Không thể tải danh sách quân chi viện");
    } finally {
      runInAction(() => {
        this.isLoadingSubstitutes = false;
      });
    }
  };

  async fetchList(query?: GetAllShiftAssignmentsQuery) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await shiftAssignmentService.list(query);
      const resolvedPageSize = data.pageSize > 0 ? data.pageSize : this.pageSize;
      const resolvedTotalCount = Math.max(0, data.totalCount);
      const calculatedTotalPages =
        resolvedPageSize > 0 ? Math.ceil(resolvedTotalCount / resolvedPageSize) : 0;
      const resolvedTotalPages = data.totalPages > 0 ? data.totalPages : calculatedTotalPages;
      const resolvedPageIndex =
        resolvedTotalPages > 0
          ? Math.min(Math.max(1, data.pageIndex), resolvedTotalPages)
          : 1;

      runInAction(() => {
        this.list = data.items;
        this.pageIndex = resolvedPageIndex;
        this.pageSize = resolvedPageSize;
        this.totalCount = resolvedTotalCount;
        this.totalPages = resolvedTotalPages;
        this.hasPreviousPage = resolvedPageIndex > 1;
        this.hasNextPage = resolvedPageIndex < resolvedTotalPages;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch shift assignments";
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
      const data = await shiftAssignmentService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch shift assignment detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: ShiftAssignmentCreateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const shiftAssignmentId = await shiftAssignmentService.create(payload);
      await this.fetchDetail(shiftAssignmentId);
      return shiftAssignmentId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create shift assignment";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async update(id: string, payload: ShiftAssignmentUpdateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await shiftAssignmentService.update(id, payload);
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to update shift assignment";
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
      await shiftAssignmentService.delete(id);
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
        this.error = apiError.message || "Failed to delete shift assignment";
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

  executeSubstitution = async (absentAssignmentId: string, substituteId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await shiftAssignmentService.substitute({
        absentAssignmentId: absentAssignmentId,
        substituteMilitiaId: substituteId,
      });
      
      // Thành công -> Reset data
      runInAction(() => {
        this.availableSubstitutes = [];
      });
      
      return response;
    } catch (error: any) {
      const apiError = error as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Lỗi khi điều động thay thế";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}
