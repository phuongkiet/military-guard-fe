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
import type { IGuardPost } from "../../features/guard-post/types/guardPost";
import { useModal } from "../../hooks/useModal";
import GuardPostForm from "../../features/guard-post/components/GuardPostForm";

const renderStatus = (isActive: boolean) => (
  <Badge size="sm" color={isActive ? "success" : "light"}>
    {isActive ? "Hoạt động" : "Đã ngừng"}
  </Badge>
);

function GuardPostTables() {
  const { guardPostStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    void guardPostStore.fetchList({
      pageIndex: 1,
      pageSize: guardPostStore.pageSize,
    });
  }, [guardPostStore]);

  const rows = guardPostStore.list;
  const emptyMessage = guardPostStore.isLoading
    ? "Đang tải dữ liệu chốt trực..."
    : (guardPostStore.error ?? "Chưa có chốt trực nào để hiển thị.");

  const handleViewDetail = async (id: string) => {
    guardPostStore.clearError();
    try {
      await guardPostStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleEditClick = (id: string) => {
    guardPostStore.selectGuardPost(id); // Set data cần update
    openModal(); // Bật Modal lên
  };

  const handleCloseModal = () => {
    guardPostStore.clearSelectedGuardPost(); // Xóa data
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chốt trực này không?")) {
      return;
    }

    guardPostStore.clearError();
    try {
      await guardPostStore.delete(id);
      void guardPostStore.fetchList({
        pageIndex: guardPostStore.pageIndex,
        pageSize: guardPostStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > guardPostStore.totalPages) {
      return;
    }

    guardPostStore.clearError();
    try {
      await guardPostStore.fetchList({
        pageIndex: nextPage,
        pageSize: guardPostStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    guardPostStore.clearError();
    try {
      await guardPostStore.fetchList({ pageIndex: 1, pageSize: nextPageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý chốt trực | Military Guard"
        description="Theo dõi danh sách chốt trực, vị trí và số quân tối thiểu/tối đa."
      />
      <PageBreadcrumb pageTitle="Quản lý chốt trực" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách chốt trực"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Tạo chốt trực
            </button>
          }
        >
          <ManagementTable
            rows={rows}
            rowKey={(row: IGuardPost) => row.id}
            emptyMessage={emptyMessage}
            pagination={{
              mode: "server",
              pageIndex: guardPostStore.pageIndex,
              pageSize: guardPostStore.pageSize,
              totalCount: guardPostStore.totalCount,
              isLoading: guardPostStore.isLoading,
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
                header: "Tên chốt",
                render: (row) => row.name,
              },
              {
                header: "Vị trí",
                render: (row) => row.location,
              },
              {
                header: "Quân số tối thiểu",
                render: (row) => `${row.minPersonnel} người`,
              },
              {
                header: "Quân số tối đa",
                render: (row) => `${row.maxPersonnel} người`,
              },
              {
                header: "Trạng thái",
                className: "!text-center",
                headerClassName: "!text-center",
                render: (row) => (
                  <div className="flex justify-center">
                    {renderStatus(row.isActive)}
                  </div>
                ),
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
          <GuardPostForm
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>
    </>
  );
}

export default observer(GuardPostTables);
