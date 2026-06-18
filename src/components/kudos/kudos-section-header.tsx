import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface KudosSectionHeaderProps {
  subtitle?: string;
  title: string;
  rightSlot?: ReactNode;
  className?: string;
}

export function KudosSectionHeader({
  subtitle = "Sun* Annual Awards 2025",
  title,
  rightSlot,
  className,
}: KudosSectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-subtitle font-bold text-white">{subtitle}</p>
      <span className="block h-px w-full bg-border-subtle" />
      <div className="flex h-16 flex-row items-center justify-between">
        <h2 className="text-title font-bold tracking-[-0.25px] text-primary-normal">
          {title}
        </h2>
        {rightSlot && <div className="flex items-center">{rightSlot}</div>}
      </div>
    </div>
  );
}
