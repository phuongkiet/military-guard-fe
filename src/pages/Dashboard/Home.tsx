import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  const modules = [
    {
      title: "Quản lý dân quân",
      description: "Theo dõi danh sách lực lượng, đơn vị và trạng thái hiện tại.",
      path: "/militia-tables",
    },
    {
      title: "Quản lý chốt trực",
      description: "Kiểm soát danh sách chốt, khu vực và ca đang phụ trách.",
      path: "/guard-post-tables",
    },
    {
      title: "Quản lý ca trực",
      description: "Tổng hợp các ca sáng, chiều, đêm và quân số tương ứng.",
      path: "/duty-shift-tables",
    },
    {
      title: "Quản lý phân chia ca",
      description: "Xem nhanh các phân công đã duyệt và các ca đang chờ xử lý.",
      path: "/shift-assignment-tables",
    },
    {
      title: "Quản lý nghỉ phép",
      description: "Theo dõi đơn nghỉ phép và trạng thái phê duyệt.",
      path: "/leave-request-tables",
    },
    {
      title: "Điểm danh",
      description: "Thực hiện check-in theo militia và ca trực để nhận trạng thái đúng giờ/trễ ngay lập tức.",
      path: "/attendance-checkin",
    },
    {
      title: "Quản lý tài khoản",
      description: "Theo dõi tài khoản đăng nhập, vai trò và trạng thái khóa/mở khóa.",
      path: "/account-tables",
    },
  ];

  return (
    <>
      <PageMeta
        title="Military Guard Management"
        description="Trang tổng quan cho hệ thống quản lý lực lượng và ca trực."
      />
      <div className="space-y-6">
        <ComponentCard
          title="Tổng quan nghiệp vụ"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.path}
                to={module.path}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-white/3 dark:hover:border-brand-500/40 dark:hover:bg-white/5"
              >
                <p className="text-base font-semibold text-gray-800 group-hover:text-brand-500 dark:text-white/90">
                  {module.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {module.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-500">
                  Mở bảng quản lý
                </span>
              </Link>
            ))}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

