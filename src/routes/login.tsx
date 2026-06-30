import { useSearchParams } from "react-router-dom";

import { AdminLoginPage } from "./admin.login";



function LoginAliasPage() {
  const [_searchParams] = useSearchParams();
  const redirect = _searchParams.get("redirect") ?? undefined;

  return <AdminLoginPage redirect={redirect} />;
}

export default LoginAliasPage;
