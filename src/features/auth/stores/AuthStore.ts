import { makeAutoObservable } from "mobx";
import { getAccessToken, setAccessToken } from "../../../api/agent";
import type { AuthUser } from "../types/auth";

const AUTH_USER_KEY = "authUser";

export class AuthStore {
  user: AuthUser | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.hydrate();
  }

  private hydrate() {
    const token = getAccessToken();
    const savedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !savedUser) {
      return;
    }

    try {
      this.user = JSON.parse(savedUser) as AuthUser;
      this.isAuthenticated = true;
    } catch {
      this.clearPersistedSession();
    }
  }

  login(userData: AuthUser, token: string) {
    this.user = userData;
    this.isAuthenticated = true;
    setAccessToken(token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  }

  logout() {
    this.clearPersistedSession();
    this.user = null;
    this.isAuthenticated = false;
  }

  private clearPersistedSession() {
    setAccessToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}