import React from "react";
import { X } from "lucide-react";

/**
 * Universal Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function when modal is closed
 * @param {string} title - Modal title/header text
 * @param {React.ReactNode} children - Modal content
 * @param {string} type - Alert type: 'info', 'success', 'warning', 'error', 'default'
 * @param {boolean} showCloseButton - Show/hide X button (default: true)
 * @param {boolean} closeOnOverlay - Close modal when clicking overlay (default: true)
 * @param {React.ReactNode} footer - Optional footer content (buttons, actions, etc.)
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'md')
 */
function Modal({
    isOpen,
    onClose,
    title,
    children,
    type = "default",
    showCloseButton = true,
    closeOnOverlay = true,
    footer,
    size = "md"
}) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    };

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    const typeColors = {
        default: "bg-gray-100 border-gray-300",
        info: "bg-blue-50 border-blue-300",
        success: "bg-green-50 border-green-300",
        warning: "bg-yellow-50 border-yellow-300",
        error: "bg-red-50 border-red-300"
    };

    const headerColors = {
        default: "bg-gray-200 text-gray-800",
        info: "bg-blue-200 text-blue-800",
        success: "bg-green-200 text-green-800",
        warning: "bg-yellow-200 text-yellow-800",
        error: "bg-red-200 text-red-800"
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-25 backdrop-blur-xs"
            onClick={handleOverlayClick}
        >
            <div 
                className={`relative w-full ${sizeClasses[size]} mx-4 bg-white shadow-2xl border-[1px] ${typeColors[type]} animate-fadeIn`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 ${headerColors[type]}`}>
                    <h2 className="text-xl font-bold">{title}</h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Pre-configured alert modals for common use cases
export function AlertModal({ isOpen, onClose, title, message, type = "info" }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            type={type}
            size="sm"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        OK
                    </button>
                </div>
            }
        >
            <p className="text-gray-700">{message}</p>
        </Modal>
    );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            type="warning"
            size="sm"
            closeOnOverlay={false}
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            }
        >
            <p className="text-gray-700">{message}</p>
        </Modal>
    );
}

export default Modal;
