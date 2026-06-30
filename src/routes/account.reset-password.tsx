import { Navigate } from "react-router-dom";

export default function AccountResetPasswordRedirect() {
  return <Navigate to="/account/forgot-password" replace />;
}
