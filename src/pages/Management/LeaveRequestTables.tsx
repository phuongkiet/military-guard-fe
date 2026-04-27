import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { CheckLineIcon, CloseIcon, PencilIcon, TrashBinIcon } from "../../assets/icons";
import { useStore } from "../../stores/RootStore";
import type { LeaveRequest } from "../../features/leave-request/types/leaveRequest";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import LeaveRequestForm from "../../features/leave-request/components/LeaveRequestForm";

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
    return (
      <Badge size="sm" color="success">
        Đã duyệt
      </Badge>
    );
  }

  if (normalized === "rejected") {
    return (
      <Badge size="sm" color="error">
        Từ chối
      </Badge>
    );
  }

  return (
    <Badge size="sm" color="warning">
      Chờ duyệt
    </Badge>
  );
};



function LeaveRequestTables() {
  const { leaveRequestStore, authStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    void leaveRequestStore.fetchList({
      pageIndex: 1,
      pageSize: leaveRequestStore.pageSize,
    });
  }, [leaveRequestStore]);

  const rows = leaveRequestStore.list;
  const emptyMessage = leaveRequestStore.isLoading
    ? "Đang tải dữ liệu nghỉ phép..."
    : (leaveRequestStore.error ?? "Chưa có đơn nghỉ phép nào để hiển thị.");

  const handleApprove = async (id: string) => {
    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.approve(id, authStore.user?.username || "Không xác định");
    } catch {
      // Store exposes the error state.
    }
  };

  const handleReject = async (id: string) => {
    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.reject(id, authStore.user?.username || "Không xác định");
    } catch {
      // Store exposes the error state.
    }
  };

  const handleEditClick = (id: string) => {
    leaveRequestStore.selectLeaveRequest(id); // Set data cần update
    openModal(); // Bật Modal lên
  };

  const handleCloseModal = () => {
    leaveRequestStore.clearSelectedLeaveRequest(); // Xóa data
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn nghỉ phép này không?")) {
      return;
    }

    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.delete(id);
      void leaveRequestStore.fetchList({
        pageIndex: leaveRequestStore.pageIndex,
        pageSize: leaveRequestStore.pageSize,
      });
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
      await leaveRequestStore.fetchList({
        pageIndex: nextPage,
        pageSize: leaveRequestStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchList({
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
        title="Quản lý nghỉ phép | Military Guard"
        description="Theo dõi đơn nghỉ phép, thời gian nghỉ và trạng thái phê duyệt."
      />
      <PageBreadcrumb pageTitle="Quản lý nghỉ phép" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách nghỉ phép"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Tạo đơn nghỉ phép
            </button>
          }
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
                render: (row) =>
                  `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
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
                      title="Duyệt đơn"
                      aria-label="Duyệt đơn"
                      onClick={() => {
                        void handleApprove(row.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                    >
                      <CheckLineIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Từ chối đơn"
                      aria-label="Từ chối đơn"
                      onClick={() => {
                        void handleReject(row.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Chỉnh sửa"
                      aria-label="Chỉnh sửa"
                      onClick={() => {
                        void handleEditClick(row.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                    >
                      <PencilIcon className="size-4" />
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
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-2xl m-4" // Set độ rộng tổng
      >
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          {/* Render Form vào đây */}
          <LeaveRequestForm
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>
    </>
  );
}

export default observer(LeaveRequestTables);
