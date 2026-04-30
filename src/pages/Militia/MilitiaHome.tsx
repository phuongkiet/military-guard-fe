import { Link } from "react-router";
import { observer } from "mobx-react-lite";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useStore } from "../../stores/RootStore";

const quickLinks = [
  {
    title: "Ca được phân công",
    description: "Kiểm tra ca, chốt và ngày hiệu lực đang được gán cho bạn.",
    path: "/militia/assignments",
  },
  {
    title: "Đơn nghỉ phép",
    description: "Tạo mới và theo dõi trạng thái các đơn nghỉ phép của bạn.",
    path: "/militia/leave-requests",
  },
];

function MilitiaHome() {
  const { authStore } = useStore();

  return (
    <>
      <PageMeta
        title="Khu vực dân quân | Military Guard"
        description="Không gian riêng cho dân quân: hồ sơ cá nhân, ca được phân công (kèm điểm danh) và đơn nghỉ phép."
      />
      <PageBreadcrumb pageTitle="Khu vực dân quân" homePath="/militia" />

      <div className="space-y-6">
        {/* <div className="overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-sm dark:border-white/5">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">
              Cổng dành riêng cho dân quân
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Xin chào, {authStore.user?.username ?? "bạn"}
            </h1>
          </div>
        </div> */}

        <ComponentCard title="Lối tắt thao tác" desc="Đi thẳng tới nghiệp vụ bạn cần xử lý.">
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-white/3 dark:hover:border-brand-500/40 dark:hover:bg-white/5"
              >
                <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-500">
                  Mở trang
                </span>
              </Link>
            ))}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

export default observer(MilitiaHome);