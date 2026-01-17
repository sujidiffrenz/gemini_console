'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
    const { login, loading, error } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(username, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-background">
            {/* Background ambient glow */}
            <div
                className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-primary rounded-full blur-[150px] opacity-20 z-0 animate-pulse"
                style={{ animationDuration: '10s' }}
            ></div>

            <div className="glass-panel w-full max-w-[400px] p-xl rounded-lg relative z-10">
                <h1 className="text-[1.75rem] font-bold text-center mb-sm bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Gemini Console
                </h1>
                <p className="text-center text-text-muted text-sm mb-xl">
                    Enter your credentials to access the console
                </p>

                {error && (
                    <div className="text-error mb-4 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-md">
                    <div className="flex flex-col gap-xs">
                        <label htmlFor="username" className="text-sm text-text-muted font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-4 py-3 bg-black/20 border border-border rounded-md text-text-main transition-all duration-150 focus:border-primary focus:bg-black/30 focus:ring-2 focus:ring-primary/20"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-xs">
                        <label htmlFor="password" className="text-sm text-text-muted font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 bg-black/20 border border-border rounded-md text-text-main transition-all duration-150 focus:border-primary focus:bg-black/30 focus:ring-2 focus:ring-primary/20"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-sm p-3 bg-primary text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
