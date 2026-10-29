import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { useToast } from "../context/ToastContext";

export function Header() {
  const { user, setUser } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    notify("success", "Signed out", "Your session has ended.");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12 2xl:px-16">
        <Link to="/" className="flex items-center gap-3 text-ink no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-xs font-extrabold tracking-tight text-white shadow-md shadow-brand-500/20">
            HD
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Helpdesk<span className="text-brand-500">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div className="hidden min-w-24 sm:block">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name}
            </p>
            <p className="text-xs capitalize text-slate-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:px-4 sm:text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
