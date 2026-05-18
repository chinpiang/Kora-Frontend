import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, changePositive, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        {icon && <div className="text-zinc-600">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-1 text-xs",
            changePositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {changePositive ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}
