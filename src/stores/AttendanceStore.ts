import { makeAutoObservable, runInAction } from "mobx";
import { attendanceService } from "../services/attendanceService";
import { AttendanceStatus, type Attendance, type CheckInCommand } from "../types/attendance";
import type { ApiError } from "../api/agent";

const normalizeStatus = (
  value: AttendanceStatus | keyof typeof AttendanceStatus | number | string,
): AttendanceStatus => {
  if (typeof value === "number") {
    if (value === AttendanceStatus.OnTime) return AttendanceStatus.OnTime;
    if (value === AttendanceStatus.LateWarning) return AttendanceStatus.LateWarning;
    if (value === AttendanceStatus.PenaltyThreshold) return AttendanceStatus.PenaltyThreshold;
    return AttendanceStatus.OnTime;
  }

  const normalized = String(value).toLowerCase();
  if (normalized === "ontime" || normalized === "on_time") {
    return AttendanceStatus.OnTime;
  }

  if (normalized === "latewarning" || normalized === "late_warning") {
    return AttendanceStatus.LateWarning;
  }

  if (normalized === "penaltythreshold" || normalized === "penalty_threshold") {
    return AttendanceStatus.PenaltyThreshold;
  }

  return AttendanceStatus.OnTime;
};

export class AttendanceStore {
  isLoading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  lastResult: Attendance | null = null;
  recentCheckIns: Attendance[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async checkIn(payload: CheckInCommand) {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      const result = await attendanceService.checkIn(payload);
      const normalizedStatus = normalizeStatus(result.data.status);
      const checkInRecord: Attendance = {
        militiaId: payload.militiaId,
        shiftId: payload.shiftId,
        checkInTime: new Date().toISOString(),
        status: normalizedStatus,
      };

      runInAction(() => {
        this.lastResult = checkInRecord;
        this.successMessage = result.message || "Điểm danh thành công";
        this.recentCheckIns = [checkInRecord, ...this.recentCheckIns].slice(0, 10);
      });

      return checkInRecord;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message || "Điểm danh thất bại";
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  clearMessages() {
    this.error = null;
    this.successMessage = null;
  }
}
