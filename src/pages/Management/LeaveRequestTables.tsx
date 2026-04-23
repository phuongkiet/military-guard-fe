import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { EyeIcon, TrashBinIcon } from "../../icons";
import { useStore } from "../../stores/RootStore";
import type { LeaveRequest } from "../../types/leaveRequest";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const renderStatus = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "approved") {
    return <Badge size="sm" color="success">Đã duyệt</Badge>;
  }

  if (normalized === "rejected") {
    return <Badge size="sm" color="error">Từ chối</Badge>;
  }

  return <Badge size="sm" color="warning">Chờ duyệt</Badge>;
};

function LeaveRequestTables() {
  const { leaveRequestStore } = useStore();

  useEffect(() => {
    void leaveRequestStore.fetchList({ pageIndex: 1, pageSize: leaveRequestStore.pageSize });
  }, [leaveRequestStore]);

  const rows = leaveRequestStore.list;
  const emptyMessage = leaveRequestStore.isLoading
    ? "Đang tải dữ liệu nghỉ phép..."
    : leaveRequestStore.error ?? "Chưa có đơn nghỉ phép nào để hiển thị.";

  const handleViewDetail = async (id: string) => {
    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn nghỉ phép này không?")) {
      return;
    }

    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.delete(id);
      void leaveRequestStore.fetchList({ pageIndex: leaveRequestStore.pageIndex, pageSize: leaveRequestStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > leaveRequestStore.totalPages) {
      return;
    }

    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchList({ pageIndex: nextPage, pageSize: leaveRequestStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchList({ pageIndex: 1, pageSize: nextPageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý nghỉ phép | Military Guard"
        description="Theo dõi đơn nghỉ phép, thời gian nghỉ và trạng thái phê duyệt."
      />
      <PageBreadcrumb pageTitle="Quản lý nghỉ phép" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách nghỉ phép"
        >
          <ManagementTable
            rows={rows}
            rowKey={(row: LeaveRequest) => row.id}
            emptyMessage={emptyMessage}
            pagination={{
              mode: "server",
              pageIndex: leaveRequestStore.pageIndex,
              pageSize: leaveRequestStore.pageSize,
              totalCount: leaveRequestStore.totalCount,
              isLoading: leaveRequestStore.isLoading,
              pageSizeOptions: [5, 10, 20, 50],
              onPageChange: (page) => {
                void handlePageChange(page);
              },
              onPageSizeChange: (size) => {
                void handlePageSizeChange(size);
              },
            }}
            columns={[
              { header: "Người đề nghị", render: (row) => row.militiaName },
              {
                header: "Thời gian nghỉ",
                render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
              },
              { header: "Lý do", render: (row) => row.reason },
              {
                header: "Trạng thái gốc",
                render: (row) => row.status,
              },
              {
                header: "Trạng thái",
                render: (row) => renderStatus(row.status),
              },
              {
                header: "Hành động",
                className: "whitespace-nowrap !text-right",
                headerClassName: "!text-right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Chi tiết"
                      aria-label="Chi tiết"
                      onClick={() => {
                        void handleViewDetail(row.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Xóa"
                      aria-label="Xóa"
                      onClick={() => {
                        void handleDelete(row.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                    >
                      <TrashBinIcon className="size-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </ComponentCard>
      </div>
    </>
  );
}

export default observer(LeaveRequestTables);