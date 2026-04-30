import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../stores/RootStore";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";

const formatShiftTimeForWidget = (value?: string | null): string => {
  if (!value) return "--:--";

  const trimmedValue = value.trim();
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(trimmedValue)) {
    return trimmedValue.slice(0, 5);
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedDate);
};

const CurrentShiftWidget: React.FC = () => {
  const { dutyShiftStore, authStore } = useStore();
  const navigate = useNavigate();

  // Bật đồng hồ khi Component này được render
  useEffect(() => {
    // Luôn refresh để tránh trường hợp list cũ không chứa ca hiện tại.
    void dutyShiftStore.fetchList({ pageIndex: 1, pageSize: 200 });
    
    dutyShiftStore.startTimeSync();
    return () => dutyShiftStore.stopTimeSync();
  }, [dutyShiftStore]);

  const displayShift = dutyShiftStore.currentDisplayShift;
  const activeShift = dutyShiftStore.currentActiveShift;
  const liveShift = dutyShiftStore.currentLiveShift;
  const canAccessAttendanceLive =
    authStore.user?.role === "Admin" || authStore.user?.role === "Commander";

  if (!displayShift) return null;

  return (
    <ComponentCard title="Truy cập nhanh: Ca trực hiện tại">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
        <div>
          <h5 className="text-lg font-bold text-gray-800 dark:text-white">
            {displayShift.shiftOrder === 1 ? "Ca sáng" : displayShift.shiftOrder === 2 ? "Ca chiều" : `Ca ${displayShift.shiftOrder}`}
          </h5>
          <p className="text-sm text-gray-500">
            Thời gian: {formatShiftTimeForWidget(displayShift.startTime)} - {formatShiftTimeForWidget(displayShift.endTime)}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            disabled={!activeShift}
            onClick={() => {
              if (!activeShift) return;
              navigate(`/attendance-live/${activeShift.id}`);
            }}
          >
            Điểm danh đầu ca
          </Button>
          <Button 
            disabled={!canAccessAttendanceLive || !liveShift}
            onClick={() => {
              if (!canAccessAttendanceLive || !liveShift) return;
              navigate(`/attendance-live/${liveShift.id}`);
            }}
          >
            {liveShift ? "Giám sát Live" : "Chưa tới giờ Live"}
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
};

export default observer(CurrentShiftWidget);