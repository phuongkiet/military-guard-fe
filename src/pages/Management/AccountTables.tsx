import { useEffect, useMemo, useState, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ManagementTable from "../../components/tables/ManagementTable";
import { EyeIcon, TrashBinIcon } from "../../assets/icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select, { type Option } from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useStore } from "../../stores/RootStore";
import type { Account } from "../../features/account/types/account";
import { translateRoleToVi } from "../../utils/enumTranslations";

const renderBanStatus = (isBanned?: boolean) => (
  <Badge size="sm" color={isBanned ? "error" : "success"}>
    {isBanned ? "Đã khóa" : "Đang hoạt động"}
  </Badge>
);

function AccountTables() {
  const { accountStore, militiaStore } = useStore();
  const { isOpen, openModal, closeModal } = useModal();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [militiaId, setMilitiaId] = useState("");

  useEffect(() => {
    void accountStore.fetchList({ pageIndex: 1, pageSize: accountStore.pageSize });
  }, [accountStore]);

  useEffect(() => {
    if (isOpen) {
      void militiaStore.fetchList({ pageIndex: 1, pageSize: 100 });
    }
  }, [isOpen, militiaStore]);

  const rows = accountStore.list;
  const emptyMessage = accountStore.isLoading
    ? "Đang tải dữ liệu tài khoản..."
    : accountStore.error ?? "Chưa có tài khoản nào để hiển thị.";

  const militiaOptions = useMemo<Option[]>(() => {
    return militiaStore.list.map((militia) => ({
      value: militia.id,
      label: militia.fullName,
    }));
  }, [militiaStore.list]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setMilitiaId("");
  };

  const handleCloseModal = () => {
    resetForm();
    accountStore.clearError();
    closeModal();
  };

  const handleCreateMilitiaAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword || !militiaId) {
      return;
    }

    accountStore.clearError();

    try {
      await accountStore.create({
        username: trimmedUsername,
        password: trimmedPassword,
        role: "Militia",
        militiaId,
      });
      handleCloseModal();
      await accountStore.fetchList({ pageIndex: accountStore.pageIndex, pageSize: accountStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handleViewDetail = async (id: string) => {
    accountStore.clearError();
    try {
      await accountStore.fetchDetail(id);
    } catch {
      // Store exposes the error state.
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
      return;
    }

    accountStore.clearError();
    try {
      await accountStore.delete(id);
      void accountStore.fetchList({ pageIndex: accountStore.pageIndex, pageSize: accountStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > accountStore.totalPages) {
      return;
    }

    accountStore.clearError();
    try {
      await accountStore.fetchList({ pageIndex: nextPage, pageSize: accountStore.pageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  const handlePageSizeChange = async (nextPageSize: number) => {
    accountStore.clearError();
    try {
      await accountStore.fetchList({ pageIndex: 1, pageSize: nextPageSize });
    } catch {
      // Store exposes the error state.
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý tài khoản | Military Guard"
        description="Theo dõi danh sách tài khoản đăng nhập, vai trò và trạng thái khóa/mở khóa."
      />
      <PageBreadcrumb pageTitle="Quản lý tài khoản" />
      <div className="space-y-6">
        <ComponentCard
          title="Danh sách tài khoản"
          headerAction={
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Tạo tài khoản dân quân
            </button>
          }
        >
          <ManagementTable
            rows={rows}
            rowKey={(row: Account) => row.id}
            emptyMessage={emptyMessage}
            pagination={{
              mode: "server",
              pageIndex: accountStore.pageIndex,
              pageSize: accountStore.pageSize,
              totalCount: accountStore.totalCount,
              isLoading: accountStore.isLoading,
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
                header: "Militia ID",
                render: (row) => row.militiaId ?? "-",
              },
              {
                header: "Tên đăng nhập",
                render: (row) => row.username,
              },
              {
                header: "Vai trò",
                render: (row) => translateRoleToVi(row.role),
              },
              {
                header: "Trạng thái",
                render: (row) => renderBanStatus(row.isBanned),
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
              Tạo tài khoản dân quân
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập thông tin đăng nhập và gán vào hồ sơ dân quân tương ứng.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateMilitiaAccount}>
            <div className="md:col-span-2">
              <Label htmlFor="account-username">Tên đăng nhập</Label>
              <Input
                id="account-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="account-password">Mật khẩu</Label>
              <Input
                id="account-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="account-militia">Dân quân</Label>
              <Select
                id="account-militia"
                value={militiaId}
                options={militiaOptions}
                placeholder="Chọn dân quân"
                onChange={setMilitiaId}
                isLoading={militiaStore.isLoading}
              />
            </div>

            {accountStore.error && (
              <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {accountStore.error}
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
                  accountStore.isLoading || !username.trim() || !password.trim() || !militiaId
                }
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accountStore.isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default observer(AccountTables);
