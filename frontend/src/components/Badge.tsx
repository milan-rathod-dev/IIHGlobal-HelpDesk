import type { Priority, TicketStatus } from "../types";

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-700 ring-blue-600/10",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-600/10",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/10",
};
const priorityStyles: Record<Priority, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
  high: "bg-rose-50 text-rose-700 ring-rose-600/10",
};
const label = (value: string) => value.replace("_", " ");

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset ${statusStyles[status]}`}
    >
      {label(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}
