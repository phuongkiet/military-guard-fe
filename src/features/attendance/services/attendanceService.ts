import { requests } from "../../../api/agent";
import type {
  CheckInApiResponse,
  CheckInCommand,
  IAttendance,
} from "../types/attendance";

const endpoints = {
  checkIn: "/Attendances/check-in",
  // SENIOR TIP: Thay vì dùng chuỗi tĩnh, hãy dùng một hàm (function) để generate URL linh hoạt
  listByShift: (shiftId: string) => `/Attendances/shift/${shiftId}`,
};

export const attendanceService = {
  checkIn: (payload: CheckInCommand) =>
    requests.post<CheckInApiResponse>(endpoints.checkIn, payload),
    
  // Nhận thêm tham số date (tùy chọn) để mốt em làm filter theo ngày
  listByShift: (shiftId: string, date?: string) => {
    // 1. Gắn shiftId vào thẳng URL (Route Param)
    let url = endpoints.listByShift(shiftId);
    
    // 2. Gắn date vào sau dấu ? (Query Param) nếu có truyền vào
    if (date) {
      // Dùng URLSearchParams chuẩn của trình duyệt để xử lý các ký tự đặc biệt
      const params = new URLSearchParams({ date: date });
      url += `?${params.toString()}`;
    }

    return requests.get<IAttendance[]>(url);
  },
};
