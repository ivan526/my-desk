import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn("card p-4", hover && "card-hover cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sublabel,
  color = "moss",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: "moss" | "amber" | "coral" | "blue";
}) {
  const colorMap = {
    moss: "text-moss-600",
    amber: "text-amber-600",
    coral: "text-coral-600",
    blue: "text-blue-600",
  };
  return (
    <div className="bg-bg-secondary rounded-md p-4">
      <p className="text-xs text-ink-tertiary mb-1">{label}</p>
      <p className={cn("text-2xl font-medium", colorMap[color])}>{value}</p>
      {sublabel && <p className="text-2xs text-ink-hint mt-1">{sublabel}</p>}
    </div>
  );
}
