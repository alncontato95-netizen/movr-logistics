"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Card } from "@/components/ui";
import { markNotificationRead } from "@/app/actions/notifications";

type Props = {
  id: string;
  loadId: string;
  isCompany: boolean;
  read: boolean;
  icon: string;
  message: string;
  when: string;
};

export function NotificationItem({ id, loadId, isCompany, read, icon, message, when }: Props) {
  const [, startTransition] = useTransition();

  const handleClick = () => {
    if (read) return;
    const fd = new FormData();
    fd.set("notificationId", id);
    startTransition(() => {
      void markNotificationRead(fd);
    });
  };

  return (
    <Link
      href={isCompany ? `/company/loads/${loadId}` : `/loads/${loadId}`}
      className="block"
      onClick={handleClick}
    >
      <Card className={`transition-colors hover:border-brand ${read ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg" aria-hidden>
              {icon}
            </span>
            <div>
              <p className="font-medium text-ink">{message}</p>
              <p className="mt-0.5 text-sm text-muted">
                {when}
                {!read && (
                  <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">New</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
