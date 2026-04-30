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
  currentTime: Date = new Date();
  timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private parseShiftTimeToTimestamp(timeValue: string): number {
    const hhmmMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeValue?.trim() ?? "");
    if (hhmmMatch) {
      const hours = Number(hhmmMatch[1]);
      const minutes = Number(hhmmMatch[2]);
      const seconds = hhmmMatch[3] ? Number(hhmmMatch[3]) : 0;

      if (
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59 &&
        seconds >= 0 &&
        seconds <= 59
      ) {
        const date = new Date(this.currentTime);
        date.setMilliseconds(0);
        date.setHours(hours, minutes, seconds, 0);
        return date.getTime();
      }
    }

    return new Date(timeValue).getTime();
  }

  private getShiftRange(
    shift: DutyShift,
  ): { start: number; end: number; isOvernight: boolean } | null {
    const start = this.parseShiftTimeToTimestamp(shift.startTime);
    const end = this.parseShiftTimeToTimestamp(shift.endTime);

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return null;
    }

    // Nếu ca qua đêm (ví dụ 22:00 -> 06:00), cộng thêm 1 ngày cho end.
    if (end < start) {
      return { start, end: end + 24 * 60 * 60 * 1000, isOvernight: true };
    }

    return { start, end, isOvernight: false };
  }

  private normalizeNowForRange(range: {
    start: number;
    end: number;
    isOvernight: boolean;
  }): number {
    let now = this.currentTime.getTime();

    // Đồng bộ mốc now với ca qua đêm khi đã qua 00:00.
    if (range.isOvernight && now < range.start) {
      now += 24 * 60 * 60 * 1000;
    }

    return now;
  }

  startTimeSync = () => {
    // Tránh mở nhiều interval cùng lúc
    if (this.timerId) clearInterval(this.timerId); 
    
    // Cập nhật mỗi giây để bắt đúng thời điểm chuyển ca cho màn hình live.
    this.timerId = setInterval(() => {
      runInAction(() => {
        this.currentTime = new Date();
      });
    }, 1000); 
  };

  // Hàm dọn dẹp khi user đăng xuất
  stopTimeSync = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  };

  // 3. SENIOR CODE: Computed Property tự động nội suy ca hiện tại
  // MobX sẽ tự động chạy lại hàm này mỗi khi this.currentTime hoặc this.list thay đổi
  get currentActiveShift() {
    if (!this.list || this.list.length === 0) return null;

    return this.list.find((shift) => {
      const range = this.getShiftRange(shift);
      if (!range) return false;

      const now = this.normalizeNowForRange(range);
      const { start, end } = range;

      // Nới lỏng logic: Cho phép điểm danh trước 15 phút (900000 ms) khi ca bắt đầu
      const allowedCheckInTime = start - 900000; 

      return now >= allowedCheckInTime && now <= end;
    });
  }

  // Chỉ dùng cho màn hình live: ca đã bắt đầu thực tế (không nới 15 phút).
  get currentLiveShift() {
    if (!this.list || this.list.length === 0) return null;

    return this.list.find((shift) => {
      const range = this.getShiftRange(shift);
      if (!range) return false;

      const now = this.normalizeNowForRange(range);
      const { start, end } = range;

      return now >= start && now <= end;
    });
  }

  // Dùng cho widget: tiếp tục hiển thị tối đa 10 phút sau khi ca kết thúc.
  get currentDisplayShift() {
    if (!this.list || this.list.length === 0) return null;

    return this.list.find((shift) => {
      const range = this.getShiftRange(shift);
      if (!range) return false;

      const now = this.normalizeNowForRange(range);
      const { start, end } = range;
      const visibleFrom = start - 900000;
      const visibleUntil = end + 600000;

      return now >= visibleFrom && now <= visibleUntil;
    });
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
