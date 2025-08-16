import { getDB } from './database';

// User statistics service
export const userStatsService = {
    // Get total number of registered users
    getUserCount: async () => {
        try {
            const db = await getDB();
            const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');
            return result.count;
        } catch (error) {
            console.error('Error getting user count:', error);
            return 0;
        }
    },

    // Get all users (without passwords)
    getAllUsers: async () => {
        try {
            const db = await getDB();
            const users = await db.getAllAsync('SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC');
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    // Get user registration statistics
    getUserStats: async () => {
        try {
            const db = await getDB();

            // Total users
            const totalUsers = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');

            // Users registered today
            const today = new Date().toISOString().split('T')[0];
            const todayUsers = await db.getFirstAsync(
                'SELECT COUNT(*) as count FROM users WHERE DATE(createdAt) = ?',
                [today]
            );

            // Users registered this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const weekUsers = await db.getFirstAsync(
                'SELECT COUNT(*) as count FROM users WHERE createdAt >= ?',
                [weekAgo.toISOString()]
            );

            // Most recent user
            const recentUser = await db.getFirstAsync(
                'SELECT username, createdAt FROM users ORDER BY createdAt DESC LIMIT 1'
            );

            return {
                totalUsers: totalUsers.count,
                todayUsers: todayUsers.count,
                weekUsers: weekUsers.count,
                recentUser: recentUser,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                totalUsers: 0,
                todayUsers: 0,
                weekUsers: 0,
                recentUser: null,
                lastUpdated: new Date().toISOString()
            };
        }
    },

    // Get user with their todo count
    getUsersWithTodoCounts: async () => {
        try {
            const db = await getDB();
            const result = await db.getAllAsync(`
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.createdAt,
                    COUNT(t.id) as todoCount,
                    COUNT(CASE WHEN t.completed = 1 THEN 1 END) as completedTodos,
                    COUNT(CASE WHEN t.completed = 0 THEN 1 END) as pendingTodos
                FROM users u
                LEFT JOIN todos t ON u.id = t.userId
                GROUP BY u.id, u.username, u.email, u.createdAt
                ORDER BY u.createdAt DESC
            `);
            return result;
        } catch (error) {
            console.error('Error getting users with todo counts:', error);
            return [];
        }
    }
};
