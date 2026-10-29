import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "warning";
type ToastItem = {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
};
type ToastContextValue = {
  notify: (kind: ToastKind, title: string, message?: string) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

const tone: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
};
const glyph: Record<ToastKind, string> = {
  success: "✓",
  error: "!",
  warning: "!",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const notify = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { id, kind, title, message }]);
      window.setTimeout(
        () => setItems((current) => current.filter((item) => item.id !== id)),
        4500,
      );
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.kind === "error" ? "alert" : "status"}
            className={`flex gap-3 rounded-2xl border p-4 shadow-card ${tone[item.kind]}`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/80 text-sm font-bold">
              {glyph[item.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{item.title}</p>
              {item.message && (
                <p className="mt-1 text-xs leading-5 opacity-80">
                  {item.message}
                </p>
              )}
            </div>
            <button
              aria-label="Dismiss notification"
              className="h-6 w-6 rounded-full text-lg leading-5 opacity-60 hover:bg-black/5"
              onClick={() =>
                setItems((current) =>
                  current.filter((toast) => toast.id !== item.id),
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
