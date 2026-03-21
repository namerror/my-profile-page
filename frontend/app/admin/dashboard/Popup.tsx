'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface PopupProps {
    title: string;
    subtitle?: string;
    onClose?: () => void;
    children: React.ReactNode;
}

export default function Popup({ title, subtitle, onClose, children }: PopupProps) {
    const [mounted, setMounted] = useState(false);
    const portalRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        portalRef.current = el;
        setMounted(true);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prevOverflow;
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
            portalRef.current = null;
        };
    }, []);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) onClose();
    }, [onClose]);

    if (!mounted || !portalRef.current) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="border-b border-slate-100 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>,
        portalRef.current
    );
}
