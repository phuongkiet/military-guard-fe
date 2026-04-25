export type MilitiaType = number;
export type MilitiaRank = number;

// LÕI VẤN ĐỀ Ở ĐÂY: Interface này phải map 100% với những gì 
// API GetList trả về và những gì Form Update cần.
export type Militia = {
  id: string;
  fullName: string;
  email: string;
  type: string; // Đổi về number cho khớp với DTO và Form
  rank: string; // Đổi về number
  monthsOfService: number;
  joinDate: string;  // BẮT BUỘC PHẢI CÓ để Form Update hiển thị ngày
  managerId?: string | null; // BẮT BUỘC PHẢI CÓ để Form Update chọn lại Chỉ huy
  managerName?: string | null;
};

export type MilitiaResponse = Militia & {
  // Nếu API trả về thêm thông tin nào khác (ví dụ: managerName), có thể bổ sung ở đây.
};

export type MilitiaCreateDTO = {
  fullName: string;
  email: string;
  type: MilitiaType;
  rank: MilitiaRank;
  joinDate: string;
  managerId?: string | null;
};

export type MilitiaUpdateCommand = {
  id: string;
  fullName: string;
  email: string;
  type: MilitiaType;
  rank: MilitiaRank;
  joinDate: string;
  managerId?: string | null;
};

export type MilitiaUpdateDTO = Omit<MilitiaUpdateCommand, "id">;

export type GetAllMilitiasQuery = {
  searchTerm?: string;
  type?: MilitiaType;
  rank?: MilitiaRank;
  pageIndex?: number;
  pageSize?: number;
};