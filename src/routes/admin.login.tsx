import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useAuth } from "@/contexts/AdminAuthContext";
import { ApiError } from "@/services/adminApi";
import { defaultLandingFor } from "@/lib/permissions";
import { PasswordInput } from "@/components/PasswordInput";



const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100dvh",
    width: "100%",
    background: "var(--admin-bg-texture)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "var(--font-sans)",
    color: "var(--admin-text)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "linear-gradient(180deg, color-mix(in oklab, var(--admin-surface) 90%, var(--cream) 10%), var(--admin-surface))",
    border: "1px solid var(--admin-border)",
    borderRadius: 18,
    padding: "clamp(1.5rem, 7vw, 2.75rem)",
    boxShadow: "var(--admin-shadow)",
  },
  logoWrap: { display: "flex", justifyContent: "center" },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "var(--admin-accent)",
    color: "var(--cream)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 600,
  },
  heading: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--admin-text)",
    marginTop: 24,
    textAlign: "center",
  },
  sub: { fontSize: 12, color: "var(--admin-muted)", textAlign: "center", marginTop: 4 },
  form: { marginTop: 32, display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--admin-muted)",
  },
  input: {
    background: "color-mix(in oklab, var(--admin-bg) 84%, var(--admin-surface) 16%)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--admin-text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  error: { fontSize: 13, color: "var(--admin-clay)", minHeight: 20 },
  fieldError: { fontSize: 11.5, color: "var(--admin-clay)", minHeight: 16 },
  submit: {
    width: "100%",
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-display)",
  },
  submitDisabled: { opacity: 0.6, cursor: "not-allowed" },
};

function AdminLoginRoute() {
  const [_searchParams] = useSearchParams();
  const redirect = _searchParams.get("redirect") ?? undefined;

  return <AdminLoginPage redirect={redirect} />;
}

export function AdminLoginPage({ redirect }: { redirect?: string }) {
  const { login, isAuthenticated, permissions, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const safeRedirect =
    redirect &&
    !redirect.startsWith("/admin/login") &&
    !redirect.startsWith("/login")
      ? redirect
      : defaultLandingFor(permissions, user?.staffRole ?? user?.role);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(safeRedirect);
    }
  }, [isAuthenticated, navigate, safeRedirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await login(email, password);
      navigate(safeRedirect);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldErrors(err.fields);
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--admin-accent)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--admin-border)";
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>m</div>
        </div>
        <h1 style={styles.heading}>Admin login</h1>
        <p style={styles.sub}>Moments Packaging internal dashboard</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((current) => ({ ...current, email: "" }));
              }}
              placeholder="admin@momentspackaging.com"
              style={{ ...styles.input, ...(fieldErrors.email ? { borderColor: "var(--admin-clay)" } : {}) }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              autoComplete="email"
            />
            <div style={styles.fieldError}>{fieldErrors.email}</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-password">Password</label>
            <PasswordInput
              id="admin-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: "" }));
              }}
              placeholder="••••••••"
              style={{ ...styles.input, ...(fieldErrors.password ? { borderColor: "var(--admin-clay)" } : {}) }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              autoComplete="current-password"
              toggleStyle={{ color: "var(--admin-muted)" }}
            />
            <div style={styles.fieldError}>{fieldErrors.password}</div>
          </div>

          <div style={styles.error}>{error}</div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 4 }}>
            <Link
              to="/admin/forgot-password"
              style={{ fontSize: 12, color: "var(--admin-muted)", textDecoration: "underline" }}
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginRoute;
