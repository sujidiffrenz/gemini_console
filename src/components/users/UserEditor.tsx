'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../../types';
import { userService } from '../../services/user.service';

interface UserEditorProps {
    initialData?: User;
    isEditing?: boolean;
    userId?: string | number;
}

export default function UserEditor({ initialData, isEditing = false, userId }: UserEditorProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [role, setRole] = useState('user');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setUserName(initialData.user_name);
            setEmail(initialData.email || '');
            setRole(initialData.role || 'user');
        } else if (isEditing && userId) {
            loadUser();
        }
    }, [initialData, isEditing, userId]);

    const loadUser = async () => {
        setLoading(true);
        try {
            const user = await userService.getById(String(userId));
            if (user) {
                setUserName(user.user_name);
                setEmail(user.email || '');
                setRole(user.role || 'user');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            alert('Error loading user');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: Partial<User> = {
            user_name: userName,
            email,
            role,
            isActive: true, // Always true as per requirement
        };

        if (!isEditing) {
            // Create user: Password is required and must match confirmation
            if (!password || password !== confirmPassword) {
                alert('Passwords do not match or are empty');
                setSaving(false);
                return;
            }
            payload.password = password;
        } else if (changePasswordMode) {
            // Edit user: Only update password if mode is active
            if (!password || password !== confirmPassword) {
                alert('New passwords do not match or are empty');
                setSaving(false);
                return;
            }
            payload.password = password;
        }

        try {
            if (isEditing && userId) {
                await userService.update(userId, payload);
            } else {
                await userService.create(payload);
            }
            router.push('/dashboard/users');
            router.refresh();
        } catch (error) {
            console.error('Failed to save user', error);
            alert('Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-text-muted transition-all duration-300">Loading user data...</div>;
    }

    return (
        <div className="glass-panel p-4 sm:p-8 w-[95vw] lg:w-[75vw] xl:w-[60vw] mx-auto border border-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Username</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="johndoe"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="font-medium text-text-muted">
                            {isEditing ? 'New Password' : 'Password'}
                        </label>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setChangePasswordMode(!changePasswordMode);
                                    if (changePasswordMode) {
                                        setPassword('');
                                        setConfirmPassword('');
                                    }
                                }}
                                className={`text-sm font-medium transition-colors ${changePasswordMode ? 'text-error hover:text-error/80' : 'text-primary hover:text-primary-hover'}`}
                            >
                                {changePasswordMode ? 'Cancel Change' : 'Change Password'}
                            </button>
                        )}
                    </div>

                    {(!isEditing || changePasswordMode) && (
                        <div className="flex flex-col gap-4 p-4 border border-border rounded-md bg-white/50 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isEditing || changePasswordMode}
                                className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder={isEditing ? "New Password" : "Password"}
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required={!isEditing || changePasswordMode}
                                className={`p-3 rounded-md border bg-white text-text-main w-full focus:outline-none focus:ring-1 transition-all ${confirmPassword && password !== confirmPassword
                                    ? 'border-error/50 focus:border-error focus:ring-error text-error'
                                    : 'border-border focus:ring-primary/20'
                                    }`}
                                placeholder="Confirm Password"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-error font-medium animate-in fade-in slide-in-from-top-1">Passwords do not match</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-medium text-text-muted">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="p-3 rounded-md border border-border bg-white text-text-main w-full focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    >
                        <option value="user" className="bg-surface">User</option>
                        <option value="admin" className="bg-surface">Admin</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-6 py-3 rounded-md border border-border bg-transparent text-text-main cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3 rounded-md border-none bg-primary text-white cursor-pointer font-semibold transition-all disabled:opacity-70 hover:bg-primary-hover shadow-lg shadow-primary/20"
                    >
                        {saving ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </form>
        </div>
    );
}
