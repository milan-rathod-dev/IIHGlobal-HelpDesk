import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../context/SessionContext";
import { useToast } from "../context/ToastContext";
import type { User } from "../types";
import { Spinner } from "../components/Spinner";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, setUser, ready } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    try {
      const result = await api<{ token: string; user: User }>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      notify(
        "success",
        signup ? "Account created" : "Welcome back",
        `Signed in as ${result.user.name}.`,
      );
      navigate("/");
    } catch (cause) {
      const message = (cause as Error).message;
      setError(message);
      notify(
        "error",
        signup ? "Could not create account" : "Sign in failed",
        message,
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready)
    return (
      <main className="grid min-h-screen place-items-center">
        <Spinner label="Checking your session…" />
      </main>
    );
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/80 via-slate-50 to-indigo-50/80 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-28 top-28 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <Link
          to="/login"
          className="relative flex items-center gap-3 font-display text-xl font-extrabold text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-xs">
            HD
          </span>
          Helpdesk<span className="text-brand-500">.</span>
        </Link>
        <div className="relative max-w-xl pb-10">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-blue-300">
            Support, made simple
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight xl:text-6xl">
            Every request deserves a clear answer.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            Keep support conversations, ownership, and progress together in one
            calm workspace.
          </p>
          <div className="mt-12 flex gap-3">
            <span className="h-1.5 w-10 rounded-full bg-brand-500" />
            <span className="h-1.5 w-5 rounded-full bg-slate-700" />
            <span className="h-1.5 w-5 rounded-full bg-slate-700" />
          </div>
        </div>
        <p className="relative text-xs text-slate-500">
          A focused workspace for your team.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[440px] rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-card backdrop-blur sm:p-10">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-xs font-extrabold text-white">
              HD
            </span>
            <span className="font-display text-lg font-extrabold">
              Helpdesk<span className="text-brand-500">.</span>
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
            {signup ? "Get started" : "Your workspace"}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            {signup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {signup
              ? "Sign up as an employee to create and track support requests."
              : "Sign in to view and manage your support requests."}
          </p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            {signup && (
              <label className="block text-sm font-semibold text-slate-700">
                Full name
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="you@company.com"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                autoComplete={signup ? "new-password" : "current-password"}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder={
                  signup ? "At least 8 characters" : "Enter your password"
                }
              />
            </label>
            {error && (
              <p
                className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? (
                <Spinner
                  label={signup ? "Creating account…" : "Signing in…"}
                  size="sm"
                />
              ) : (
                <>
                  {signup ? "Create account" : "Sign in"}
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            {signup ? "Already have an account?" : "New to Helpdesk Lite?"}{" "}
            <Link
              className="font-bold text-brand-600 hover:text-brand-700"
              to={signup ? "/login" : "/signup"}
            >
              {signup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
