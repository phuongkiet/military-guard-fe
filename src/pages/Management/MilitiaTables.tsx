import { useEffect, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select, { type Option } from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, TrashBinIcon } from "../../icons";
import { useStore } from "../../stores/RootStore";
import type { Militia } from "../../types/militia";
import { useModal } from "../../hooks/useModal";
import { translateMilitiaRankToVi, translateMilitiaTypeToVi } from "../../utils/enumTranslations";

const MILITIA_TYPES = [
  { value: 1, label: "Thường trực" },
  { value: 2, label: "Cơ động" },
];

const MILITIA_RANKS = [
  { value: 1, label: "Lính" },
  { value: 2, label: "Tiểu đội phó" },
  { value: 3, label: "Tiểu đội trưởng" },
  { value: 4, label: "Chỉ huy phó" },
  { value: 5, label: "Chỉ huy trưởng" },
];

function MilitiaTables() {
  const { militiaStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [rank, setRank] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managerOptions, setManagerOptions] = useState<Option[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  useEffect(() => {
    void militiaStore.fetchList({ pageIndex: 1, pageSize: militiaStore.pageSize });
  }, [militiaStore]);

  // Fetch managers list when modal opens
  useEffect(() => {
    if (isOpen && managerOptions.length === 0) {
      setIsLoadingManagers(true);
      // Simulate API delay or fetch from store
      const managers = militiaStore.list
        .filter((m) => m.id !== "") // Remove current militia from list
        .map((m) => ({
          value: m.id,
          label: `${m.fullName} (${m.rank || "N/A"})`,
        }));
      setTimeout(() => {
        setManagerOptions(managers);
        setIsLoadingManagers(false);
      }, 300);
    }
  }, [isOpen, militiaStore.list, managerOptions.length]);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dân quân này không?")) {
      return;
    }

    militiaStore.clearError();
    try {
      await militiaStore.delete(id);
      void militiaStore.fetchList({ pageIndex: militiaStore.pageIndex, pageSize: militiaStore.pageSize });
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
      await militiaStore.fetchList({ pageIndex: nextPage, pageSize: militiaStore.pageSize });
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

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setType("");
    setRank("");
    setJoinDate("");
    setManagerId("");
  };

  const handleCloseModal = () => {
    resetForm();
    militiaStore.clearError();
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedType = Number(type);
    const normalizedRank = Number(rank);

    if (!trimmedFullName || !trimmedEmail || !type || !rank || !joinDate) {
      return;
    }

    if (Number.isNaN(normalizedType) || Number.isNaN(normalizedRank)) {
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return;
    }

    militiaStore.clearError();

    try {
      await militiaStore.create({
        fullName: trimmedFullName,
        email: trimmedEmail,
        type: normalizedType,
        rank: normalizedRank,
        joinDate,
        managerId: managerId || null,
      });
      handleCloseModal();
      void militiaStore.fetchList();
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
              Thêm dân quân
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Điền thông tin cơ bản để thêm mới dân quân vào hệ thống.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <Label htmlFor="militia-fullname">Họ và tên</Label>
              <Input
                id="militia-fullname"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="militia-email">Email</Label>
              <Input
                id="militia-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email"
              />
            </div>

            <div>
              <Label htmlFor="militia-type">Loại</Label>
              <Select
                id="militia-type"
                value={type}
                options={MILITIA_TYPES}
                placeholder="Chọn loại"
                onChange={setType}
              />
            </div>

            <div>
              <Label htmlFor="militia-rank">Cấp bậc</Label>
              <Select
                id="militia-rank"
                value={rank}
                options={MILITIA_RANKS}
                placeholder="Chọn cấp bậc"
                onChange={setRank}
              />
            </div>
            
            <div>
              <Label htmlFor="militia-joindate">Ngày tham gia</Label>
              <DatePicker
                id="militia-joindate"
                mode="single"
                placeholder="Chọn ngày tham gia"
                defaultDate={joinDate || undefined}
                onChange={(_, currentDateString) => {
                  setJoinDate(currentDateString);
                }}
              />
            </div>

            <div>
              <Label htmlFor="militia-managerid">Chỉ huy (Tùy chọn)</Label>
              <Select
                id="militia-managerid"
                value={managerId}
                options={managerOptions}
                placeholder="Chọn chỉ huy"
                onChange={setManagerId}
                isLoading={isLoadingManagers}
              />
            </div>

            {militiaStore.error && (
              <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {militiaStore.error}
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
                  militiaStore.isLoading ||
                  !fullName.trim() ||
                  !email.trim() ||
                  !type ||
                  !rank ||
                  !joinDate
                }
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {militiaStore.isLoading ? "Đang thêm dân quân..." : "Thêm dân quân"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default observer(MilitiaTables);
