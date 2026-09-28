import { useSyncExternalStore } from "react";

const PHONE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isPhone() {
  return window.matchMedia(PHONE_QUERY).matches;
}

/** A width-only viewport signal shared by the dashboard and its demo. */
export function usePhoneViewport() {
  return useSyncExternalStore(subscribe, isPhone, () => false);
}