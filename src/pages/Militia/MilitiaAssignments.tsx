import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { useStore } from "../../stores/RootStore";
import type { ShiftAssignment } from "../../features/shift-assignment/types/shiftAssignment";
import type { CheckInCommand } from "../../features/attendance/types/attendance";

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

function MilitiaAssignments() {
  const { authStore, shiftAssignmentStore, attendanceStore } = useStore();
  const militiaId = authStore.user?.militiaId ?? null;

  useEffect(() => {
    if (militiaId) {
      void shiftAssignmentStore.fetchList({
        militiaId,
        pageIndex: 1,
        pageSize: shiftAssignmentStore.pageSize,
      });
    }
  }, [militiaId, shiftAssignmentStore]);

  const emptyMessage = shiftAssignmentStore.isLoading
    ? "Đang tải dữ liệu phân công..."
    : shiftAssignmentStore.error ?? "Chưa có ca nào được phân công cho bạn.";

  const handleCheckIn = async (assignment: ShiftAssignment) => {
    if (!militiaId) {
      return;
    }

    attendanceStore.clearMessages();

    const payload: CheckInCommand = {
      militiaId,
      shiftId: assignment.dutyShiftId,
      guardPostId: assignment.guardPostId,
    };

    try {
      await attendanceStore.checkIn(payload);
    } catch {
      // Store already exposes error message.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (!militiaId || nextPage < 1 || nextPage > shiftAssignmentStore.totalPages) {
      return;
    }

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList({
        militiaId,
        pageIndex: nextPage,
        pageSize: shiftAssignmentStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    if (!militiaId) {
      return;
    }

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList({
        militiaId,
        pageIndex: 1,
        pageSize: nextPageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Ca được phân công | Military Guard"
        description="Theo dõi các ca trực đã được phân công theo đúng militia đang đăng nhập."
      />
      <PageBreadcrumb pageTitle="Ca được phân công" homePath="/militia" />

      <div className="space-y-6">
        <ComponentCard
          title="Danh sách ca được phân công"
          desc="Chỉ hiển thị dữ liệu của militiaId đang đăng nhập. Bạn có thể điểm danh trực tiếp trên từng dòng ca trực."
        >
          {!militiaId ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              Tài khoản này chưa có militiaId nên không thể tải danh sách phân công.
            </div>
          ) : (
            <>
              {attendanceStore.successMessage && (
                <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
                  {attendanceStore.successMessage}
                </div>
              )}

              {attendanceStore.error && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {attendanceStore.error}
                </div>
              )}

              <ManagementTable
                rows={shiftAssignmentStore.list}
                rowKey={(row: ShiftAssignment) => row.id}
                emptyMessage={emptyMessage}
                pagination={{
                  mode: "server",
                  pageIndex: shiftAssignmentStore.pageIndex,
                  pageSize: shiftAssignmentStore.pageSize,
                  totalCount: shiftAssignmentStore.totalCount,
                  isLoading: shiftAssignmentStore.isLoading,
                  pageSizeOptions: [5, 10, 20, 50],
                  onPageChange: (page) => {
                    void handlePageChange(page);
                  },
                  onPageSizeChange: (size) => {
                    void handlePageSizeChange(size);
                  },
                }}
                columns={[
                  {
                    header: "Ca",
                    render: (row) => (
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {row.dutyShiftInfo}
                      </span>
                    ),
                  },
                  { header: "Chốt trực", render: (row) => row.guardPostName },
                  { header: "Ngày hiệu lực", render: (row) => formatDate(row.date) },
                  {
                    header: "Trưởng ca",
                    render: (row) => (
                      <Badge size="sm" color={row.isLeader ? "success" : "light"}>
                        {row.isLeader ? "Có" : "Không"}
                      </Badge>
                    ),
                  },
                  {
                    header: "Mã ca",
                    render: (row) => row.dutyShiftId,
                  },
                  {
                    header: "Điểm danh",
                    render: (row) => (
                      <button
                        type="button"
                        onClick={() => {
                          void handleCheckIn(row);
                        }}
                        disabled={attendanceStore.isLoading}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {attendanceStore.isLoading ? "Đang gửi..." : "Điểm danh"}
                      </button>
                    ),
                  },
                ]}
              />
            </>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

export default observer(MilitiaAssignments);