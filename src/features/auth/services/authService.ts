import { requests } from "../api/agent";
import type {
  LoginPayload,
  LoginResponse,
  RegisterResponse,
  SignUpPayload,
} from "../types/auth";

const authEndpoints = {
  signIn: "/Auths/login",
  signUp: "/Auths/register",
};

export const authService = {
  signIn: (payload: LoginPayload) =>
    requests.post<LoginResponse>(authEndpoints.signIn, payload),
  signUp: (payload: SignUpPayload) =>
    requests.post<RegisterResponse>(authEndpoints.signUp, payload),
};
