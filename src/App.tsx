import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layouts/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import MilitiaTables from "./pages/Management/MilitiaTables";
import GuardPostTables from "./pages/Management/GuardPostTables";
import DutyShiftTables from "./pages/Management/DutyShiftTables";
import ShiftAssignmentTables from "./pages/Management/ShiftAssignmentTables";
import LeaveRequestTables from "./pages/Management/LeaveRequestTables";
import AccountTables from "./pages/Management/AccountTables";
import AttendanceCheckIn from "./pages/Management/AttendanceCheckIn";
import { GuestOnly, RequireAuth, RequireRole } from "./features/auth/AuthGuards";
import MilitiaLayout from "./layouts/MilitiaLayout";
import MilitiaHome from "./pages/Militia/MilitiaHome";
import MilitiaAssignments from "./pages/Militia/MilitiaAssignments";
import MilitiaLeaveRequests from "./pages/Militia/MilitiaLeaveRequests";
import UserProfiles from "./pages/UserProfiles";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<RequireAuth />}>
            <Route element={<RequireRole allowedRoles={["Admin", "Commander"]} redirectTo="/militia" />}>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Home />} />

                <Route path="/militia-tables" element={<MilitiaTables />} />
                <Route path="/guard-post-tables" element={<GuardPostTables />} />
                <Route path="/duty-shift-tables" element={<DutyShiftTables />} />
                <Route
                  path="/shift-assignment-tables"
                  element={<ShiftAssignmentTables />}
                />
                <Route
                  path="/leave-request-tables"
                  element={<LeaveRequestTables />}
                />
                <Route path="/attendance-checkin" element={<AttendanceCheckIn />} />
                <Route path="/account-tables" element={<AccountTables />} />
                <Route path="/profile" element={<UserProfiles />} />
              </Route>
            </Route>

            <Route element={<RequireRole allowedRoles={["Militia"]} redirectTo="/" />}>
              <Route element={<MilitiaLayout />}>
                <Route path="/militia" element={<MilitiaHome />} />
                <Route path="/militia/profile" element={<UserProfiles />} />
                <Route path="/militia/assignments" element={<MilitiaAssignments />} />
                <Route path="/militia/leave-requests" element={<MilitiaLeaveRequests />} />
              </Route>
            </Route>
          </Route>

          <Route element={<GuestOnly />}>
            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
