import { useReducer, useRef } from "react";

interface UseSidebarVisibilityOptions {
  closeDelay?: number; // milliseconds before auto-close when not pinned
}

// -------- Types / Events --------

type State =
  | { status: "closed"; pinned: false }
  | { status: "open"; pinned: false }
  | { status: "pinned"; pinned: true };

type Event =
  | { type: "ENTER_HOTZONE" }
  | { type: "LEAVE_SIDEBAR" }
  | { type: "ENTER_SIDEBAR" }
  | { type: "TOGGLE_PIN" };

const reducer = (state: State, event: Event): State => {
  switch (state.status) {
    case "closed": {
      switch (event.type) {
        case "ENTER_HOTZONE":
          return { status: "open", pinned: false };
        case "TOGGLE_PIN":
          return { status: "pinned", pinned: true };
        default:
          return state;
      }
    }
    case "open": {
      switch (event.type) {
        case "LEAVE_SIDEBAR":
          return { status: "closed", pinned: false };
        case "TOGGLE_PIN":
          return { status: "pinned", pinned: true };
        default:
          return state;
      }
    }
    case "pinned": {
      switch (event.type) {
        case "TOGGLE_PIN":
          return { status: "open", pinned: false };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export function useSidebarVisibility({
  closeDelay = 100,
}: UseSidebarVisibilityOptions = {}) {
  const [state, send] = useReducer(reducer, {
    status: "closed",
    pinned: false,
  });

  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // ---- Public helpers that emit events and manage timers ----

  const enterHotZone = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    send({ type: "ENTER_HOTZONE" });
  };

  const leaveSidebar = () => {
    if (state.pinned) return; // ignore if pinned
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      send({ type: "LEAVE_SIDEBAR" });
    }, closeDelay);
  };

  const enterSidebar = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    // staying open, no state change needed
  };

  const togglePin = () => {
    send({ type: "TOGGLE_PIN" });
  };

  // Programmatic open/close interface expected by <SidebarProvider />
  const setOpen = (value: boolean) => {
    if (value) {
      send({ type: "ENTER_HOTZONE" });
    } else {
      send({ type: "LEAVE_SIDEBAR" });
    }
  };

  return {
    open: state.status !== "closed",
    pinned: state.pinned,
    // Expose raw state if needed for debugging
    _state: state,
    setOpen,
    enterHotZone,
    leaveSidebar,
    enterSidebar,
    togglePin,
  };
}
