interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variants = {
  default: "bg-gray-700 text-gray-200",
  success: "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
  warning: "bg-amber-900/50 text-amber-300 border border-amber-700",
  danger: "bg-red-900/50 text-red-300 border border-red-700",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
