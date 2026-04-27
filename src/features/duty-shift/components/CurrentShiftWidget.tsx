import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../stores/RootStore";
import ComponentCard from "../../../components/common/ComponentCard";
import { displayDate } from "../../../utils/timeFormat";
import Button from "../../../components/ui/button/Button";

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

  const activeShift = dutyShiftStore.currentActiveShift;
  const liveShift = dutyShiftStore.currentLiveShift;
  const canAccessAttendanceLive =
    authStore.user?.role === "Admin" || authStore.user?.role === "Commander";

  if (!activeShift) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">Hiện tại không có ca trực nào đang diễn ra hoặc sắp bắt đầu.</p>
      </div>
    );
  }

  return (
    <ComponentCard title="Truy cập nhanh: Ca trực hiện tại">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
        <div>
          <h5 className="text-lg font-bold text-gray-800 dark:text-white">
            {activeShift.shiftOrder === 1 ? "Ca sáng" : activeShift.shiftOrder === 2 ? "Ca chiều" : `Ca ${activeShift.shiftOrder}`}
          </h5>
          <p className="text-sm text-gray-500">
            Thời gian: {displayDate(activeShift.startTime, true)} - {displayDate(activeShift.endTime, true)}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/attendance-live/${activeShift.id}`)}
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