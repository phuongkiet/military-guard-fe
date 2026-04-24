export type Militia = {
  id: string;
  fullName: string;
  email: string;
  type: string;
  rank: string;
  monthsOfService: number;
  managerName?: string | null;
};

export type MilitiaResponse = Militia;

export type MilitiaType = number;
export type MilitiaRank = number;

export type MilitiaCreateDTO = {
  fullName: string;
  email: string;
  type: MilitiaType;
  rank: MilitiaRank;
  joinDate: string;
  managerId?: string | null;
};

export type MilitiaUpdateCommand = {
  id: string;
  fullName: string;
  email: string;
  type: MilitiaType;
  rank: MilitiaRank;
  joinDate: string;
  managerId?: string | null;
};

export type MilitiaUpdateDTO = Omit<MilitiaUpdateCommand, "id">;

export type GetAllMilitiasQuery = {
  searchTerm?: string;
  type?: MilitiaType;
  rank?: MilitiaRank;
  pageIndex?: number;
  pageSize?: number;
};
