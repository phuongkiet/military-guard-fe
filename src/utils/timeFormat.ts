export const isValidTimeFormat = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};
export const formatTime = (value: string) => value.slice(0, 5);

/**
 * 1. Chuyển đổi ngày từ UI (VD: "2024-05-20") sang chuẩn ISO 8601 để gửi xuống Backend
 * Input: "2024-05-20"
 * Output: "2024-05-20T00:00:00.000Z"
 */
export const formatToISO = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    // Kiểm tra xem user có nhập ngày bậy bạ không (Invalid Date)
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString();
  } catch (error) {
    console.error("Lỗi format ngày sang ISO:", dateString);
    return "";
  }
};

/**
 * 2. Cắt chuỗi ISO từ Backend trả về thành chuẩn "YYYY-MM-DD" để đập vào component DatePicker
 * Input: "2024-05-20T17:00:00.000Z"
 * Output: "2024-05-20"
 */
export const parseDateString = (isoString?: string | null): string => {
  if (!isoString) return "";
  
  try {
    // Cách nhanh và an toàn nhất cho các DatePicker thuần là cắt bỏ phần đuôi giờ giấc đi
    return isoString.split("T")[0];
  } catch (error) {
    console.error("Lỗi parse chuỗi ISO:", isoString);
    return "";
  }
};

/**
 * 3. (Bonus) Format ngày giờ đẹp để hiển thị ra cho người dùng đọc trên Table
 * Input: "2024-05-20T17:00:00.000Z"
 * Output: "20/05/2024" hoặc "20/05/2024 17:00"
 */
export const displayDate = (isoString?: string | null, includeTime: boolean = false): string => {
  if (!isoString) return "--/--/----";
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "--/--/----";

    if (includeTime) {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
    
  } catch (error) {
    return "--/--/----";
  }
};