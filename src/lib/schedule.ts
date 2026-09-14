/**
 * Scheduling helpers for a load's pickup window.
 *
 * `pickupDate` is stored as the calendar date picked in the form (UTC
 * midnight). The pickup window (e.g. "08:00 – 11:00") is a wall-clock range
 * on that day. A service can only be executed from the start of that window
 * onward — delays are allowed, early execution is not.
 */

export type WindowStart = { hour: number; minute: number };

const WINDOW_START = /([01]?[0-9]|2[0-3])([:.])([0-5][0-9])/;

export function pickupWindowStart(pickupWindow?: string | null): WindowStart | null {
  if (!pickupWindow) return null;
  const match = pickupWindow.match(WINDOW_START);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[3]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/**
 * The moment a pickup may be confirmed: the pickup day at the window start
 * hour (wall clock), or the whole pickup day when no window is set.
 */
export function pickupReadyAt(pickupDate: Date, pickupWindow?: string | null): Date {
  const start = pickupWindowStart(pickupWindow);
  const year = pickupDate.getUTCFullYear();
  const month = pickupDate.getUTCMonth();
  const day = pickupDate.getUTCDate();
  return start ? new Date(year, month, day, start.hour, start.minute, 0, 0) : new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Pickup may only be confirmed once the scheduled time has arrived. This is
 * the authoritative check — delays are allowed, early execution is not.
 */
export function canConfirmPickup(pickupDate: Date, pickupWindow?: string | null, now: Date = new Date()): boolean {
  return now.getTime() >= pickupReadyAt(pickupDate, pickupWindow).getTime();
}