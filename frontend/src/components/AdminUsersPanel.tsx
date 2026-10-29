import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Role } from "../types";

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};
type UserPage = {
  users: DirectoryUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const roles: Role[] = ["employee", "agent", "admin"];

export function AdminUsersPanel() {
  const { notify } = useToast();
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) query.set("search", search.trim());
      if (role) query.set("role", role);
      try {
        const result = await api<UserPage>(`/users?${query}`);
        if (!cancelled) {
          setUsers(result.users);
          setTotal(result.pagination.total);
          setPages(result.pagination.pages);
        }
      } catch (cause) {
        if (!cancelled) {
          const message = (cause as Error).message;
          setError(message);
          notify("error", "Could not load users", message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, search, role, retry, notify]);

  async function changeRole(user: DirectoryUser, nextRole: Role) {
    if (user.role === nextRole) return;
    setSavingId(user.id);
    try {
      const result = await api<{ user: DirectoryUser }>(
        `/users/${user.id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: nextRole }),
        },
      );
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? result.user : item)),
      );
      notify("success", "Role updated", `${user.name} is now ${nextRole}.`);
    } catch (cause) {
      const message = (cause as Error).message;
      notify("error", "Could not update role", message);
    } finally {
      setSavingId(null);
    }
  }

  const first = total === 0 ? 0 : (page - 1) * 10 + 1;
  const last = Math.min(page * 10, total);

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Search accounts and manage access roles.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {total} {total === 1 ? "user" : "users"} in this system
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
          <label className="relative">
            <span
              aria-hidden
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400"
            >
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search name or email…"
              aria-label="Search users by name or email"
              className={`${selectClass} w-full pl-10`}
            />
          </label>
          <select
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            aria-label="Filter users by role"
            className={selectClass}
          >
            <option value="">All roles</option>
            <option value="employee">Employee</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && !loading && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span>{error}</span>
          <button
            onClick={() => setRetry((value) => value + 1)}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white">
          <Spinner label="Loading users…" />
        </div>
      ) : users.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-xl text-brand-600">
              ♙
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-ink">
              No users found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Try another name, email, or role filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="hidden grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_180px_150px] gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 md:grid">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
          </div>
          {users.map((user) => (
            <article
              key={user.id}
              className="grid gap-3 border-b border-slate-100 px-4 py-5 last:border-b-0 sm:px-6 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_180px_150px] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {user.name[0]?.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user.name}
                  </p>
                  <p className="text-xs capitalize text-slate-400 md:hidden">
                    {user.role}
                  </p>
                </div>
              </div>
              <p className="truncate pl-[52px] text-sm text-slate-500 md:pl-0">
                {user.email}
              </p>
              <label className="flex items-center gap-2 pl-[52px] text-xs text-slate-400 md:pl-0">
                <span className="md:hidden">Role</span>
                <select
                  disabled={savingId === user.id}
                  value={user.role}
                  onChange={(event) =>
                    void changeRole(user, event.target.value as Role)
                  }
                  aria-label={`Change role for ${user.name}`}
                  className="min-w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold capitalize text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60"
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {savingId === user.id && (
                  <span className="text-[11px]">Saving…</span>
                )}
              </label>
              <p className="pl-[52px] text-xs text-slate-400 md:pl-0">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </article>
          ))}
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {first}–{last} of {total}
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold disabled:opacity-40"
            >
              ← Previous
            </button>
            <span>
              Page {page} of {Math.max(1, pages)}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
