import { getDB } from './database';
import { authService } from './authService';

export const addTodo = async (title) => {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return { success: false, error: 'User not logged in' };

        const db = await getDB();
        const result = await db.runAsync(
            'INSERT INTO todos (userId, title, completed) VALUES (?, ?, 0)',
            [user.id, title]
        );
        return { success: true, result };
    } catch (error) {
        console.log('Error adding todo', error);
        return { success: false, error };
    }
};

export const getTodos = async () => {
    try {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const db = await getDB();
        const result = await db.getAllAsync(
            'SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC',
            [user.id]
        );
        return result;
    } catch (error) {
        console.log('Error getting todos', error);
        return [];
    }
};

export const updateTodoStatus = async (id, completed) => {
    try {
        const db = await getDB();
        const result = await db.runAsync(
            'UPDATE todos SET completed = ? WHERE id = ?',
            [completed ? 1 : 0, id]
        );
        return { success: true, result };
    } catch (error) {
        console.log('Error updating todo', error);
        return { success: false, error };
    }
};

export const deleteTodo = async (id) => {
    try {
        const db = await getDB();
        const result = await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
        return { success: true, result };
    } catch (error) {
        console.log('Error deleting todo', error);
        return { success: false, error };
    }
};