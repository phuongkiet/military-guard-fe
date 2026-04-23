import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import AdminProfileSection from "../components/UserProfile/AdminProfileSection";
import MilitiaProfileSection from "../components/UserProfile/MilitiaProfileSection";
import { useStore } from "../stores/RootStore";

function UserProfiles() {
  const { authStore, militiaStore } = useStore();
  const user = authStore.user;
  const isMilitia = authStore.user?.role === "Militia";
  const militiaId = authStore.user?.militiaId ?? null;

  useEffect(() => {
    if (isMilitia && militiaId) {
      void militiaStore.fetchDetail(militiaId);
    }
  }, [isMilitia, militiaId, militiaStore]);

  if (isMilitia) {
    return (
      <>
        <PageMeta
          title="Thông tin cá nhân | Military Guard"
          description="Xem hồ sơ cá nhân, mã dân quân, cấp bậc và thông tin tài khoản đăng nhập."
        />
        <PageBreadcrumb pageTitle="Thông tin cá nhân" homePath="/militia" />

        <div className="space-y-6">
          {militiaStore.error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {militiaStore.error}
            </div>
          )}

          {!militiaId ? (
            <ComponentCard title="Không thể tải hồ sơ">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tài khoản hiện tại chưa được gán militiaId. Vui lòng liên hệ quản trị để hoàn tất
                liên kết hồ sơ.
              </p>
            </ComponentCard>
          ) : (
            <MilitiaProfileSection
              isLoading={militiaStore.isLoading}
              role={authStore.user?.role}
              detail={militiaStore.detail}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Thông tin tài khoản | Military Guard"
        description="Hiển thị thông tin cơ bản của tài khoản đang đăng nhập."
      />
      <PageBreadcrumb pageTitle="Thông tin tài khoản" homePath="/" />

      <div className="space-y-6">
        {!user ? (
          <ComponentCard title="Không tìm thấy dữ liệu tài khoản">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Phiên đăng nhập hiện tại không có thông tin người dùng. Vui lòng đăng nhập lại.
            </p>
          </ComponentCard>
        ) : (
          <AdminProfileSection user={user} />
        )}
      </div>
    </>
  );
}

export default observer(UserProfiles);

