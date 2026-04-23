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

export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRequestCreateDTO = {
  militiaId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type LeaveRequestUpdateDTO = Partial<LeaveRequestCreateDTO>;

export type ProcessLeaveRequestCommand = {
  leaveRequestId: string;
  newStatus: Exclude<LeaveStatus, "pending">;
};

export type GetPagedLeaveRequestsQuery = {
  militiaId?: string;
  status?: LeaveStatus;
  pageIndex?: number;
  pageSize?: number;
};

export type PaginatedList<T> = {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
