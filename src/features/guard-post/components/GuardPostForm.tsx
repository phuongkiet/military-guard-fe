import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";
import Input from "../../../components/form/input/InputField"; // Giả sử em dùng component Input này
import Label from "../../../components/form/Label"; // Giả sử em dùng component Label này

interface GuardPostFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const GuardPostForm: React.FC<GuardPostFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { guardPostStore } = useStore();
  const { selectedGuardPost, isLoading, error } = guardPostStore;

  const isEditMode = !!selectedGuardPost;

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [minPersonnel, setMinPersonnel] = useState("");
  const [maxPersonnel, setMaxPersonnel] = useState("");

  // Nạp dữ liệu nếu là Update
  useEffect(() => {
    if (isEditMode && selectedGuardPost) {
      setId(selectedGuardPost.id);
      setName(selectedGuardPost.name);
      setLocation(selectedGuardPost.location || ""); // Giả sử model có field này
      setMinPersonnel(selectedGuardPost.minPersonnel?.toString() || "");
      setMaxPersonnel(selectedGuardPost.maxPersonnel?.toString() || "");
    } else {
      // Reset form nếu là Create
      setName("");
      setLocation("");
      setMinPersonnel("");
      setMaxPersonnel("");
    }
  }, [selectedGuardPost, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      name,
      location,
      minPersonnel: Number(minPersonnel),
      maxPersonnel: Number(maxPersonnel),
      isActive: isEditMode ? selectedGuardPost.isActive : true,
    };

    try {
      if (isEditMode) {
        await guardPostStore.updateGuardPost(selectedGuardPost.id, payload);
      } else {
        await guardPostStore.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  // Validation Logic
  const hasInvalidPersonnel =
    Number(minPersonnel) > Number(maxPersonnel) && maxPersonnel !== "";
  const isSubmitDisabled =
    isLoading ||
    !name.trim() ||
    !location.trim() ||
    !minPersonnel ||
    !maxPersonnel ||
    Number(minPersonnel) <= 0 ||
    Number(maxPersonnel) <= 0 ||
    hasInvalidPersonnel;

  return (
    <>
      <div className="mb-6 pr-10">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? "Cập nhật chốt trực" : "Tạo chốt trực"}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditMode
            ? "Chỉnh sửa thông tin chi tiết của chốt trực này."
            : "Điền thông tin cơ bản để tạo mới chốt trực."}
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <Label htmlFor="guard-post-name">Tên chốt</Label>
          <Input
            id="guard-post-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên chốt trực"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="guard-post-location">Vị trí</Label>
          <Input
            id="guard-post-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nhập vị trí chốt trực"
          />
        </div>

        <div>
          <Label htmlFor="guard-post-min-personnel">Quân số tối thiểu</Label>
          <Input
            id="guard-post-min-personnel"
            type="number"
            min="1"
            value={minPersonnel}
            onChange={(e) => setMinPersonnel(e.target.value)}
            placeholder="Ví dụ: 2"
          />
        </div>

        <div>
          <Label htmlFor="guard-post-max-personnel">Quân số tối đa</Label>
          <Input
            id="guard-post-max-personnel"
            type="number"
            min="1"
            value={maxPersonnel}
            onChange={(e) => setMaxPersonnel(e.target.value)}
            placeholder="Ví dụ: 6"
          />
        </div>

        {hasInvalidPersonnel && (
          <div className="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Quân số tối đa phải lớn hơn hoặc bằng quân số tối thiểu.
          </div>
        )}

        {error && (
          <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
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
                : "Tạo chốt trực"}
          </button>
        </div>
      </form>
    </>
  );
};

export default observer(GuardPostForm);
