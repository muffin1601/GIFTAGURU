"use client";

/** Track a confirmed enquiry with an already-initialized Meta Pixel. */
declare global {
  interface Window {
    fbq?: (command: "track", eventName: "Lead") => void;
  }
}

export function trackLead(): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  try {
    window.fbq("track", "Lead");
    return true;
  } catch {
    // A blocked or delayed pixel must never prevent an enquiry from completing.
    return false;
  }
}
