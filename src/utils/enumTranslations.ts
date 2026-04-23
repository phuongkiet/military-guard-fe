const ROLE_TRANSLATIONS: Record<string, string> = {
  admin: "Quản trị viên",
  commander: "Chỉ huy",
  militia: "Dân quân",
};

const MILITIA_TYPE_TRANSLATIONS: Record<string, string> = {
  regular: "Thường trực",
  mobile: "Cơ động",
};

const MILITIA_RANK_TRANSLATIONS: Record<string, string> = {
  soldier: "Lính",
  vicesquadleader: "Tiểu đội phó",
  squadleader: "Tiểu đội trưởng",
  vicecommander: "Chỉ huy phó",
  commander: "Chỉ huy trưởng",
};

const normalize = (value: string) => value.trim().toLowerCase();
const normalizeEnumValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s-]/g, "");

export const translateRoleToVi = (role?: string | null) => {
  if (!role) return "-";
  return ROLE_TRANSLATIONS[normalize(role)] ?? role;
};

export const translateMilitiaTypeToVi = (type?: string | null) => {
  if (!type) return "-";
  return MILITIA_TYPE_TRANSLATIONS[normalize(type)] ?? type;
};

export const translateMilitiaRankToVi = (rank?: string | null) => {
  if (!rank) return "-";
  return MILITIA_RANK_TRANSLATIONS[normalizeEnumValue(rank)] ?? rank;
};
