import { makeAutoObservable, runInAction } from "mobx";
import { dutyShiftService } from "../services/dutyShiftService";
import type {
  DutyShift,
  DutyShiftCreateDTO,
  DutyShiftUpdateDTO,
  GetAllDutyShiftsQuery,
} from "../types/dutyShift";
import type { ApiError } from "../../../api/agent";

export class DutyShiftStore {
  list: DutyShift[] = [];
  detail: DutyShift | null = null;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  selectedDutyShift: DutyShift | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  selectDutyShift = (id: string) => {
    const shift = this.list.find(s => s.id === id);
    console.log("Selected Duty Shift:", shift);
    if (shift) this.selectedDutyShift = shift;
  }

  // Hàm clear selected item khi đóng Modal
  clearSelectedDutyShift = () => {
    this.selectedDutyShift = null;
  }

  async fetchList(query?: GetAllDutyShiftsQuery) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await dutyShiftService.list(query);
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
        this.error = apiError.message || "Failed to fetch duty shifts";
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
      const data = await dutyShiftService.detail(id);
      runInAction(() => {
        this.detail = data;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to fetch duty shift detail";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async create(payload: DutyShiftCreateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      const dutyShiftId = await dutyShiftService.create(payload);
      await this.fetchDetail(dutyShiftId);
      return dutyShiftId;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to create duty shift";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async update(id: string, payload: DutyShiftUpdateDTO) {
    this.isLoading = true;
    this.error = null;
    try {
      await dutyShiftService.update(id, payload);
      await this.fetchDetail(id);
      await this.fetchList({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Failed to update duty shift";
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
      await dutyShiftService.delete(id);
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
        this.error = apiError.message || "Failed to delete duty shift";
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
