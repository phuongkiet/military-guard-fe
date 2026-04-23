import { requests } from "../api/agent";
import type { CheckInApiResponse, CheckInCommand } from "../types/attendance";

const endpoints = {
  checkIn: "/Attendances/check-in",
};

export const attendanceService = {
  checkIn: (payload: CheckInCommand) =>
    requests.post<CheckInApiResponse>(endpoints.checkIn, payload),
};
