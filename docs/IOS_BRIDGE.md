# iOS Bridge Contract (MagicTextSDK WebView)

> **Status:** Deferred for this delivery. The web bundle is the source of truth
> and runs standalone in the browser. This document specifies the JS↔native
> contract so the native WebView wrapper can be wired up later (requires
> macOS/Xcode, not available in the current environment).

Reference SDK: [github.com/sughodke/MagicTextSDK](https://github.com/sughodke/MagicTextSDK)

## Architecture

The app ships as a **web bundle inside a native WebView container** for live
OTA updates. The native shell loads the deployed web app URL and exposes a
single message handler named `bridge`.

```
┌──────────────── iOS App (Swift) ────────────────┐
│  WKWebView  ──loads──▶  https://app.yourdomain   │
│     ▲  WKScriptMessageHandler "bridge"           │
│     │  evaluateJavaScript(...) for native→JS     │
└─────┼────────────────────────────────────────────┘
      │  window.webkit.messageHandlers.bridge.postMessage(msg)
┌─────┴──────────── Web bundle (this repo) ────────┐
│  src/lib/nativeBridge.ts                          │
└───────────────────────────────────────────────────┘
```

`src/lib/nativeBridge.ts` already implements the JS side with web fallbacks, so
no app code changes are needed when the native shell is added.

## JS → Native messages

All messages are posted to `window.webkit.messageHandlers.bridge`:

| `type`                    | `payload`                          | Native action |
|---------------------------|------------------------------------|---------------|
| `navigation`              | `{ route: string }`                | Update native chrome / analytics on route change |
| `requestCameraPermission` | —                                  | Trigger `AVCaptureDevice` camera authorization |
| `requestMicPermission`    | —                                  | Trigger microphone authorization |
| `haptic`                  | `{ style: "light"\|"medium"\|"heavy" }` | `UIImpactFeedbackGenerator` |

Example (already handled by `nativeBridge.notifyNavigation`):

```json
{ "type": "navigation", "payload": { "route": "/feed" } }
```

## Native → JS events

The native shell calls into JS via `evaluateJavaScript`. Recommended surface
to add when wiring up:

```ts
window.__nativeBridge = {
  onPermissionResult(kind: "camera" | "mic", granted: boolean): void,
  onAppResume(): void,   // re-check connectivity / refresh feed
  onBackPressed(): void, // hardware/edge back gesture
};
```

## Permissions flow

1. Web calls `nativeBridge.requestCameraPermission()` before `getUserMedia`.
2. Native presents the iOS permission dialog and authorizes the WebView.
3. Native calls `window.__nativeBridge.onPermissionResult("camera", granted)`.
4. Web proceeds with `getUserMedia` (the WebView inherits the grant).

On the plain web, steps 1–3 are no-ops and `getUserMedia` shows the browser
prompt directly — no code path differs.

## WKWebView configuration checklist (native side, later)

- `Info.plist`: `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`.
- `WKWebViewConfiguration.allowsInlineMediaPlayback = true`.
- `mediaTypesRequiringUserActionForPlayback = []` (allow muted autoplay).
- Register the `bridge` script message handler on the user content controller.
- Allow `getUserMedia` via `WKUIDelegate` media capture permission callback.
