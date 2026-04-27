export type LeaveRequest = {
  id: string;
  militiaId: string;
  militiaName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type LeaveRequestResponse = LeaveRequest;

export type LeaveStatus = 0 | 1 | 2;

export type LeaveRequestCreateDTO = {
  militiaId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type LeaveRequestUpdateDTO = Partial<LeaveRequestCreateDTO>;

export type ProcessLeaveRequestCommand = {
  leaveRequestId: string;
  newStatus: Exclude<LeaveStatus, 0>;
};

export type GetPagedLeaveRequestsQuery = {
  militiaId?: string;
  status?: LeaveStatus;
  pageIndex?: number;
  pageSize?: number;
};
