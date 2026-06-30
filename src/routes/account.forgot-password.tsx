import { Link, useNavigate } from "react-router-dom";

import { InlineProgress } from "@/components/InlineProgress";
import { useState, type FormEvent } from "react";
import { Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { PasswordInput } from "@/components/PasswordInput";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { passwordStore } from "@/services/passwordStore";



type Step = "email" | "otp" | "password" | "done";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await passwordStore.requestReset(email.trim());
      if (!res.ok) { setError(res.message ?? "Could not send reset code."); return; }
      setInfo("If that email belongs to an account, a reset code has been sent.");
      setStep("otp");
    } finally { setSubmitting(false); }
  }

  async function submitOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit code from your email."); return; }
    setSubmitting(true);
    try {
      const res = await passwordStore.verifyOtp(email.trim(), otp);
      if (!res.ok || !res.data?.resetSessionToken) {
        setError(res.message ?? "Invalid or expired code."); return;
      }
      setResetToken(res.data.resetSessionToken);
      setInfo(null);
      setStep("password");
    } finally { setSubmitting(false); }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    try {
      const res = await passwordStore.reset(resetToken, password);
      if (!res.ok) { setError(res.message ?? "Could not reset password."); return; }
      setStep("done");
      toast.success("Password updated");
      setTimeout(() => navigate("/account/login"), 1500);
    } finally { setSubmitting(false); }
  }

  async function resendCode() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await passwordStore.requestReset(email.trim());
      if (!res.ok) { setError(res.message ?? "Could not resend code."); return; }
      setInfo("A new code has been sent if the email is registered.");
    } finally { setSubmitting(false); }
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";
  const btnCls = "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8 lg:py-20">
        {step === "done" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 font-display text-2xl">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting to sign in…</p>
          </div>
        ) : step === "email" ? (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <Mail className="h-6 w-6 text-foreground/70" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a 6-digit reset code.</p>
            <form onSubmit={submitEmail} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={submitting} className={btnCls}>
                {submitting && <InlineProgress size="sm" />} Send reset code
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Remember it? <Link to="/account/login" className="text-accent hover:underline">Sign in</Link>
              </p>
            </form>
          </>
        ) : step === "otp" ? (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <KeyRound className="h-6 w-6 text-foreground/70" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Enter reset code</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. It expires in 15 minutes.
            </p>
            {info && <p className="mt-3 text-sm text-accent">{info}</p>}
            <form onSubmit={submitOtp} className="mt-8 space-y-5">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} inputMode="numeric" pattern="[0-9]*">
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={submitting || otp.length !== 6} className={btnCls}>
                {submitting && <InlineProgress size="sm" />} Verify code
              </button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null); setInfo(null); }} className="hover:underline">
                  ← Change email
                </button>
                <button type="button" onClick={resendCode} disabled={submitting} className="text-accent hover:underline disabled:opacity-60">
                  Resend code
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <Lock className="h-6 w-6 text-foreground/70" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Set a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">Must be at least 8 characters.</p>
            <form onSubmit={submitPassword} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">New password</label>
                <PasswordInput required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
                <PasswordInput required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={submitting} className={btnCls}>
                {submitting && <InlineProgress size="sm" />} Update password
              </button>
            </form>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

export default ForgotPasswordPage;
