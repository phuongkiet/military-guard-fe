import { useEffect, useMemo, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { EyeIcon, TrashBinIcon } from "../../icons";
import Label from "../../components/form/Label";
import Select, { type Option } from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useStore } from "../../stores/RootStore";
import type { ShiftAssignment } from "../../types/shiftAssignment";
import { translateMilitiaRankToVi } from "../../utils/enumTranslations";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
};

function ShiftAssignmentTables() {
  const { shiftAssignmentStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();
  const [filterDate, setFilterDate] = useState("");
  const [filterGuardPostId, setFilterGuardPostId] = useState("");
  const [filterMilitiaId, setFilterMilitiaId] = useState("");
  const [filterSourceRows, setFilterSourceRows] = useState<ShiftAssignment[]>([]);

  useEffect(() => {
    void shiftAssignmentStore.fetchList({
      pageIndex: 1,
      pageSize: shiftAssignmentStore.pageSize,
    });
  }, [shiftAssignmentStore]);

  const rows = shiftAssignmentStore.list;
  const emptyMessage = shiftAssignmentStore.isLoading
    ? "Đang tải dữ liệu phân ca..."
    : shiftAssignmentStore.error ?? "Chưa có phân công nào để hiển thị.";

  const hasActiveFilters = Boolean(filterDate || filterGuardPostId || filterMilitiaId);

  useEffect(() => {
    // Keep a stable option source so selects don't collapse after applying filters.
    if (!hasActiveFilters) {
      setFilterSourceRows(rows);
      return;
    }

    if (filterSourceRows.length === 0) {
      setFilterSourceRows(rows);
    }
  }, [rows, hasActiveFilters, filterSourceRows.length]);

  const guardPostOptions = useMemo<Option[]>(() => {
    const sourceRows = filterSourceRows.length > 0 ? filterSourceRows : rows;
    const unique = new Map<string, string>();
    sourceRows.forEach((row) => {
      if (!unique.has(row.guardPostId)) {
        unique.set(row.guardPostId, row.guardPostName);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [filterSourceRows, rows]);

  const militiaOptions = useMemo<Option[]>(() => {
    const sourceRows = filterSourceRows.length > 0 ? filterSourceRows : rows;
    const unique = new Map<string, string>();
    sourceRows.forEach((row) => {
      if (!unique.has(row.militiaId)) {
        unique.set(row.militiaId, row.militiaName);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [filterSourceRows, rows]);

  const handleCloseFilterModal = () => {
    shiftAssignmentStore.clearError();
    closeModal();
  };

  const buildQuery = (pageIndex?: number, pageSize?: number) => ({
    date: filterDate || undefined,
    guardPostId: filterGuardPostId || undefined,
    militiaId: filterMilitiaId || undefined,
    pageIndex,
    pageSize: pageSize ?? shiftAssignmentStore.pageSize,
  });

  const handleApplyFilters = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList(buildQuery(1));
      closeModal();
    } catch {
      // Store exposes the error state.
    }
  };

  const handleClearFilters = async () => {
    setFilterDate("");
    setFilterGuardPostId("");
    setFilterMilitiaId("");

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList({ pageIndex: 1, pageSize: shiftAssignmentStore.pageSize });
      setFilterSourceRows([]);
      closeModal();
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > shiftAssignmentStore.totalPages) {
      return;
    }

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList(buildQuery(nextPage));
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchList(buildQuery(1, nextPageSize));
    } catch {
      // Store exposes the error state.
    }
  };

  const handleViewDetail = async (id: string) => {
    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phân công ca này không?")) {
      return;
    }

    shiftAssignmentStore.clearError();
    try {
      await shiftAssignmentStore.delete(id);
      void shiftAssignmentStore.fetchList(buildQuery(shiftAssignmentStore.pageIndex));
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý phân chia ca | Military Guard"
        description="Quản lý việc phân chia ca trực theo dân quân, chốt, ca và ngày hiệu lực."
      />
      <PageBreadcrumb pageTitle="Quản lý phân chia ca" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách phân chia ca"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Bộ lọc nâng cao
            </button>
          }
        >
          <ManagementTable
            rows={rows}
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
              { header: "Dân quân", render: (row) => row.militiaName },
              { header: "Cấp bậc", render: (row) => translateMilitiaRankToVi(row.militiaRank) },
              { header: "Chốt trực", render: (row) => row.guardPostName },
              { header: "Ca trực", render: (row) => row.dutyShiftInfo },
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

      <Modal isOpen={isOpen} onClose={handleCloseFilterModal} className="max-w-2xl m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 pr-10">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Lọc phân công ca
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Lọc theo ngày, chốt trực và dân quân từ chính danh sách hiện tại.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleApplyFilters}>
            <div className="md:col-span-2">
              <Label htmlFor="filter-shift-date">Ngày hiệu lực</Label>
              <DatePicker
                id="filter-shift-date"
                mode="single"
                placeholder="Chọn ngày (DateOnly)"
                defaultDate={filterDate || undefined}
                onChange={(_, currentDateString) => {
                  setFilterDate(currentDateString);
                }}
              />
            </div>

            <div>
              <Label htmlFor="filter-guard-post">Chốt trực</Label>
              <Select
                id="filter-guard-post"
                value={filterGuardPostId}
                options={guardPostOptions}
                placeholder="Chọn chốt trực"
                onChange={setFilterGuardPostId}
              />
            </div>

            <div>
              <Label htmlFor="filter-militia">Dân quân</Label>
              <Select
                id="filter-militia"
                value={filterMilitiaId}
                options={militiaOptions}
                placeholder="Chọn dân quân"
                onChange={setFilterMilitiaId}
              />
            </div>

            {shiftAssignmentStore.error && (
              <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {shiftAssignmentStore.error}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleClearFilters();
                }}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={handleCloseFilterModal}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={shiftAssignmentStore.isLoading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {shiftAssignmentStore.isLoading ? "Đang lọc..." : "Áp dụng"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default observer(ShiftAssignmentTables);