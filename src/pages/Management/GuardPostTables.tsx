import { useEffect, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, TrashBinIcon } from "../../assets/icons";
import { useStore } from "../../stores/RootStore";
import type { GuardPost } from "../../types/guardPost";
import { useModal } from "../../hooks/useModal";

const renderStatus = (isActive: boolean) => (
  <Badge size="sm" color={isActive ? "success" : "light"}>
    {isActive ? "Hoạt động" : "Đã ngừng"}
  </Badge>
);

function GuardPostTables() {
  const { guardPostStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [minPersonnel, setMinPersonnel] = useState("");
  const [maxPersonnel, setMaxPersonnel] = useState("");

  useEffect(() => {
    void guardPostStore.fetchList({ pageIndex: 1, pageSize: guardPostStore.pageSize });
  }, [guardPostStore]);

  const rows = guardPostStore.list;
  const emptyMessage = guardPostStore.isLoading
    ? "Đang tải dữ liệu chốt trực..."
    : guardPostStore.error ?? "Chưa có chốt trực nào để hiển thị.";

  const handleViewDetail = async (id: string) => {
    guardPostStore.clearError();
    try {
      await guardPostStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chốt trực này không?")) {
      return;
    }

    guardPostStore.clearError();
    try {
      await guardPostStore.delete(id);
      void guardPostStore.fetchList({ pageIndex: guardPostStore.pageIndex, pageSize: guardPostStore.pageSize });
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
      await guardPostStore.fetchList({ pageIndex: nextPage, pageSize: guardPostStore.pageSize });
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

  const resetForm = () => {
    setName("");
    setLocation("");
    setMinPersonnel("");
    setMaxPersonnel("");
  };

  const handleCloseModal = () => {
    resetForm();
    guardPostStore.clearError();
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const min = Number(minPersonnel);
    const max = Number(maxPersonnel);

    if (!trimmedName || !trimmedLocation) {
      return;
    }

    if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) {
      return;
    }

    guardPostStore.clearError();

    try {
      await guardPostStore.create({
        name: trimmedName,
        location: trimmedLocation,
        minPersonnel: min,
        maxPersonnel: max,
      });
      handleCloseModal();
      void guardPostStore.fetchList();
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
            rowKey={(row: GuardPost) => row.id}
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

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-2xl m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 pr-10">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Tạo chốt trực
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Điền thông tin cơ bản để tạo mới chốt trực.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <Label htmlFor="guard-post-name">Tên chốt</Label>
              <Input
                id="guard-post-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nhập tên chốt trực"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="guard-post-location">Vị trí</Label>
              <Input
                id="guard-post-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Nhập vị trí chốt trực"
              />
            </div>

            <div>
              <Label htmlFor="guard-post-min-personnel">Quân số tối thiểu</Label>
              <Input
                id="guard-post-min-personnel"
                type="number"
                min="1"
                value={minPersonnel}
                onChange={(event) => setMinPersonnel(event.target.value)}
                placeholder="Ví dụ: 2"
              />
            </div>

            <div>
              <Label htmlFor="guard-post-max-personnel">Quân số tối đa</Label>
              <Input
                id="guard-post-max-personnel"
                type="number"
                min="1"
                value={maxPersonnel}
                onChange={(event) => setMaxPersonnel(event.target.value)}
                placeholder="Ví dụ: 6"
              />
            </div>

            {Number(minPersonnel) > Number(maxPersonnel) && maxPersonnel && (
              <div className="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                Quân số tối đa phải lớn hơn hoặc bằng quân số tối thiểu.
              </div>
            )}

            {guardPostStore.error && (
              <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {guardPostStore.error}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={
                  guardPostStore.isLoading ||
                  !name.trim() ||
                  !location.trim() ||
                  !minPersonnel ||
                  !maxPersonnel ||
                  Number(minPersonnel) <= 0 ||
                  Number(maxPersonnel) <= 0 ||
                  Number(minPersonnel) > Number(maxPersonnel)
                }
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardPostStore.isLoading ? "Đang tạo chốt trực..." : "Tạo chốt trực"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default observer(GuardPostTables);
