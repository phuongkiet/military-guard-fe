import { useEffect, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
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

function MilitiaLeaveRequests() {
  const { authStore, leaveRequestStore } = useStore();
  const militiaId = authStore.user?.militiaId ?? null;
  const { isOpen, openModal, closeModal } = useModal();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (militiaId) {
      void leaveRequestStore.fetchList({
        militiaId,
        pageIndex: 1,
        pageSize: leaveRequestStore.pageSize,
      });
    }
  }, [militiaId, leaveRequestStore]);

  const emptyMessage = leaveRequestStore.isLoading
    ? "Đang tải dữ liệu nghỉ phép..."
    : leaveRequestStore.error ?? "Chưa có đơn nghỉ phép nào để hiển thị.";

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleCloseModal = () => {
    resetForm();
    leaveRequestStore.clearError();
    closeModal();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!militiaId || !startDate || !endDate || !reason.trim()) {
      return;
    }

    leaveRequestStore.clearError();

    try {
      await leaveRequestStore.create({
        militiaId,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      handleCloseModal();
      void leaveRequestStore.fetchList({
        militiaId,
        pageIndex: leaveRequestStore.pageIndex,
        pageSize: leaveRequestStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (!militiaId || nextPage < 1 || nextPage > leaveRequestStore.totalPages) {
      return;
    }

    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchList({
        militiaId,
        pageIndex: nextPage,
        pageSize: leaveRequestStore.pageSize,
      });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    if (!militiaId) {
      return;
    }

    leaveRequestStore.clearError();
    try {
      await leaveRequestStore.fetchList({
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
        title="Đơn nghỉ phép | Military Guard"
        description="Tạo mới và xem các đơn nghỉ phép của chính militia đang đăng nhập."
      />
      <PageBreadcrumb pageTitle="Đơn nghỉ phép" homePath="/militia" />

      <div className="space-y-6">
        <ComponentCard
          title="Đơn nghỉ phép của tôi"
          headerAction={
            militiaId ? (
              <button
                type="button"
                onClick={openModal}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Tạo đơn nghỉ phép
              </button>
            ) : null
          }
        >
          {!militiaId ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              Tài khoản này chưa có militiaId nên không thể tạo hoặc xem đơn nghỉ phép.
            </div>
          ) : null}

          <ManagementTable
            rows={leaveRequestStore.list}
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
              {
                header: "Mã đơn",
                render: (row) => (
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {row.id}
                  </span>
                ),
              },
              {
                header: "Thời gian nghỉ",
                render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
              },
              { header: "Lý do", render: (row) => row.reason },
              { header: "Trạng thái", render: (row) => renderStatus(row.status) },
            ]}
          />
        </ComponentCard>
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-2xl m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 pr-10">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Tạo đơn nghỉ phép
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Điền thời gian nghỉ và lý do. Hệ thống sẽ tự gắn militiaId của bạn.
            </p>
          </div>

          {!militiaId ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              Tài khoản này chưa có militiaId nên không thể tạo đơn nghỉ phép.
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="start-date">Ngày bắt đầu</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-date">Ngày kết thúc</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="reason">Lý do</Label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  placeholder="Nhập lý do nghỉ phép"
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                />
              </div>

              {leaveRequestStore.error && (
                <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {leaveRequestStore.error}
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
                  disabled={leaveRequestStore.isLoading || !startDate || !endDate || !reason.trim()}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {leaveRequestStore.isLoading ? "Đang gửi đơn..." : "Gửi đơn nghỉ phép"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}

export default observer(MilitiaLeaveRequests);