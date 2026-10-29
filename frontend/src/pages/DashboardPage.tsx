import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { Spinner } from "../components/Spinner";
import { AdminUsersPanel } from "../components/AdminUsersPanel";
import { useSession } from "../context/SessionContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Priority, Ticket } from "../types";

type TicketList = {
  tickets: Ticket[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
const inputStyle =
  "rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function DashboardPage() {
  const { user } = useSession();
  const { notify } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [view, setView] = useState<"tickets" | "users">("tickets");
  const support = user?.role === "agent" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (view === "users" && isAdmin) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({ page: String(page), limit: "8" });
      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);
      if (priority) query.set("priority", priority);
      try {
        const result = await api<TicketList>(`/tickets?${query}`);
        if (!cancelled) {
          setTickets(result.tickets);
          setTotal(result.pagination.total);
          setPages(result.pagination.pages);
        }
      } catch (cause) {
        if (!cancelled) {
          const message = (cause as Error).message;
          setError(message);
          notify("error", "Could not load tickets", message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, search, status, priority, view, isAdmin, notify]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    try {
      await api("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority: newPriority,
        }),
      });
      setTitle("");
      setDescription("");
      setNewPriority("medium");
      setShowCreate(false);
      setPage(1);
      notify(
        "success",
        "Request created",
        "Your support ticket is ready to track.",
      );
      // Refresh immediately when already on page one.
      if (page === 1) refresh();
    } catch (cause) {
      const message = (cause as Error).message;
      notify("error", "Could not create request", message);
    } finally {
      setCreating(false);
    }
  }

  function refresh() {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: "8" });
    if (search.trim()) query.set("search", search.trim());
    if (status) query.set("status", status);
    if (priority) query.set("priority", priority);
    api<TicketList>(`/tickets?${query}`)
      .then((result) => {
        setTickets(result.tickets);
        setTotal(result.pagination.total);
        setPages(result.pagination.pages);
      })
      .catch((cause) => {
        const message = (cause as Error).message;
        setError(message);
        notify("error", "Could not refresh tickets", message);
      })
      .finally(() => setLoading(false));
  }

  const start = total === 0 ? 0 : (page - 1) * 8 + 1;
  const end = Math.min(page * 8, total);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12 lg:py-12 2xl:px-16">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-brand-600">
              {view === "users"
                ? "Admin workspace"
                : support
                  ? "Support workspace"
                  : "Your workspace"}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {view === "users"
                ? "User management"
                : support
                  ? "All tickets"
                  : "My tickets"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {view === "users"
                ? "Manage accounts and access roles."
                : `${total} ${total === 1 ? "request" : "requests"} in your workspace`}
            </p>
          </div>
          {view === "tickets" && (
            <button
              onClick={() => setShowCreate((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              <span className="text-lg leading-none">＋</span> New ticket
            </button>
          )}
        </div>

        {isAdmin && (
          <div
            className="mb-6 flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            role="tablist"
            aria-label="Admin workspace views"
          >
            <button
              role="tab"
              aria-selected={view === "tickets"}
              onClick={() => setView("tickets")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${view === "tickets" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              Tickets
            </button>
            <button
              role="tab"
              aria-selected={view === "users"}
              onClick={() => setView("users")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${view === "users" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              Users
            </button>
          </div>
        )}

        {view === "users" && isAdmin ? (
          <AdminUsersPanel />
        ) : (
          <>
            {showCreate && (
              <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.2em] text-brand-600">
                      New request
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-ink">
                      What can we help with?
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    aria-label="Close form"
                    className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ×
                  </button>
                </div>
                <form
                  onSubmit={createTicket}
                  className="grid gap-4 lg:grid-cols-2"
                >
                  <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:col-span-2">
                    Title{" "}
                    <span className="text-xs font-normal text-slate-400">
                      5–10 characters
                    </span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      minLength={5}
                      maxLength={10}
                      placeholder="e.g. Email issue"
                      className={inputStyle}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:col-span-2">
                    Description
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      required
                      maxLength={10000}
                      rows={4}
                      placeholder="Add the details our support team needs…"
                      className={`${inputStyle} resize-y`}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Priority
                    <select
                      value={newPriority}
                      onChange={(event) =>
                        setNewPriority(event.target.value as Priority)
                      }
                      className={inputStyle}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <div className="flex items-end justify-end">
                    <button
                      disabled={creating}
                      className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
                    >
                      {creating ? (
                        <Spinner label="Creating…" size="sm" />
                      ) : (
                        "Submit request →"
                      )}
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:grid-cols-[minmax(220px,1fr)_190px_170px] sm:p-4">
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
                  placeholder="Search tickets by title…"
                  aria-label="Search by title"
                  className={`${inputStyle} w-full pl-10`}
                />
              </label>
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                aria-label="Filter by status"
                className={inputStyle}
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priority}
                onChange={(event) => {
                  setPage(1);
                  setPriority(event.target.value);
                }}
                aria-label="Filter by priority"
                className={inputStyle}
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </section>

            {error && !loading && (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              >
                <span>{error}</span>
                <button onClick={refresh} className="font-bold underline">
                  Retry
                </button>
              </div>
            )}
            {loading ? (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white">
                <Spinner label="Loading tickets…" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
                    ✓
                  </span>
                  <h2 className="mt-5 font-display text-lg font-bold text-ink">
                    No tickets found
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {search || status || priority
                      ? "Try changing your search or filters."
                      : "Create a ticket and the support team will follow up here."}
                  </p>
                  {!search && !status && !priority && (
                    <button
                      onClick={() => setShowCreate(true)}
                      className="mt-5 text-sm font-bold text-brand-600 hover:text-brand-700"
                    >
                      Create your first ticket →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                  <div className="hidden grid-cols-[minmax(240px,1fr)_150px_120px_100px] gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 lg:grid">
                    <span>Ticket</span>
                    <span>Status</span>
                    <span>Priority</span>
                    <span>Created</span>
                  </div>
                  {tickets.map((ticket) => (
                    <Link
                      key={ticket._id}
                      to={`/tickets/${ticket._id}`}
                      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-slate-100 px-4 py-5 transition last:border-b-0 hover:bg-blue-50/30 sm:px-6 lg:grid-cols-[minmax(240px,1fr)_150px_120px_100px] lg:gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500 transition group-hover:bg-brand-100 group-hover:text-brand-700">
                            ↗
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800 group-hover:text-brand-700">
                              {ticket.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              #{ticket._id.slice(-6).toUpperCase()}
                              <span className="mx-2">·</span>
                              {support
                                ? `by ${ticket.createdBy?.name}`
                                : "Support request"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-start-2 row-start-1 lg:col-auto lg:row-auto">
                        <StatusBadge status={ticket.status} />
                      </div>
                      <div className="col-start-1 row-start-2 pl-12 lg:col-auto lg:row-auto lg:pl-0">
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <time className="col-start-2 row-start-2 text-right text-xs text-slate-400 lg:col-auto lg:row-auto lg:text-left">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </time>
                    </Link>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {start}–{end} of {total}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((value) => value - 1)}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <span>
                      Page {page} of {Math.max(1, pages)}
                    </span>
                    <button
                      disabled={page >= pages}
                      onClick={() => setPage((value) => value + 1)}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
