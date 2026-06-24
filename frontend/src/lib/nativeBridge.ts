/**
 * JS↔native bridge abstraction for the iOS WebView wrapper (MagicTextSDK).
 *
 * Inside the native WebView, messages are posted to
 * `window.webkit.messageHandlers.<name>`. On the plain web, every method
 * degrades to a no-op or a sensible web fallback, so the same bundle runs in
 * both environments. The native project (Xcode) is out of scope for this
 * delivery — see docs/IOS_BRIDGE.md for the contract to wire up later.
 */

type BridgeMessage =
  | { type: "navigation"; payload: { route: string } }
  | { type: "requestCameraPermission"; payload?: undefined }
  | { type: "requestMicPermission"; payload?: undefined }
  | { type: "haptic"; payload: { style: "light" | "medium" | "heavy" } };

interface WebkitWindow {
  webkit?: {
    messageHandlers?: Record<
      string,
      { postMessage: (msg: unknown) => void } | undefined
    >;
  };
}

/** True when running inside the native iOS WebView. */
export function isNativeWebView(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as WebkitWindow).webkit?.messageHandlers?.bridge);
}

function post(message: BridgeMessage): void {
  if (typeof window === "undefined") return;
  const handler = (window as WebkitWindow).webkit?.messageHandlers?.bridge;
  handler?.postMessage(message);
}

export const nativeBridge = {
  /** Notify native of an in-app navigation (for native chrome / analytics). */
  notifyNavigation(route: string): void {
    post({ type: "navigation", payload: { route } });
  },

  /**
   * Ask native to (pre)authorize camera access. On the web this is a no-op —
   * getUserMedia triggers the browser prompt directly.
   */
  requestCameraPermission(): void {
    post({ type: "requestCameraPermission" });
  },

  requestMicPermission(): void {
    post({ type: "requestMicPermission" });
  },

  /** Optional haptic feedback when running natively. */
  haptic(style: "light" | "medium" | "heavy" = "light"): void {
    post({ type: "haptic", payload: { style } });
  },
};
