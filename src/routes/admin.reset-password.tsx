import { Navigate } from "react-router-dom";

export default function AdminResetPasswordRedirect() {
  return <Navigate to="/admin/forgot-password" replace />;
}
