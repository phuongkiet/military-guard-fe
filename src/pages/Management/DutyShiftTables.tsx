import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, PencilIcon, TrashBinIcon } from "../../assets/icons";
import { useStore } from "../../stores/RootStore";
import { useModal } from "../../hooks/useModal";
import type { DutyShift } from "../../features/duty-shift/types/dutyShift";
import DutyShiftForm from "../../features/duty-shift/components/DutyShiftForm";
import { formatTime } from "../../utils/timeFormat";

function DutyShiftTables() {
  const { dutyShiftStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    void dutyShiftStore.fetchList({
      pageIndex: 1,
      pageSize: dutyShiftStore.pageSize,
    });
  }, [dutyShiftStore]);

  const rows = dutyShiftStore.list;
  const emptyMessage = dutyShiftStore.isLoading
    ? "Đang tải dữ liệu ca trực..."
    : (dutyShiftStore.error ?? "Chưa có ca trực nào để hiển thị.");

  const handleViewDetail = async (id: string) => {
    dutyShiftStore.clearError();
    try {
      await dutyShiftStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleEditClick = (id: string) => {
    dutyShiftStore.selectDutyShift(id);
    openModal(); // Bật Modal lên
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ca trực này không?")) {
      return;
    }

    dutyShiftStore.clearError();
    try {
      await dutyShiftStore.delete(id);
      void dutyShiftStore.fetchList({
        pageIndex: dutyShiftStore.pageIndex,
        pageSize: dutyShiftStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > dutyShiftStore.totalPages) {
      return;
    }

    dutyShiftStore.clearError();
    try {
      await dutyShiftStore.fetchList({
        pageIndex: nextPage,
        pageSize: dutyShiftStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    dutyShiftStore.clearError();
    try {
      await dutyShiftStore.fetchList({ pageIndex: 1, pageSize: nextPageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handleCloseModal = () => {
    dutyShiftStore.clearSelectedDutyShift();
    closeModal();
  };

  return (
    <>
      <PageMeta
        title="Quản lý ca trực | Military Guard"
        description="Quản lý danh sách ca trực, khung thời gian và số lượng nhân sự mỗi ca."
      />
      <PageBreadcrumb pageTitle="Quản lý ca trực" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách ca trực"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Thêm ca trực
            </button>
          }
        >
          <ManagementTable
            rows={rows}
            rowKey={(row: DutyShift) => row.id}
            emptyMessage={emptyMessage}
            pagination={{
              mode: "server",
              pageIndex: dutyShiftStore.pageIndex,
              pageSize: dutyShiftStore.pageSize,
              totalCount: dutyShiftStore.totalCount,
              isLoading: dutyShiftStore.isLoading,
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
                header: "Ca trực",
                render: (row) => (
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    Ca {row.shiftOrder}
                  </span>
                ),
              },
              {
                header: "Khung giờ",
                render: (row) =>
                  `${formatTime(row.startTime)} - ${formatTime(row.endTime)}`,
              },
              {
                header: "Thứ tự",
                render: (row) => (
                  <Badge size="sm" color="info">
                    #{row.shiftOrder}
                  </Badge>
                ),
              },
              // {
              //   header: "Trạng thái",
              //   render: () => (
              //     <Badge size="sm" color="success">
              //       {dutyShiftStore.detail?. ? "Hoạt động" : "Đã ngừng"}
              //     </Badge>
              //   ),
              // },
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
          <DutyShiftForm
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>
    </>
  );
}

export default observer(DutyShiftTables);
