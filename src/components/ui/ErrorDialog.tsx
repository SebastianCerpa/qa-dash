'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface ErrorDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    okButtonText?: string;
}

export function ErrorDialog({
    open,
    onClose,
    title = 'Error',
    message,
    okButtonText = 'OK'
}: ErrorDialogProps) {
    React.useEffect(() => {
        // Ensure we're on the client side
        if (typeof document !== 'undefined') {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            if (open) {
                document.addEventListener('keydown', handleEscape);
                document.body.style.overflow = 'hidden';
            }

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = 'unset';
            };
        }
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="z-50 w-full max-w-md rounded-lg border bg-card p-4 shadow-lg sm:p-6 md:w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {okButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorDialog;
