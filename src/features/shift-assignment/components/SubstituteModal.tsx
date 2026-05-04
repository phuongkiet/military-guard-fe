import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  absentAssignmentId: string | null;
}

const SubstituteModal = observer(({ isOpen, onClose, absentAssignmentId }: Props) => {
  const { shiftAssignmentStore } = useStore();
  const [selectedMilitiaId, setSelectedMilitiaId] = useState<string | null>(null);

  // Lazy Load Data: Chỉ gọi API khi Modal được mở ra và có ID
  useEffect(() => {
    if (isOpen && absentAssignmentId) {
      setSelectedMilitiaId(null); // Reset lựa chọn cũ
      shiftAssignmentStore.loadAvailableSubstitutes(absentAssignmentId);
    }
  }, [isOpen, absentAssignmentId, shiftAssignmentStore]);

  const handleSubmit = async () => {
    if (!absentAssignmentId || !selectedMilitiaId) return;
    
    try {
      // Gọi action điều động - thay thế
      await shiftAssignmentStore.executeSubstitution(absentAssignmentId, selectedMilitiaId);
      // Thành công - đóng modal
      onClose();
    } catch (error) {
      // Error handling - toast already shown in store
      console.error("Substitution failed:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
          Điều động quân chi viện
        </h2>
        
        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "12px" }}>Chọn dân quân thay thế cho ca trực này:</p>
          
          {shiftAssignmentStore.isLoadingSubstitutes ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Đang tìm quân rảnh rỗi...
            </div>
          ) : (
            <Select
              placeholder="-- Chọn quân dự bị --"
              value={selectedMilitiaId || ""}
              onChange={(value) => setSelectedMilitiaId(value)}
              options={shiftAssignmentStore.availableSubstitutes.map(m => ({
                label: `${m.fullName || "Unknown"} ${m.militiaRank ? `(${m.militiaRank})` : ""} ${m.isStandby ? "(Đang trực dự bị)" : ""}`,
                value: m.militiaId || ""
              }))}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button onClick={onClose} variant="outline">
            Hủy
          </Button>
          <Button 
            disabled={!selectedMilitiaId || shiftAssignmentStore.isSubstituting}
            onClick={handleSubmit}
          >
            {shiftAssignmentStore.isSubstituting ? "Đang xử lý..." : "Xác nhận Điều động"}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

export default SubstituteModal;