import { Navigate, Outlet, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores/RootStore";

export const RequireAuth = observer(() => {
  const { authStore } = useStore();
  const location = useLocation();

  if (!authStore.isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
});

type RequireRoleProps = {
  allowedRoles: string[];
  redirectTo?: string;
};

export const RequireRole = observer(
  ({ allowedRoles, redirectTo = "/" }: RequireRoleProps) => {
    const { authStore } = useStore();

    if (!authStore.isAuthenticated) {
      return <Navigate to="/signin" replace />;
    }

    const role = authStore.user?.role ?? "";

    if (!allowedRoles.includes(role)) {
      return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
  },
);

export const GuestOnly = observer(() => {
  const { authStore } = useStore();

  if (authStore.isAuthenticated) {
    return <Navigate to={authStore.user?.role === "Militia" ? "/militia" : "/"} replace />;
  }

  return <Outlet />;
});
