import { Navigate } from "react-router-dom";

export default function AdminPaymentsRedirect() {
  return <Navigate to="/admin/orders" replace />;
}
