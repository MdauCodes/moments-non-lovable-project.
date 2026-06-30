// ----------------------------------------------------------------------------
// Onboarding tour definitions per staff role.
// All state is localStorage only — never persisted to backend.
// ----------------------------------------------------------------------------
import type { StaffRoleName } from "@/lib/roles";

export type TourPosition = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  /** CSS selector for the element to highlight. If null/not found, tooltip centers. */
  targetSelector: string | null;
  title: string;
  body: string;
  position?: TourPosition;
}

export interface RoleTour {
  steps: TourStep[];
  /** One-sentence role summary shown in the "You're all set" modal. */
  summary: string;
}

const ROLE_BADGE = '[data-tour="role-badge"]';
const SIDEBAR = '[data-tour="sidebar"]';
const NAV = (key: string) => `[data-tour="nav-${key}"]`;
const DASH_STATS = '[data-admin-stats]';

export const ROLE_TOURS: Partial<Record<StaffRoleName, RoleTour>> = {
  SUPER_ADMIN: {
    summary: "As Super Admin, you have full access to every part of the system.",
    steps: [
      { targetSelector: SIDEBAR, title: "Your command center", body: "Navigate between all sections of the admin from this sidebar. Everything you can manage lives here.", position: "right" },
      { targetSelector: DASH_STATS, title: "Live overview", body: "A real-time snapshot of today's revenue and orders so you always know where the business stands.", position: "bottom" },
      { targetSelector: NAV("orders"), title: "Orders", body: "All orders in one place — search, filter, and export them whenever you need a record.", position: "right" },
      { targetSelector: NAV("users"), title: "Users", body: "Create and manage staff accounts here. Each person gets their own role with specific permissions.", position: "right" },
      { targetSelector: NAV("roles"), title: "Roles", body: "Define what each role can see and do. Default roles are locked — create custom ones for your team.", position: "right" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "This shows your current role. Staff see only what their role allows.", position: "right" },
    ],
  },
  ADMIN: {
    summary: "As Administrator, you manage day-to-day operations across the platform.",
    steps: [
      { targetSelector: SIDEBAR, title: "Your command center", body: "Navigate between all sections of the admin from this sidebar.", position: "right" },
      { targetSelector: DASH_STATS, title: "Live overview", body: "Today's revenue and orders at a glance.", position: "bottom" },
      { targetSelector: NAV("orders"), title: "Orders", body: "All orders in one place — search, filter, export.", position: "right" },
      { targetSelector: NAV("users"), title: "Users", body: "Create and manage staff accounts here.", position: "right" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "This shows your current role and the permissions tied to it.", position: "right" },
    ],
  },
  SUPERVISOR: {
    summary: "As Supervisor, you oversee the team and assign work — you don't process queue stages yourself.",
    steps: [
      { targetSelector: DASH_STATS, title: "Your overview", body: "Revenue, pending orders, and top products — your daily snapshot.", position: "bottom" },
      { targetSelector: NAV("orders"), title: "Orders", body: "All orders are visible to you. You decide who works on what.", position: "right" },
      { targetSelector: '[data-tour="assign-dropdown"]', title: "Assign orders", body: "Use this to assign orders to the right team member. You can only assign to staff at your level or below.", position: "left" },
      { targetSelector: '[data-tour="status-override"]', title: "Status override", body: "You can manually change any order status if needed — use this carefully.", position: "left" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "You are a Supervisor. You oversee the team but do not process queue stages yourself.", position: "right" },
    ],
  },
  PAYMENTS_CONFIRMER: {
    summary: "As Payments Confirmer, you verify M-Pesa payments — the first step in fulfilling every order.",
    steps: [
      { targetSelector: '[data-tour="queue-page"]', title: "Payment Queue", body: "This is your workspace. Orders that customers have paid via M-Pesa appear here.", position: "bottom" },
      { targetSelector: '[data-tour="queue-row"]', title: "Order row", body: "Each row shows the order reference, amount, and customer. Always double-check the amount matches what M-Pesa confirmed.", position: "top" },
      { targetSelector: '[data-tour="verify-payment-btn"]', title: "Verify Payment", body: "Click this to confirm payment is correct. The order then moves to the packaging team.", position: "left" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "You are a Payments Confirmer. Your verification is the first step in fulfilling every order.", position: "right" },
    ],
  },
  PREPARER: {
    summary: "As Preparer, you physically pack the orders that have been paid for.",
    steps: [
      { targetSelector: '[data-tour="queue-page"]', title: "Preparation Queue", body: "Orders verified by the payments team appear here, ready for you to package.", position: "bottom" },
      { targetSelector: '[data-tour="start-packing-btn"]', title: "Start Packing", body: "Click when you begin working on an order. This marks it as In Production.", position: "left" },
      { targetSelector: '[data-tour="mark-ready-btn"]', title: "Mark Ready", body: "Click when the order is fully packed and ready to hand to the dispatcher.", position: "left" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "You are a Preparer. You physically pack the orders.", position: "right" },
    ],
  },
  DISPATCHER: {
    summary: "As Dispatcher, you're the last step before the customer receives their order.",
    steps: [
      { targetSelector: '[data-tour="queue-page"]', title: "Dispatch Queue", body: "Fully packed orders appear here, ready to send out.", position: "bottom" },
      { targetSelector: '[data-tour="open-checklist-btn"]', title: "Open Checklist", body: "Always open the checklist before dispatching. Verify every item is present.", position: "left" },
      { targetSelector: '[data-tour="dispatch-order-btn"]', title: "Dispatch Order", body: "Only click this when you have confirmed all items are packed and the courier is ready.", position: "left" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "You are a Dispatcher. You are the last step before the customer receives their order.", position: "right" },
    ],
  },
  STAFF: {
    summary: "As Staff, you work the orders your supervisor assigns to you.",
    steps: [
      { targetSelector: NAV("orders"), title: "Your orders", body: "Only orders assigned to you appear here. Your supervisor assigns work to you.", position: "right" },
      { targetSelector: '[data-tour="order-view-btn"]', title: "Order detail", body: "Click View to see full order details — items, customer info, and delivery address.", position: "left" },
      { targetSelector: ROLE_BADGE, title: "Your role", body: "You are Staff. If you need to make changes to an order, contact your supervisor.", position: "right" },
    ],
  },
};

export function onboardingStorageKey(userId: string): string {
  return `onboarding_done_${userId}`;
}

export function isOnboardingDone(userId: string | undefined | null): boolean {
  if (!userId || typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(onboardingStorageKey(userId)) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingDone(userId: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(onboardingStorageKey(userId), "1"); } catch { /* ignore */ }
}

export function resetOnboarding(userId: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(onboardingStorageKey(userId)); } catch { /* ignore */ }
}
