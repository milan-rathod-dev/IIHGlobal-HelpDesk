export function Spinner({
  label = "Loading",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {    
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[3px]",
    lg: "h-9 w-9 border-4",
  };
  return (
    <span
      className="inline-flex items-center gap-3 text-sm text-slate-500"
      role="status"
    >
      <span
        className={`animate-spin rounded-full border-brand-100 border-t-brand-500 ${dimensions[size]}`}
      />
      <span>{label}</span>
    </span>
  );
}
