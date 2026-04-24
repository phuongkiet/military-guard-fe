export type AccountRole = "Admin" | "Commander" | "Militia" | string;

export type Account = {
  id: string;
  username: string;
  role: string;
  militiaId?: string | null;
  isDeleted: boolean;
  isBanned: boolean;
};

export type AccountResponse = Account;

export type CreateAccountDTO = {
  username: string;
  password: string;
  role: AccountRole;
  militiaId?: string | null;
};

export type UpdateAccountCommand = {
  id: string;
  role: AccountRole;
  militiaId?: string | null;
};

export type UpdateAccountDTO = Omit<UpdateAccountCommand, "id">;

export type GetAllAccountsQuery = {
  searchTerm?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
};
