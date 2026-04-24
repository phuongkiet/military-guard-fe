import { createContext, useContext } from "react";
import { AuthStore } from "../features/auth/stores/AuthStore";
import { MilitiaStore } from "../features/militia/stores/MilitiaStore";
import { GuardPostStore } from "../features/guard-post/stores/GuardPostStore";
import { DutyShiftStore } from "../features/duty-shift/stores/DutyShiftStore";
import { ShiftAssignmentStore } from "../features/shift-assignment/stores/ShiftAssignmentStore";
import { LeaveRequestStore } from "../features/leave-request/stores/LeaveRequestStore";
import { AccountStore } from "../features/account/stores/AccountStore";
import { AttendanceStore } from "../features/attendance/stores/AttendanceStore";

export class RootStore {
  authStore: AuthStore;
  militiaStore: MilitiaStore;
  guardPostStore: GuardPostStore;
  dutyShiftStore: DutyShiftStore;
  shiftAssignmentStore: ShiftAssignmentStore;
  leaveRequestStore: LeaveRequestStore;
  accountStore: AccountStore;
  attendanceStore: AttendanceStore;

  constructor() {
    this.authStore = new AuthStore();
    this.militiaStore = new MilitiaStore();
    this.guardPostStore = new GuardPostStore();
    this.dutyShiftStore = new DutyShiftStore();
    this.shiftAssignmentStore = new ShiftAssignmentStore();
    this.leaveRequestStore = new LeaveRequestStore();
    this.accountStore = new AccountStore();
    this.attendanceStore = new AttendanceStore();
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export const useStore = () => useContext(StoreContext);