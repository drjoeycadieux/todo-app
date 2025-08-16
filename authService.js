import { getDB } from './database';
import * as SecureStore from 'expo-secure-store';

// Simple password hashing (in production, use a proper library like bcrypt)
const hashPassword = (password) => {
    // This is a simple hash for demo purposes
    // In production, use proper hashing like bcrypt or Expo Crypto
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
};

export const authService = {
    // Register a new user
    register: async (username, email, password) => {
        try {
            const db = await getDB();

            // Check if user already exists
            const existingUser = await db.getFirstAsync(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser) {
                return {
                    success: false,
                    error: 'Username or email already exists'
                };
            }

            // Hash password
            const hashedPassword = hashPassword(password);

            // Insert new user
            const result = await db.runAsync(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );

            const user = {
                id: result.lastInsertRowId,
                username,
                email
            };

            // Store user session
            await SecureStore.setItemAsync('currentUser', JSON.stringify(user));

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed'
            };
        }
    },

    // Login user
    login: async (username, password) => {
        try {
            const db = await getDB();

            // Hash the provided password
            const hashedPassword = hashPassword(password);

            // Find user
            const user = await db.getFirstAsync(
                'SELECT * FROM users WHERE username = ? AND password = ?',
                [username, hashedPassword]
            );

            if (!user) {
                return {
                    success: false,
                    error: 'Invalid username or password'
                };
            }

            // Store user session
            const userSession = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            await SecureStore.setItemAsync('currentUser', JSON.stringify(userSession));

            return {
                success: true,
                user: userSession
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed'
            };
        }
    },

    // Logout user
    logout: async () => {
        try {
            await SecureStore.deleteItemAsync('currentUser');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const userStr = await SecureStore.getItemAsync('currentUser');
            if (userStr) {
                return JSON.parse(userStr);
            }
            return null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn: async () => {
        const user = await authService.getCurrentUser();
        return user !== null;
    }
};
