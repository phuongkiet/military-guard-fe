import ComponentCard from "../common/ComponentCard";
import type { AuthUser } from "../../types/auth";
import ProfileInfoGrid from "./ProfileInfoGrid";
import { translateRoleToVi } from "../../utils/enumTranslations";

type AdminProfileSectionProps = {
  user: AuthUser;
};

export default function AdminProfileSection({ user }: AdminProfileSectionProps) {
  return (
    <div className="grid gap-6">
      <ComponentCard title="Thông tin cơ bản" desc="Thông tin hiển thị dành cho tài khoản quản trị.">
        <ProfileInfoGrid
          items={[
            { label: "Tài khoản", value: user.username },
            { label: "Vai trò", value: translateRoleToVi(user.role) },
            { label: "Trạng thái đăng nhập", value: "Đang hoạt động" },
          ]}
        />
      </ComponentCard>
    </div>
  );
}
