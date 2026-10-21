type BadgeColor = "green" | "yellow" | "red";
const colorClasses: Record<BadgeColor, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

const base = "rounded-full px-3 py-1 text-sm font-medium";
export function Badge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
  return <span className={`${base} ${colorClasses[color]}`}>{children}</span>;
}

export default Badge;
