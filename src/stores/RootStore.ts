import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { MilitiaStore } from "./MilitiaStore";
import { GuardPostStore } from "./GuardPostStore";
import { DutyShiftStore } from "./DutyShiftStore";
import { ShiftAssignmentStore } from "./ShiftAssignmentStore";
import { LeaveRequestStore } from "./LeaveRequestStore";
import { AccountStore } from "./AccountStore";
import { AttendanceStore } from "./AttendanceStore";

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