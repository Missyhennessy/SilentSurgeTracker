import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export function ResponsiveContainer({ 
  children, 
  className = "", 
  mobileClassName = "",
  desktopClassName = ""
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full",
      className,
      // Mobile styles
      "px-2 py-2 md:px-4 md:py-4 lg:px-6 lg:py-6",
      mobileClassName,
      desktopClassName
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  const gridCols = cn(
    "grid gap-3 md:gap-4 lg:gap-6",
    cols.mobile === 1 && "grid-cols-1",
    cols.mobile === 2 && "grid-cols-2",
    cols.tablet === 2 && "md:grid-cols-2",
    cols.tablet === 3 && "md:grid-cols-3",
    cols.desktop === 2 && "lg:grid-cols-2",
    cols.desktop === 3 && "lg:grid-cols-3",
    cols.desktop === 4 && "lg:grid-cols-4",
    className
  );

  return (
    <div className={gridCols}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ResponsiveCard({ 
  children, 
  className = "",
  title,
  subtitle
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      "bg-[var(--dark-panel)] border border-[var(--dark-border)] rounded-lg",
      "p-3 md:p-4 lg:p-6",
      "mb-3 md:mb-4 lg:mb-6",
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-3 md:mb-4">
          {title && (
            <h3 className="text-base md:text-lg lg:text-xl font-semibold text-[var(--text-primary)] mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}