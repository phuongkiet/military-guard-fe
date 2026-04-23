import { useEffect, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import TimePicker from "../../components/form/time-picker";
import { Modal } from "../../components/ui/modal";
import { EyeIcon, TrashBinIcon } from "../../icons";
import { useStore } from "../../stores/RootStore";
import type { DutyShift } from "../../types/dutyShift";
import { useModal } from "../../hooks/useModal";

const formatTime = (value: string) => value.slice(0, 5);
const isValidTimeFormat = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

function DutyShiftTables() {
  const { dutyShiftStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();
  const [shiftOrder, setShiftOrder] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    void dutyShiftStore.fetchList({ pageIndex: 1, pageSize: dutyShiftStore.pageSize });
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ca trực này không?")) {
      return;
    }

    dutyShiftStore.clearError();
    try {
      await dutyShiftStore.delete(id);
      void dutyShiftStore.fetchList({ pageIndex: dutyShiftStore.pageIndex, pageSize: dutyShiftStore.pageSize });
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
      await dutyShiftStore.fetchList({ pageIndex: nextPage, pageSize: dutyShiftStore.pageSize });
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

  const resetForm = () => {
    setShiftOrder("");
    setStartTime("");
    setEndTime("");
  };

  const handleCloseModal = () => {
    resetForm();
    dutyShiftStore.clearError();
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedShiftOrder = Number.parseInt(shiftOrder, 10);

    if (!shiftOrder.trim() || !startTime || !endTime) {
      dutyShiftStore.error = "Vui lòng nhập đầy đủ thứ tự ca, giờ bắt đầu và giờ kết thúc.";
      return;
    }

    if (!Number.isInteger(parsedShiftOrder) || parsedShiftOrder <= 0) {
      dutyShiftStore.error = "Thứ tự ca phải là số nguyên dương.";
      return;
    }

    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      dutyShiftStore.error = "Thời gian không đúng định dạng HH:mm.";
      return;
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      dutyShiftStore.error = "Giờ bắt đầu phải sớm hơn giờ kết thúc.";
      return;
    }

    dutyShiftStore.clearError();

    try {
      await dutyShiftStore.create({
        shiftOrder: parsedShiftOrder,
        startTime,
        endTime,
      });
      handleCloseModal();
      void dutyShiftStore.fetchList({ pageIndex: dutyShiftStore.pageIndex, pageSize: dutyShiftStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
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
              Thêm ca trực
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập thứ tự ca và khung giờ trực để tạo mới.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="shift-order">Thứ tự ca</Label>
              <Input
                id="shift-order"
                type="number"
                min="1"
                value={shiftOrder}
                onChange={(event) => setShiftOrder(event.target.value)}
                placeholder="Nhập thứ tự ca"
              />
            </div>

            <div>
              <Label htmlFor="start-time">Giờ bắt đầu</Label>
              <TimePicker
                id="start-time"
                value={startTime}
                onChange={setStartTime}
                placeholder="Chọn giờ bắt đầu"
                disabled={dutyShiftStore.isLoading}
              />
            </div>

            <div>
              <Label htmlFor="end-time">Giờ kết thúc</Label>
              <TimePicker
                id="end-time"
                value={endTime}
                onChange={setEndTime}
                placeholder="Chọn giờ kết thúc"
                disabled={dutyShiftStore.isLoading}
              />
            </div>

            {dutyShiftStore.error && (
              <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {dutyShiftStore.error}
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
                disabled={dutyShiftStore.isLoading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dutyShiftStore.isLoading ? "Đang tạo ca trực..." : "Thêm ca trực"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default observer(DutyShiftTables);
