export const AttendanceStatus = {
  OnTime: 1,
  LateWarning: 2,
  PenaltyThreshold: 3,
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export type CheckInCommand = {
  militiaId: string;
  shiftId: string;
};

export type AttendanceResponse = {
  status: AttendanceStatus | keyof typeof AttendanceStatus | number | string;
};

export type CheckInApiResponse = {
  message: string;
  data: AttendanceResponse;
};

export type Attendance = {
  militiaId: string;
  shiftId: string;
  checkInTime: string;
  status: AttendanceStatus;
  note?: string | null;
};
