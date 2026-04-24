import { makeAutoObservable, runInAction } from "mobx";
import { attendanceService } from "../services/attendanceService";
import {
  AttendanceStatus,
  type CheckInCommand,
  type IAttendance,
} from "../types/attendance";
import type { ApiError } from "../../../api/agent";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

const normalizeStatus = (
  value: AttendanceStatus | keyof typeof AttendanceStatus | number | string,
): AttendanceStatus => {
  if (typeof value === "number") {
    if (value === AttendanceStatus.OnTime) return AttendanceStatus.OnTime;
    if (value === AttendanceStatus.LateWarning)
      return AttendanceStatus.LateWarning;
    if (value === AttendanceStatus.PenaltyThreshold)
      return AttendanceStatus.PenaltyThreshold;
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
  lastResult: IAttendance | null = null;
  recentCheckIns: IAttendance[] = [];
  hubConnection: HubConnection | null = null;
  liveAttendances: IAttendance[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  loadLiveAttendances = async (shiftId: string) => {
    this.isLoading = true;
    try {
      const data = await attendanceService.listByShift(shiftId);

      runInAction(() => {
        this.liveAttendances = data;
        this.isLoading = false;
      });
    } catch (error) {
      console.error("Lỗi khi load danh sách điểm danh ban đầu:", error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  createHubConnection = (shiftId: string) => {
    if (!shiftId) {
      console.warn("SignalR: Không thể kết nối vì thiếu shiftId");
      return;
    }

    if (this.hubConnection) {
      this.stopHubConnection();
    }

    this.hubConnection = new HubConnectionBuilder()
        // Kiểm tra kỹ xem VITE_API_URL có bị dư đuôi /api không nhé. Nếu BE map là /api/hubs thì để nguyên.
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/attendance?shiftId=${shiftId}`, {
            // Đọc trực tiếp bên trong function
            accessTokenFactory: () => localStorage.getItem("accessToken") || "" 
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    this.hubConnection
      .start()
      .catch((error) => console.error("SignalR Connection Error: ", error));

    this.hubConnection.on(
      "ReceiveAttendanceUpdate",
      (newAttendance: IAttendance) => {
        runInAction(() => {
          const index = this.liveAttendances.findIndex(
            (a) => a.militiaId === newAttendance.militiaId,
          );
          if (index !== -1) {
            this.liveAttendances[index] = {
              ...this.liveAttendances[index],
              ...newAttendance,
            };
          } else {
            this.liveAttendances.push(newAttendance);
          }
        });
      },
    );
  };

  stopHubConnection = () => {
    this.hubConnection
      ?.stop()
      .then(() => console.log("SignalR Connection Stopped"))
      .catch((error) => console.error("Error stopping connection: ", error));
  };

  async checkIn(payload: CheckInCommand) {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    try {
      const result = await attendanceService.checkIn(payload);
      const normalizedStatus = normalizeStatus(result.data.status);
      const checkInRecord: IAttendance = {
        militiaId: payload.militiaId,
        shiftId: payload.shiftId,
        guardPostId: payload.guardPostId,
        checkInTime: new Date().toISOString(),
        status: normalizedStatus,
      };

      runInAction(() => {
        this.lastResult = checkInRecord;
        this.successMessage = result.message || "Điểm danh thành công";
        this.recentCheckIns = [checkInRecord, ...this.recentCheckIns].slice(
          0,
          10,
        );
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
