import { useNavigate } from "react-router-dom";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AdminAuthContext";
import { defaultLandingFor } from "@/lib/permissions";



function ChangePasswordPage() {
  const { changePassword, mustChangePassword, permissions, ensureValidSession } = useAuth();
  const navigate = useNavigate();
  const [currentPwd, setCurrentPwd] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already cleared, kick them to their landing page.
  useEffect(() => {
    if (!mustChangePassword) {
      void navigate(defaultLandingFor(permissions), { replace: true });
    }
  }, [mustChangePassword, permissions, navigate]);

  // Block browser back-navigation while password change is required.
  useEffect(() => {
    if (typeof window === "undefined" || !mustChangePassword) return;
    const lock = () => window.history.pushState(null, "", window.location.href);
    lock();
    window.addEventListener("popstate", lock);
    return () => window.removeEventListener("popstate", lock);
  }, [mustChangePassword]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentPwd) return setError("Enter your current password.");
    if (pwd.length < 8) return setError("Password must be at least 8 characters.");
    if (pwd !== confirm) return setError("Passwords do not match.");
    setSaving(true);
    try {
      await changePassword(currentPwd, pwd);
      await ensureValidSession();
      toast.success("Password updated");
      void navigate(defaultLandingFor(permissions), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      width: "100vw",
      display: "grid",
      placeItems: "center",
      background: "var(--admin-bg-texture, #f6f3ee)",
      padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--admin-surface, #fff)",
          border: "1px solid var(--admin-border, #e6e1d8)",
          borderRadius: 14,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Lock size={18} />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: 0 }}>
            Set a new password
          </h1>
        </div>
        <p style={{ color: "var(--admin-muted, #6b7280)", fontSize: 13, marginTop: 4 }}>
          For security, you must change your temporary password before continuing.
        </p>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="admin-label">Current password</span>
          <input
            type="password"
            className="admin-input"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            required
            autoFocus
            autoComplete="current-password"
          />
        </label>
        <label style={{ display: "block", marginTop: 12 }}>
          <span className="admin-label">New password</span>
          <input
            type="password"
            className="admin-input"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        <label style={{ display: "block", marginTop: 12 }}>

          <span className="admin-label">Confirm password</span>
          <input
            type="password"
            className="admin-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>

        {error && (
          <div style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>{error}</div>
        )}

        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving}
          style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Update password & continue
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;
