import { type FormEvent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { useStore } from "../../stores/RootStore";
import { AttendanceStatus, type Attendance } from "../../types/attendance";

const statusLabelMap: Record<AttendanceStatus, string> = {
  [AttendanceStatus.OnTime]: "Đúng giờ",
  [AttendanceStatus.LateWarning]: "Cảnh báo trễ",
  [AttendanceStatus.PenaltyThreshold]: "Vượt ngưỡng xử phạt",
};

const statusColorMap: Record<AttendanceStatus, "success" | "warning" | "error"> = {
  [AttendanceStatus.OnTime]: "success",
  [AttendanceStatus.LateWarning]: "warning",
  [AttendanceStatus.PenaltyThreshold]: "error",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

function AttendanceCheckIn() {
  const { attendanceStore } = useStore();
  const [militiaId, setMilitiaId] = useState("");
  const [shiftId, setShiftId] = useState("");

  const isSubmitDisabled = useMemo(() => {
    return attendanceStore.isLoading || !militiaId.trim() || !shiftId.trim();
  }, [attendanceStore.isLoading, militiaId, shiftId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    attendanceStore.clearMessages();

    try {
      await attendanceStore.checkIn({
        militiaId: militiaId.trim(),
        shiftId: shiftId.trim(),
      });
      setMilitiaId("");
      setShiftId("");
    } catch {
      // Error state already handled in store
    }
  };

  return (
    <>
      <PageMeta
        title="Điểm danh | Military Guard"
        description="Thực hiện điểm danh theo militiaId và shiftId, nhận kết quả trạng thái ngay sau khi check-in."
      />
      <PageBreadcrumb pageTitle="Điểm danh" />

      <div className="space-y-6">
        <ComponentCard
          title="Check-in điểm danh"
          desc="Nhập Militia ID và Shift ID để gửi yêu cầu tới endpoint Attendances/check-in."
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="militia-id">
                Militia ID
              </label>
              <input
                id="militia-id"
                value={militiaId}
                onChange={(event) => setMilitiaId(event.target.value)}
                placeholder="VD: d3cdbaa5-5054-4f8c-b0c9-8f3bc8c2a210"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="shift-id">
                Shift ID
              </label>
              <input
                id="shift-id"
                value={shiftId}
                onChange={(event) => setShiftId(event.target.value)}
                placeholder="VD: b8f7ee80-35db-4bb8-8b14-78094b753548"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {attendanceStore.isLoading ? "Đang điểm danh..." : "Điểm danh"}
              </button>
            </div>
          </form>

          {attendanceStore.successMessage && attendanceStore.lastResult && (
            <div className="mt-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
              <div className="font-medium">{attendanceStore.successMessage}</div>
              <div className="mt-1 flex items-center gap-2">
                Trạng thái:
                <Badge size="sm" color={statusColorMap[attendanceStore.lastResult.status]}>
                  {statusLabelMap[attendanceStore.lastResult.status]}
                </Badge>
              </div>
            </div>
          )}

          {attendanceStore.error && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {attendanceStore.error}
            </div>
          )}
        </ComponentCard>

        <ComponentCard
          title="Lịch sử điểm danh gần đây"
          desc="Lưu tạm 10 lần check-in gần nhất trong phiên làm việc hiện tại để tiện theo dõi."
        >
          <ManagementTable
            rows={attendanceStore.recentCheckIns}
            rowKey={(row: Attendance, index) => `${row.militiaId}-${row.shiftId}-${index}`}
            emptyMessage="Chưa có lượt điểm danh nào trong phiên hiện tại."
            pagination={{
              mode: "client",
              pageSize: 5,
              pageSizeOptions: [5, 10, 20],
            }}
            columns={[
              { header: "Militia ID", render: (row) => row.militiaId },
              { header: "Shift ID", render: (row) => row.shiftId },
              {
                header: "Thời gian điểm danh",
                render: (row) => formatDateTime(row.checkInTime),
              },
              {
                header: "Trạng thái",
                render: (row) => (
                  <Badge size="sm" color={statusColorMap[row.status]}>
                    {statusLabelMap[row.status]}
                  </Badge>
                ),
              },
            ]}
          />
        </ComponentCard>
      </div>
    </>
  );
}

export default observer(AttendanceCheckIn);
