"use client";

import { useState, useEffect } from 'react';
import { Shield, Lock, Mail, Phone, User } from 'lucide-react';
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const error = params.get("error");

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [supabase] = useState<ReturnType<typeof createClient> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!supabase) {
      setMessage("Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      if (authMethod === "phone") {
        if (!otpSent) {
          setMessage("Send an OTP first.");
          return;
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: "sms",
        });
        if (verifyError) throw verifyError;
        router.replace(next);
        router.refresh();
        return;
      }

      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(next);
        router.refresh();
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      setMessage("Account created. Check your email if confirmation is required, then sign in.");
      setMode("signin");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function onMagicLink() {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      const origin = window.location.origin;
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (linkError) throw linkError;
      setMessage("Magic link sent. Check your email to complete sign-in.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setBusy(false);
    }
  }

  async function onSendSmsOtp() {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms" },
      });
      if (otpError) throw otpError;
      setOtpSent(true);
      setMessage("OTP sent via SMS. Enter it below to sign in.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Authentication error. Please try again.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAuthMethod("email")}
          className={`rounded-lg px-3 py-2 text-sm ${
            authMethod === "email"
              ? "bg-cyan-500/20 text-cyan-200"
              : "border border-slate-700 bg-slate-950/50 text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod("phone")}
          className={`rounded-lg px-3 py-2 text-sm ${
            authMethod === "phone"
              ? "bg-cyan-500/20 text-cyan-200"
              : "border border-slate-700 bg-slate-950/50 text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          Mobile OTP
        </button>
      </div>

      {authMethod === "email" ? (
        <>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">Email</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e?.target?.value || '')}
              placeholder="analyst@company.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">Password</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e?.target?.value || '')}
              placeholder="••••••••"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">Phone (E.164)</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e?.target?.value || '')}
              placeholder="+15551234567"
            />
          </div>

          <button
            type="button"
            onClick={onSendSmsOtp}
            disabled={busy || !phone || !supabase}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/60 disabled:opacity-60"
          >
            Send OTP
          </button>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">OTP Code</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500/60"
              inputMode="numeric"
              required
              value={otp}
              onChange={(e) => setOtp(e?.target?.value || '')}
              placeholder="123456"
            />
          </div>
        </>
      )}

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}

      <button
        type="submit"
        disabled={busy || !supabase}
        className="w-full rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-60"
      >
        {busy
          ? "Working..."
          : authMethod === "phone"
            ? "Verify OTP & Sign in"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
      </button>

      {authMethod === "email" ? (
        <button
          type="button"
          onClick={onMagicLink}
          disabled={busy || !email || !supabase}
          className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/60 disabled:opacity-60"
        >
          Send magic link
        </button>
      ) : null}

      {authMethod === "email" ? (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>{mode === "signin" ? "New here?" : "Already have an account?"}</span>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-cyan-300 hover:text-cyan-200"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

