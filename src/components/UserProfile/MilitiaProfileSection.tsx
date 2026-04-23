import ComponentCard from "../common/ComponentCard";
import type { Militia } from "../../types/militia";
import ProfileInfoGrid from "./ProfileInfoGrid";
import {
  translateMilitiaRankToVi,
  translateMilitiaTypeToVi,
  translateRoleToVi,
} from "../../utils/enumTranslations";

type MilitiaProfileSectionProps = {
  isLoading: boolean;
  role?: string;
  detail: Militia | null;
};

export default function MilitiaProfileSection({ isLoading, role, detail }: MilitiaProfileSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <ComponentCard
        title="Hồ sơ dân quân"
        desc="Thông tin lấy trực tiếp từ account đăng nhập và hồ sơ militia tương ứng."
      >
        {isLoading && !detail ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải hồ sơ...</p>
        ) : (
          <ProfileInfoGrid
            items={[
              { label: "Họ và tên", value: detail?.fullName },
              { label: "Vai trò", value: translateRoleToVi(role) },
              { label: "Loại", value: translateMilitiaTypeToVi(detail?.type) },
              { label: "Cấp bậc", value: translateMilitiaRankToVi(detail?.rank) },
            ]}
          />
        )}
      </ComponentCard>

      <ComponentCard title="Thông tin bổ sung" desc="Dùng để đối chiếu nhanh khi cần hỗ trợ nghiệp vụ.">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              {detail?.email || "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Thâm niên (tháng)
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              {detail?.monthsOfService ?? "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Người quản lý
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              {detail?.managerName || "-"}
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
