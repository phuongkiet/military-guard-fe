import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, PencilIcon, TrashBinIcon } from "../../assets/icons";
import { useStore } from "../../stores/RootStore";
import type { Militia } from "../../features/militia/types/militia";
import { useModal } from "../../hooks/useModal";
import {
  translateMilitiaRankToVi,
  translateMilitiaTypeToVi,
} from "../../utils/enumTranslations";
import MilitiaForm from "../../features/militia/components/MilitiaForm";

function MilitiaTables() {
  const { militiaStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    void militiaStore.fetchList({
      pageIndex: 1,
      pageSize: militiaStore.pageSize,
    });
  }, [militiaStore]);

  const rows = militiaStore.list;
  const emptyMessage = militiaStore.isLoading
    ? "Đang tải dữ liệu dân quân..."
    : (militiaStore.error ?? "Chưa có dân quân nào để hiển thị.");

  const handleViewDetail = async (id: string) => {
    militiaStore.clearError();
    try {
      await militiaStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleEditClick = (id: string) => {
    militiaStore.selectMilitia(id);
    openModal();
  };

  const handleCloseModal = () => {
    militiaStore.clearSelectedMilitia(); // Xóa data
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dân quân này không?")) {
      return;
    }

    militiaStore.clearError();
    try {
      await militiaStore.delete(id);
      void militiaStore.fetchList({
        pageIndex: militiaStore.pageIndex,
        pageSize: militiaStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > militiaStore.totalPages) {
      return;
    }

    militiaStore.clearError();
    try {
      await militiaStore.fetchList({
        pageIndex: nextPage,
        pageSize: militiaStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    militiaStore.clearError();
    try {
      await militiaStore.fetchList({ pageIndex: 1, pageSize: nextPageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý dân quân | Military Guard"
        description="Bảng quản lý danh sách dân quân, thông tin liên hệ và thâm niên công tác."
      />
      <PageBreadcrumb pageTitle="Quản lý dân quân" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách dân quân"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Thêm dân quân
            </button>
          }
        >
          <ManagementTable
            rows={rows}
            rowKey={(row: Militia) => row.id}
            emptyMessage={emptyMessage}
            pagination={{
              mode: "server",
              pageIndex: militiaStore.pageIndex,
              pageSize: militiaStore.pageSize,
              totalCount: militiaStore.totalCount,
              isLoading: militiaStore.isLoading,
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
                header: "Họ và tên",
                render: (row) => row.fullName,
              },
              {
                header: "Email",
                render: (row) => row.email,
              },
              {
                header: "Loại",
                render: (row) => translateMilitiaTypeToVi(row.type),
              },
              {
                header: "Cấp bậc",
                render: (row) => translateMilitiaRankToVi(row.rank),
              },
              {
                header: "Thâm niên",
                render: (row) => `${row.monthsOfService} tháng`,
              },
              {
                header: "Chỉ huy",
                render: (row) => row.managerName ?? "-",
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
          <MilitiaForm
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </div>
      </Modal>
    </>
  );
}

export default observer(MilitiaTables);
