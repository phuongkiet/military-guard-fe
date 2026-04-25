import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select, { type Option } from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";

interface MilitiaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MILITIA_TYPES = [
  { value: 1, label: "Thường trực" },
  { value: 2, label: "Cơ động" },
];

const MILITIA_RANKS = [
  { value: 1, label: "Lính" },
  { value: 2, label: "Tiểu đội phó" },
  { value: 3, label: "Tiểu đội trưởng" },
  { value: 4, label: "Chỉ huy phó" },
  { value: 5, label: "Chỉ huy trưởng" },
];

const REVERSE_TYPE_MAP: Record<string, number> = {
  "Regular": 1,      // Thường trực
  "Mobile": 2,       // Cơ động (Anh đoán tên Enum của BE, em check lại nhé)
};

const REVERSE_RANK_MAP: Record<string, number> = {
  "Soldier": 1,          // Lính (Hoặc Private tùy BE đặt)
  "SquadDeputy": 2,      // Tiểu đội phó
  "SquadLeader": 3,      // Tiểu đội trưởng
  "DeputyCommander": 4,  // Chỉ huy phó
  "Commander": 5,        // Chỉ huy trưởng
};

const MilitiaForm: React.FC<MilitiaFormProps> = ({ onSuccess, onCancel }) => {
  const { militiaStore } = useStore();
  const { selectedMilitia, isLoading, error } = militiaStore;

  const isEditMode = !!selectedMilitia;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [rank, setRank] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managerOptions, setManagerOptions] = useState<Option[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  // 1. Fetch danh sách Chỉ huy (Managers) khi mount
  useEffect(() => {
    setIsLoadingManagers(true);
    // Lọc ra danh sách lính để làm option chỉ huy (Có thể em cần filter rank >= 3 ở đây)
    const managers = militiaStore.list
      // Nếu đang trong chế độ Edit, không cho phép tự chọn chính mình làm quản lý
      .filter((m) => !isEditMode || m.id !== selectedMilitia?.id)
      .map((m) => ({
        value: m.id,
        label: `${m.fullName} (Cấp: ${m.rank || "N/A"})`,
      }));
      
    // Giả lập delay mạng hoặc nếu list đã có sẵn thì gán luôn
    setManagerOptions(managers);
    setIsLoadingManagers(false);
  }, [militiaStore.list, isEditMode, selectedMilitia]);

  // 2. Nạp dữ liệu vào Form nếu là chế độ Cập nhật (Edit Mode)
  useEffect(() => {
    if (isEditMode && selectedMilitia) {
      setFullName(selectedMilitia.fullName);
      setEmail(selectedMilitia.email);
      // Ép kiểu về string để component Select nhận diện được đúng format
      const mappedType = REVERSE_TYPE_MAP[selectedMilitia.type];
      setType(mappedType ? mappedType.toString() : "");

      const mappedRank = REVERSE_RANK_MAP[selectedMilitia.rank];
      setRank(mappedRank ? mappedRank.toString() : "");
      
      // Xử lý joinDate (Giả sử BE trả về "2024-01-01T00:00:00Z", cắt lấy phần ngày)
      const datePart = selectedMilitia.joinDate ? selectedMilitia.joinDate.split('T')[0] : "";
      setJoinDate(datePart);
      
      setManagerId(selectedMilitia.managerId || "");
    } else {
      // Đảm bảo Reset Form khi mở modal thêm mới
      setFullName("");
      setEmail("");
      setType("");
      setRank("");
      setJoinDate("");
      setManagerId("");
    }
  }, [isEditMode, selectedMilitia]);

  // 3. Xử lý Submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedType = Number(type);
    const normalizedRank = Number(rank);

    if (!trimmedFullName || !trimmedEmail || !type || !rank || !joinDate) return;
    if (Number.isNaN(normalizedType) || Number.isNaN(normalizedRank)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return;

    militiaStore.clearError();

    const payload = {
      fullName: trimmedFullName,
      email: trimmedEmail,
      type: normalizedType,
      rank: normalizedRank,
      joinDate,
      managerId: managerId || null,
    };

    try {
      if (isEditMode && selectedMilitia) {
        // Cập nhật
        // Nhớ định nghĩa hàm update(id, payload) trong MilitiaStore nhé
        await militiaStore.update(selectedMilitia.id, payload);
      } else {
        // Thêm mới
        await militiaStore.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error("Lỗi khi lưu Dân quân:", err);
    }
  };

  // Logic vô hiệu hóa nút submit
  const isSubmitDisabled =
    isLoading ||
    !fullName.trim() ||
    !email.trim() ||
    !type ||
    !rank ||
    !joinDate;

  return (
    <>
      <div className="mb-6 pr-10">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? "Cập nhật dân quân" : "Thêm dân quân"}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditMode 
            ? "Chỉnh sửa thông tin chi tiết và chức vụ của dân quân này." 
            : "Điền thông tin cơ bản để thêm mới dân quân vào hệ thống."}
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <Label htmlFor="militia-fullname">Họ và tên</Label>
          <Input
            id="militia-fullname"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="militia-email">Email</Label>
          <Input
            id="militia-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            // Nếu email là khóa chính hoặc để đăng nhập, có thể cân nhắc disabled nó khi đang ở chế độ Edit
            // disabled={isEditMode} 
          />
        </div>

        <div>
          <Label htmlFor="militia-type">Loại</Label>
          <Select
            id="militia-type"
            value={type}
            options={MILITIA_TYPES}
            placeholder="Chọn loại"
            onChange={setType}
          />
        </div>

        <div>
          <Label htmlFor="militia-rank">Cấp bậc</Label>
          <Select
            id="militia-rank"
            value={rank}
            options={MILITIA_RANKS}
            placeholder="Chọn cấp bậc"
            onChange={setRank}
          />
        </div>

        <div>
          <Label htmlFor="militia-joindate">Ngày tham gia</Label>
          <DatePicker
            id="militia-joindate"
            mode="single"
            placeholder="Chọn ngày tham gia"
            // Khi reset hoặc nạp dữ liệu, component DatePicker cần được cập nhật
            defaultDate={joinDate || undefined} 
            onChange={(_, currentDateString) => {
              setJoinDate(currentDateString);
            }}
          />
        </div>

        <div>
          <Label htmlFor="militia-managerid">Chỉ huy (Tùy chọn)</Label>
          <Select
            id="militia-managerid"
            value={managerId}
            options={managerOptions}
            placeholder="Không có"
            onChange={setManagerId}
            isLoading={isLoadingManagers}
          />
        </div>

        {error && (
          <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading 
              ? "Đang xử lý..." 
              : isEditMode 
                ? "Lưu thay đổi" 
                : "Thêm dân quân"}
          </button>
        </div>
      </form>
    </>
  );
};

export default observer(MilitiaForm);