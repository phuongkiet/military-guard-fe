export const AttendanceStatus = {
  OnTime: 1,
  LateWarning: 2,
  PenaltyThreshold: 3,
  Absent: 4,
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export type CheckInCommand = {
  militiaId: string;
  shiftId: string;
  guardPostId: string;
};

export type AttendanceResponse = {
  id: string;
  status: AttendanceStatus | keyof typeof AttendanceStatus | number | string;
};

export type CheckInApiResponse = {
  message: string;
  data: AttendanceResponse;
};

export interface IAttendance {
    militiaId: string;
    shiftId: string;
    guardPostId?: string;
    status: AttendanceStatus;
    checkInTime?: string;
    note?: string;
    
    fullName?: string;
    guardPostName?: string;
    dutyShiftName?: string;
}
