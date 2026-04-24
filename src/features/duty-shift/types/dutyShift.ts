export type DutyShift = {
  id: string;
  startTime: string;
  endTime: string;
  shiftOrder: number;
};

export type DutyShiftResponse = DutyShift;

export type DutyShiftCreateDTO = {
  startTime?: string | null;
  endTime?: string | null;
  shiftOrder: number;
};

export type DutyShiftUpdateCommand = {
  id: string;
  startTime: string;
  endTime: string;
  shiftOrder: number;
};

export type DutyShiftUpdateDTO = Omit<DutyShiftUpdateCommand, "id">;

export type GetAllDutyShiftsQuery = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};
