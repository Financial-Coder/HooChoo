'use client';

import { useEffect } from 'react';
import Button from './Button';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = '확인',
    message,
    confirmText = '확인',
    cancelText = '취소',
}: ConfirmDialogProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && (
                        <h2 className="text-lg font-semibold text-foreground mb-2">
                            {title}
                        </h2>
                    )}
                    <p className="text-muted-foreground mb-6">{message}</p>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
