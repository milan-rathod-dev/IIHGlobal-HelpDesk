import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { Spinner } from "../components/Spinner";
import { useSession } from "../context/SessionContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Ticket, TicketStatus } from "../types";

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];
const panel = "rounded-2xl border border-slate-200 bg-white shadow-card";

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const { notify } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const support = user?.role === "agent" || user?.role === "admin";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<{ ticket: Ticket }>(`/tickets/${id}`)
      .then((result) => {
        if (!cancelled) setTicket(result.ticket);
      })
      .catch((cause) => {
        if (!cancelled) {
          const message = (cause as Error).message;
          setError(message);
          notify("error", "Could not open ticket", message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, notify]);

  async function update(fields: {
    status?: TicketStatus;
    assignToMe?: boolean;
  }) {
    if (fields.status === "closed" && ticket?.status !== "closed")
      notify(
        "warning",
        "Closing this ticket",
        "The status will be marked as closed.",
      );
    setUpdating(true);
    try {
      const result = await api<{ ticket: Ticket }>(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      setTicket(result.ticket);
      notify(
        "success",
        fields.assignToMe ? "Ticket assigned" : "Status updated",
        fields.assignToMe
          ? "This ticket is now assigned to you."
          : `Ticket marked ${result.ticket.status.replace("_", " ")}.`,
      );
    } catch (cause) {
      const message = (cause as Error).message;
      notify("error", "Could not update ticket", message);
    } finally {
      setUpdating(false);
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      const result = await api<{ ticket: Ticket }>(`/tickets/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: comment.trim() }),
      });
      setTicket(result.ticket);
      setComment("");
      notify(
        "success",
        "Reply added",
        "Your comment is now part of the conversation.",
      );
    } catch (cause) {
      notify("error", "Could not add reply", (cause as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function deleteTicket() {
    if (!ticket) return;
    setDeleting(true);
    try {
      await api<void>(`/tickets/${ticket._id}`, { method: "DELETE" });
      notify(
        "success",
        "Request deleted",
        "Your open support request has been removed.",
      );
      navigate("/");
    } catch (cause) {
      notify("error", "Could not delete request", (cause as Error).message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-8 lg:px-12 lg:py-10 2xl:px-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
        >
          ← <span>All tickets</span>
        </Link>
        {loading ? (
          <div className={`${panel} grid min-h-80 place-items-center`}>
            <Spinner label="Loading ticket…" />
          </div>
        ) : error || !ticket ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-card"
          >
            <p className="font-semibold text-rose-700">
              {error || "Ticket not found"}
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm font-bold text-brand-600"
            >
              Return to tickets
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-6 flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:flex-row sm:items-start sm:p-8">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-brand-600">
                  Request #{ticket._id.slice(-6).toUpperCase()}
                </p>
                <h1 className="mt-2 break-words font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {ticket.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              {support && (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-52">
                  <button
                    disabled={
                      updating ||
                      ticket.assignedTo?.id === user?.id ||
                      ticket.assignedTo?._id === user?.id
                    }
                    onClick={() => void update({ assignToMe: true })}
                    className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-100 disabled:cursor-default disabled:opacity-70"
                  >
                    {ticket.assignedTo?.id === user?.id ||
                    ticket.assignedTo?._id === user?.id
                      ? "✓ Assigned to you"
                      : updating
                        ? "Updating…"
                        : "Assign to me"}
                  </button>
                  <label className="grid gap-1.5 text-xs font-semibold text-slate-500">
                    Update status
                    <select
                      disabled={updating}
                      value={ticket.status}
                      onChange={(event) =>
                        void update({
                          status: event.target.value as TicketStatus,
                        })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
              <section className={`${panel} p-5 sm:p-8`}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">
                    Description
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {ticket.description}
                  </p>
                </div>
                <div className="mt-8 border-t border-slate-100 pt-7">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Conversation
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      {ticket.comments.length}
                    </span>
                  </div>
                  {ticket.comments.length === 0 ? (
                    <div className="my-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
                      <p className="text-sm font-semibold text-slate-600">
                        No replies yet
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Add a comment to start the conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-6">
                      {ticket.comments.map((item) => (
                        <article key={item._id} className="flex gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                            {item.author?.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-slate-50 p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-sm font-bold text-slate-800">
                                {item.author?.name ?? "User"}
                              </p>
                              <time className="text-[11px] text-slate-400">
                                {new Date(item.createdAt).toLocaleString()}
                              </time>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                              {item.text}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <form
                  onSubmit={addComment}
                  className="mt-7 border-t border-slate-100 pt-6"
                >
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Add a reply
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      required
                      maxLength={5000}
                      rows={4}
                      placeholder="Write a helpful reply…"
                      className="resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      disabled={sending}
                      className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
                    >
                      {sending ? (
                        <Spinner label="Sending…" size="sm" />
                      ) : (
                        "Send reply →"
                      )}
                    </button>
                  </div>
                </form>
              </section>

              <aside className={`${panel} p-5 sm:p-7`}>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Ticket details
                </p>
                <dl className="mt-4 divide-y divide-slate-100">
                  <div className="grid gap-1 py-4">
                    <dt className="text-xs text-slate-400">Created by</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {ticket.createdBy?.name}
                    </dd>
                    <dd className="text-xs text-slate-500">
                      {ticket.createdBy?.email}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4">
                    <dt className="text-xs text-slate-400">Assigned to</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {ticket.assignedTo?.name ?? "Unassigned"}
                    </dd>
                    {ticket.assignedTo?.email && (
                      <dd className="text-xs text-slate-500">
                        {ticket.assignedTo.email}
                      </dd>
                    )}
                  </div>
                  <div className="grid gap-1 py-4">
                    <dt className="text-xs text-slate-400">Created</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4">
                    <dt className="text-xs text-slate-400">Last updated</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                {!support && (
                  <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                    Only support agents can change the status of this ticket
                  </p>
                )}
                {(ticket.createdBy?.id === user?.id ||
                  ticket.createdBy?._id === user?.id) &&
                  ticket.status === "open" && (
                    <div className="mt-5 border-t border-rose-100 pt-5">
                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                        >
                          Delete this request
                        </button>
                      ) : (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                          <p className="text-sm font-bold text-rose-800">
                            Delete this request?
                          </p>
                          <p className="mt-1 text-xs leading-5 text-rose-700">
                            This action can’t be undone.
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => setConfirmDelete(false)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                            >
                              Keep request
                            </button>
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => void deleteTicket()}
                              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                            >
                              {deleting ? "Deleting…" : "Delete request"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
