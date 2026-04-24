export type GuardPost = {
  id: string;
  name: string;
  location: string;
  minPersonnel: number;
  maxPersonnel: number;
  isActive: boolean;
};

export type GuardPostResponse = GuardPost;

export type GuardPostCreateDTO = {
  name: string;
  location: string;
  minPersonnel: number;
  maxPersonnel: number;
};

export type GuardPostUpdateCommand = {
  id: string;
  name: string;
  location: string;
  minPersonnel: number;
  maxPersonnel: number;
  isActive: boolean;
};

export type GuardPostUpdateDTO = Omit<GuardPostUpdateCommand, "id">;

export type GetAllGuardPostsQuery = {
  searchTerm?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
};
