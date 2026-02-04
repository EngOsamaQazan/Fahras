import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const maxWidth = {
    sm: "400px",
    md: "600px",
    lg: "800px",
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
      style={{ maxWidth: maxWidth[size] }}
    >
      <article>
        <header>
          <strong>{title}</strong>
          <button
            type="button"
            className="secondary btn-sm"
            onClick={onClose}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </header>
        <div style={{ padding: "var(--spacing-md)" }}>{children}</div>
        {footer && <footer>{footer}</footer>}
      </article>
    </dialog>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "primary",
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className={variant}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
