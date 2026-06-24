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
    <Modal open={open} onClose={onRetry} title="Precisamos da câmera 🎥">
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted">
        <li>Toque no ícone de cadeado na barra do navegador.</li>
        <li>Ative as permissões de Câmera e Microfone.</li>
        <li>Recarregue e tente novamente.</li>
      </ol>
      <Button className="w-full" onClick={onRetry}>
        Tentar de novo
      </Button>
    </Modal>
  );
}
