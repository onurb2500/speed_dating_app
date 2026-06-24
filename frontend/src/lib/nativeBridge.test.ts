import { describe, it, expect, vi, afterEach } from "vitest";
import { nativeBridge, isNativeWebView } from "@/lib/nativeBridge";

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).webkit;
});

describe("nativeBridge", () => {
  it("reports not-native on the plain web", () => {
    expect(isNativeWebView()).toBe(false);
  });

  it("is a no-op without a native handler", () => {
    expect(() => nativeBridge.notifyNavigation("/feed")).not.toThrow();
    expect(() => nativeBridge.haptic("light")).not.toThrow();
  });

  it("posts messages to the native handler when present", () => {
    const postMessage = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkit = { messageHandlers: { bridge: { postMessage } } };

    expect(isNativeWebView()).toBe(true);
    nativeBridge.notifyNavigation("/record");
    nativeBridge.requestCameraPermission();

    expect(postMessage).toHaveBeenCalledWith({
      type: "navigation",
      payload: { route: "/record" },
    });
    expect(postMessage).toHaveBeenCalledWith({
      type: "requestCameraPermission",
    });
  });
});
