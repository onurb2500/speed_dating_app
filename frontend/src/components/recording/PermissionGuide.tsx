"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/** Shown when camera/mic permission is denied, with steps to re-enable. */
export function PermissionGuide({
  open,
  onRetry,
}: {
  open: boolean;
  onRetry: () => void;
}) {
  return (
    <Modal open={open} onClose={onRetry} title="We need your camera">
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-onDarkSoft/70">
        <li>Tap the lock icon in the browser bar.</li>
        <li>Enable Camera and Microphone permissions.</li>
        <li>Reload and try again.</li>
      </ol>
      <Button className="w-full" onClick={onRetry}>
        Try again
      </Button>
    </Modal>
  );
}
