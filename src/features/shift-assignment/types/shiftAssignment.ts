export type ShiftAssignment = {
  id: string;
  militiaId: string;
  militiaName: string;
  militiaRank: string;
  guardPostId: string;
  guardPostName: string;
  dutyShiftId: string;
  dutyShiftInfo: string;
  date: string;
  isLeader: boolean;
};

export type ShiftAssignmentResponse = ShiftAssignment;

export type ShiftAssignmentCreateDTO = {
  militiaId: string;
  guardPostId: string;
  dutyShiftId: string;
  date: string;
  isLeader: boolean;
};

export type ShiftAssignmentUpdateCommand = {
  id: string;
  isLeader: boolean;
};

export type ShiftAssignmentUpdateDTO = Omit<ShiftAssignmentUpdateCommand, "id">;

export type GetAllShiftAssignmentsQuery = {
  date?: string;
  guardPostId?: string;
  militiaId?: string;
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
