import { newAxiosInstance } from './apiClient';
import { LoginResponse } from '../types';
import { configKeys } from '../configKeys';

export const authService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            // Standardizing on newAxiosInstance
            const response = await newAxiosInstance.post<LoginResponse>('/api/login', formData.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = response.data;
            if (data.access_token) {
                this.setToken(data.access_token);
            }
            return data;
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                throw new Error('Incorrect username or password');
            }
            throw error;
        }
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
    },

    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
        }
    },

    isAuthenticated() {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('access_token');
        }
        return false;
    }
};
