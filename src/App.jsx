import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { getPendingAppointment, clearPendingAppointment } from "./services/pendingAppointmentService";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/auth/Auth";
import VerifyAccount from "./pages/auth/VerifyAccount";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/user/Profile";
import Messages from "./pages/user/Messages";
import Doctor from "./pages/doctor/Doctor";
import Appointment from "./pages/doctor/Appointment";
import Appointments from "./pages/user/Appointments";
import BusinessSite from "./pages/businessSite/BusinessSite";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route path="/doctor/:id/:name" element={<Doctor />} />
        <Route path="/doctor/:id/appointment" element={<Appointment />} />
        <Route path="/cabinet/:id" element={<BusinessSite />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Redirect to home (or pending appointment) if already logged in
function AuthRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { state: routeState } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const pending = getPendingAppointment();
    if (pending) {
      clearPendingAppointment();
      navigate(`/doctor/${pending.doctorId}/appointment`, {
        replace: true,
        state: { pendingAppointment: pending },
      });
      return;
    }

    const redirectTo = routeState?.redirectAfterAuth ?? "/home";
    navigate(redirectTo, { replace: true });
  }, [isAuthenticated, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <Auth />;
}

export default App;
