import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getDB } from '../database';
import { authService } from '../authService';
import { userStatsService } from '../userStatsService';

const HomeScreen = ({ navigation }) => {
    const [todos, setTodos] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const isFocused = useIsFocused();

    // Load current user
    const loadCurrentUser = async () => {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
    };

    // Load todos from database for current user
    const loadTodos = async () => {
        try {
            const user = await authService.getCurrentUser();
            if (!user) return;

            const db = await getDB();
            const result = await db.getAllAsync(
                'SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC',
                [user.id]
            );
            setTodos(result);
        } catch (error) {
            console.log('Error loading todos', error);
        }
    };

    // Toggle todo completion status
    const toggleTodo = async (id, completed) => {
        try {
            const db = await getDB();
            await db.runAsync(
                'UPDATE todos SET completed = ? WHERE id = ?',
                [completed ? 0 : 1, id]
            );
            loadTodos();
        } catch (error) {
            console.log('Error updating todo', error);
        }
    };

    // Delete todo with confirmation
    const deleteTodo = (id) => {
        Alert.alert(
            'Delete Todo',
            'Are you sure you want to delete this todo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = await getDB();
                            await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
                            loadTodos();
                        } catch (error) {
                            console.log('Error deleting todo', error);
                        }
                    }
                }
            ]
        );
    };

    // Load user count
    const loadUserCount = async () => {
        const count = await userStatsService.getUserCount();
        setUserCount(count);
    };

    // Load data when screen focuses
    useEffect(() => {
        loadCurrentUser();
        loadTodos();
        loadUserCount();
    }, [isFocused]);

    // Render each todo item
    const renderItem = ({ item }) => (
        <View style={styles.todoItem}>
            <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => toggleTodo(item.id, item.completed)}
            >
                <Text style={[styles.todoText, item.completed && styles.completed]}>
                    {item.title}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(item.id)}
            >
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* User Stats Header */}
            {__DEV__ && (
                <View style={styles.statsHeader}>
                    <Text style={styles.statsText}>👥 {userCount} registered users</Text>
                </View>
            )}

            {todos.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No todos yet!</Text>
                </View>
            ) : (
                <FlatList
                    data={todos}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTodo')}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {__DEV__ && (
                <TouchableOpacity
                    style={styles.dbButton}
                    onPress={() => navigation.navigate('DatabaseViewer')}
                >
                    <Text style={styles.dbButtonText}>DB</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    statsHeader: {
        backgroundColor: '#e3f2fd',
        padding: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    statsText: {
        fontSize: 12,
        color: '#1976d2',
        fontWeight: '500',
    },
    list: {
        padding: 16,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 2,
    },
    todoText: {
        fontSize: 16,
        color: '#333',
    },
    completed: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#ff4444',
        borderRadius: 4,
    },
    deleteText: {
        color: 'white',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    addButtonText: {
        fontSize: 24,
        color: 'white',
    },
    dbButton: {
        position: 'absolute',
        left: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    dbButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreen;