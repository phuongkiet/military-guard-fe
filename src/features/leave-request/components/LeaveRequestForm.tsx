import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import { formatToISO, parseDateString } from "../../../utils/timeFormat";

interface LeaveRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSuccess, onCancel }) => {
  const { leaveRequestStore, militiaStore } = useStore();
  const { selectedLeaveRequest, isLoading, error } = leaveRequestStore;

  const isEditMode = !!selectedLeaveRequest;

  const [militiaId, setMilitiaId] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [militiaOptions, setMilitiaOptions] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    // Load list militia nếu chưa có
    if (militiaStore.list.length === 0) {
      militiaStore.fetchList({ pageSize: 100 }); 
    }
  }, []);

  useEffect(() => {
    const options = militiaStore.list.map(m => ({
      value: m.id,
      label: m.fullName
    }));
    setMilitiaOptions(options);
  }, [militiaStore.list]);

  // Nạp dữ liệu Update
  useEffect(() => {
    if (isEditMode && selectedLeaveRequest) {
      setMilitiaId(selectedLeaveRequest.militiaId);
      setReason(selectedLeaveRequest.reason);
      setStartDate(parseDateString(selectedLeaveRequest.startDate));
      setEndDate(parseDateString(selectedLeaveRequest.endDate));
    } else {
      setMilitiaId("");
      setReason("");
      setStartDate("");
      setEndDate("");
    }
  }, [isEditMode, selectedLeaveRequest]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!militiaId || !reason.trim() || !startDate || !endDate) return;

    leaveRequestStore.clearError();

    const payload = {
      militiaId,
      reason: reason.trim(),
      startDate: formatToISO(startDate),
      endDate: formatToISO(endDate),
      // Mặc định tạo mới là Pending
      status: isEditMode ? selectedLeaveRequest.status : "Pending",
    };

    try {
      if (isEditMode && selectedLeaveRequest) {
        await leaveRequestStore.update(selectedLeaveRequest.id, payload);
      } else {
        await leaveRequestStore.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const isSubmitDisabled = isLoading || !militiaId || !reason.trim() || !startDate || !endDate;

  return (
    <>
      <div className="mb-6 pr-10">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditMode ? "Cập nhật đơn xin phép" : "Tạo đơn xin phép"}
        </h4>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <Label htmlFor="leave-militia">Dân quân</Label>
          <Select
            id="leave-militia"
            value={militiaId}
            options={militiaOptions}
            placeholder="Chọn người xin phép"
            onChange={setMilitiaId}
            disabled={isEditMode} // Thường không cho đổi người khi đã tạo đơn
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="leave-reason">Lý do nghỉ</Label>
          <Input
            id="leave-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do xin phép"
          />
        </div>

        <div>
          <Label htmlFor="leave-start">Từ ngày</Label>
          <DatePicker
            id="leave-start"
            mode="single"
            placeholder="Chọn ngày bắt đầu"
            defaultDate={startDate || undefined}
            onChange={(_, dateStr) => setStartDate(dateStr)}
          />
        </div>

        <div>
          <Label htmlFor="leave-end">Đến ngày</Label>
          <DatePicker
            id="leave-end"
            mode="single"
            placeholder="Chọn ngày kết thúc"
            defaultDate={endDate || undefined}
            onChange={(_, dateStr) => setEndDate(dateStr)}
          />
        </div>

        {error && (
          <div className="md:col-span-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                : "Tạo đơn nghỉ phép"}
          </button>
        </div>
      </form>
    </>
  );
};

export default observer(LeaveRequestForm);