import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { useStore } from "../../stores/RootStore"; // Giả sử em dùng hook này để lấy RootStore
import { AttendanceStatus } from "../../features/attendance/types/attendance"; // Định nghĩa enum trạng thái điểm danh
import { CheckLineIcon, CloseLineIcon, TimeIcon } from "../../assets/icons"; // Sử dụng các icon em đã có

const AttendanceLiveDashboard: React.FC = () => {
  const { shiftId } = useParams<{ shiftId: string }>();
  const { attendanceStore } = useStore();
  const { liveAttendances, isLoading } = attendanceStore;

  useEffect(() => {
    if (shiftId) {
      // 1. Load dữ liệu ban đầu qua REST API
      attendanceStore.loadLiveAttendances(shiftId);
      console.log("Đã gọi loadLiveAttendances với shiftId:", shiftId);
      console.log("Dữ liệu liveAttendances sau khi load:", attendanceStore.liveAttendances);
      // 2. Mở kết nối SignalR để nhận update realtime
      attendanceStore.createHubConnection(shiftId);
    }

    return () => {
      // Cleanup: Ngắt kết nối khi rời trang
      attendanceStore.stopHubConnection();
    };
  }, [shiftId, attendanceStore]);

  // Hàm helper để render Badge dựa trên status
  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.OnTime:
        return (
          <Badge variant="light" color="success">
            <CheckLineIcon className="w-4 h-4 mr-1" /> Có mặt
          </Badge>
        );
      case AttendanceStatus.Absent:
        return (
          <Badge variant="light" color="error">
            <CloseLineIcon className="w-4 h-4 mr-1" /> Vắng mặt
          </Badge>
        );
      case AttendanceStatus.LateWarning:
        return (
          <Badge variant="light" color="warning">
            <TimeIcon className="w-4 h-4 mr-1" /> Đi muộn
          </Badge>
        );
      default:
        return (
          <Badge variant="light" color="primary">
            Đang chờ
          </Badge>
        );
    }
  };

  return (
    <>
      <PageMeta
        title="Giám sát điểm danh thời gian thực | Military Guard"
        description="Màn hình dành cho chỉ huy theo dõi quân số trực ca"
      />
      <PageBreadCrumb pageTitle="Giám sát trực tuyến" />

      <div className="grid grid-cols-1 gap-6">
        {/* Section: Chỉ số tổng quan nhanh */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ComponentCard title="Tổng quân số">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {liveAttendances.length}
            </div>
          </ComponentCard>
          <ComponentCard title="Đã có mặt">
            <div className="text-3xl font-bold text-success-500">
              {
                liveAttendances.filter(
                  (a) => a.status === AttendanceStatus.OnTime,
                ).length
              }
            </div>
          </ComponentCard>
          <ComponentCard title="Vắng mặt/Chưa tới">
            <div className="text-3xl font-bold text-error-500">
              {
                liveAttendances.filter(
                  (a) => a.status !== AttendanceStatus.OnTime,
                ).length
              }
            </div>
          </ComponentCard>
        </div>

        {/* Section: Bảng danh sách chi tiết */}
        <ComponentCard title={`Danh sách đơn vị - Ca trực: ${liveAttendances[0]?.dutyShiftName || "Chưa xác định"}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Dân quân</th>
                  <th className="px-6 py-3">Chốt gác</th>
                  <th className="px-6 py-3">Thời gian báo cáo</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Đang tải dữ liệu ca trực...
                    </td>
                  </tr>
                ) : (
                  liveAttendances.map((attendance, index) => (
                    <tr
                      key={`${attendance.militiaId}-${attendance.shiftId}-${attendance.checkInTime ?? index}`}
                      className="transition-colors duration-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {attendance.fullName || "Tên không xác định"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {attendance.guardPostName || "Chưa xác định"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {attendance.checkInTime
                          ? new Date(
                              attendance.checkInTime,
                            ).toLocaleTimeString()
                          : "--:--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(attendance.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {attendance.note && attendance.note.length > 70 ? (
                          <span
                            title={attendance.note}
                            className="cursor-help border-b border-dotted border-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          >
                            {attendance.note.slice(0, 70)}...
                          </span>
                        ) : (
                          <span>{attendance.note || "Không có"}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default observer(AttendanceLiveDashboard);
