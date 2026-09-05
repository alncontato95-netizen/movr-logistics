import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  LOAD_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  type LoadStatus,
  type ApplicationStatus,
} from "@/lib/constants";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark shadow-sm",
        variant === "secondary" && "bg-brand-light text-brand-dark hover:bg-brand/15 border border-brand/10",
        variant === "ghost" && "text-ink hover:bg-black/5",
        variant === "danger" && "bg-error text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark shadow-sm",
        variant === "secondary" && "bg-brand-light text-brand-dark hover:bg-brand/15 border border-brand/10",
        variant === "ghost" && "text-ink hover:bg-black/5",
        variant === "danger" && "bg-error text-white hover:bg-red-700",
        className,
       )}
    >
      {children}
    </Link>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-input)] border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-input)] border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius-input)] border border-border bg-surface-strong px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-error">{children}</p>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-white/60 bg-white/75 p-5 shadow-[var(--shadow-float)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(5,5,7,0.09),0_4px_12px_rgba(58,175,66,0.08)]", className)}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "brand" | "amber" | "neutral" | "red" | "green" | "blue" }) {
  const tones: Record<string, string> = {
    brand: "bg-brand-light text-brand-dark border border-brand/15",
    amber: "bg-warning-light text-warning border border-warning/15",
    neutral: "bg-black/[0.04] text-muted border border-border",
    red: "bg-error-light text-error border border-error/15",
    green: "bg-success-light text-success border border-success/20",
    blue: "bg-info-light text-info border border-info/15",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

const loadStatusTone: Record<LoadStatus, "brand" | "amber" | "blue" | "green" | "neutral"> = {
  OPEN: "brand",
  SELECTED: "amber",
  CONFIRMED: "blue",
  PICKED_UP: "blue",
  DELIVERED: "green",
  COMPLETED: "neutral",
};

const applicationStatusTone: Record<ApplicationStatus, "brand" | "amber" | "neutral" | "red" | "green"> = {
  PENDING: "amber",
  SELECTED: "brand",
  ACCEPTED: "green",
  DECLINED: "red",
  REJECTED: "red",
  CANCELLED: "neutral",
};

export function LoadStatusBadge({ status }: { status: LoadStatus }) {
  return <Badge tone={loadStatusTone[status]}>{LOAD_STATUS_LABELS[status]}</Badge>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={applicationStatusTone[status]}>{APPLICATION_STATUS_LABELS[status]}</Badge>;
}

export function FormField({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
