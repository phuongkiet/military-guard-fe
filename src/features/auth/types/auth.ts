export type AuthUser = {
  username: string;
  role: string;
  militiaId?: string | null;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type SignUpPayload = {
  username: string;
  password: string;
  role: "Admin" | "Commander" | "Militia";
  militiaId?: string | null;
};

export type LoginResponse = {
  token: string;
  username: string;
  role: string;
  militiaId?: string | null;
};

export type RegisterResponse = {
  message: string;
  accountId: string;
};
