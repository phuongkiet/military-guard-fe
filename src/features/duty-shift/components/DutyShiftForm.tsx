import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";
import Input from "../../../components/form/input/InputField"; 
import Label from "../../../components/form/Label";
import TimePicker from "../../../components/form/time-picker";

interface DutyShiftFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DutyShiftForm: React.FC<DutyShiftFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { dutyShiftStore } = useStore();
  const { selectedDutyShift, isLoading, error } = dutyShiftStore;

  const isEditMode = !!selectedDutyShift;

  const [id, setId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shiftOrder, setShiftOrder] = useState("");

  // Nạp dữ liệu nếu là Update
  useEffect(() => {
    if (isEditMode && selectedDutyShift) {
      setId(selectedDutyShift.id);
      setStartTime(selectedDutyShift.startTime);
      setEndTime(selectedDutyShift.endTime);
      setShiftOrder(selectedDutyShift.shiftOrder?.toString() || "");
    } else {
      // Reset form nếu là Create
      setStartTime("");
      setEndTime("");
      setShiftOrder("");
    }
  }, [selectedDutyShift, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id,
      startTime,
      endTime,
      shiftOrder: Number(shiftOrder),
    };

    try {
      if (isEditMode) {
        await dutyShiftStore.update(selectedDutyShift.id, payload);
      } else {
        await dutyShiftStore.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  // Validation Logic
  const isSubmitDisabled =
    isLoading ||
    !startTime ||
    !endTime ||
    !shiftOrder ||
    Number(shiftOrder) <= 0;

  return (
    <>
      <div className="mb-6 pr-10">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? "Cập nhật ca trực" : "Tạo ca trực"}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isEditMode
            ? "Chỉnh sửa thông tin chi tiết của ca trực này."
            : "Điền thông tin cơ bản để tạo mới ca trực."}
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <Label htmlFor="start-time">Giờ bắt đầu</Label>
          <TimePicker
            id="start-time"
            value={startTime}
            onChange={setStartTime}
            placeholder="Chọn giờ bắt đầu"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="end-time">Giờ kết thúc</Label>
          <TimePicker
            id="end-time"
            value={endTime}
            onChange={setEndTime}
            placeholder="Chọn giờ kết thúc"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="guard-post-shift-order">Thứ tự ca</Label>
          <Input
            id="guard-post-shift-order"
            type="number"
            min="1"
            value={shiftOrder}
            onChange={(e) => setShiftOrder(e.target.value)}
            placeholder="Nhập thứ tự ca (số nguyên dương)"
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
                : "Tạo ca trực"}
          </button>
        </div>
      </form>
    </>
  );
};

export default observer(DutyShiftForm);
