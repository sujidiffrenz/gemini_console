'use client';

import React from 'react';

export default function Header({ title = "", onMenuClick }: { title?: string, onMenuClick?: () => void }) {
    return (
        <header className="h-[5px] flex items-center justify-between px-4 sm:px-xl bg-surface/80 backdrop-blur-[10px] sticky top-0 z-40 border-b border-border">
            <div className="flex items-center gap-4">
                {title && <h2 className="text-lg sm:text-xl font-semibold text-text-main truncate max-w-[200px] sm:max-w-none">{title}</h2>}
            </div>

            <div className="flex items-center gap-lg">
                {/* Actions could go here */}
            </div>
        </header>
    );
}
