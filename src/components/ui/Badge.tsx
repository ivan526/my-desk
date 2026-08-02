import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "moss" | "amber" | "coral" | "blue";
  className?: string;
}

export function Badge({ children, color = "gray", className }: BadgeProps) {
  const colorMap = {
    gray: "bg-bg-tertiary text-ink-secondary",
    moss: "bg-moss-100 text-moss-700",
    amber: "bg-amber-100 text-amber-700",
    coral: "bg-coral-100 text-coral-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={cn("tag", colorMap[color], className)}>{children}</span>;
}
