import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Alert
} from 'react-native';
import { getDB, resetDatabase } from '../database';

const DatabaseViewerScreen = ({ navigation }) => {
    const [dbData, setDbData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [tableInfo, setTableInfo] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Load database data
    const loadDatabaseData = async () => {
        try {
            const db = await getDB();

            // Get all todos
            const todos = await db.getAllAsync('SELECT * FROM todos ORDER BY id DESC');
            setDbData(todos);

            // Get all users (without passwords for security)
            const users = await db.getAllAsync('SELECT id, username, email, createdAt FROM users ORDER BY id DESC');
            setUserData(users);
            setUserCount(users.length);

            // Get table schema information
            const schema = await db.getAllAsync('PRAGMA table_info(todos)');
            setTableInfo(schema);

            console.log('Database data loaded - Todos:', todos.length, 'Users:', users.length);
        } catch (error) {
            console.error('Error loading database data:', error);
            Alert.alert('Error', 'Failed to load database data');
        }
    };

    // Clear all data
    const clearAllData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete ALL todos? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = await getDB();
                            await db.runAsync('DELETE FROM todos');
                            loadDatabaseData();
                            Alert.alert('Success', 'All data cleared');
                        } catch (error) {
                            console.error('Error clearing data:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    }
                }
            ]
        );
    };

    // Refresh data
    const onRefresh = async () => {
        setRefreshing(true);
        await loadDatabaseData();
        setRefreshing(false);
    };

    useEffect(() => {
        loadDatabaseData();
    }, []);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Database Viewer</Text>
                <Text style={styles.subtitle}>todos.db</Text>
            </View>

            {/* Table Schema */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Table Schema</Text>
                <View style={styles.schemaContainer}>
                    {tableInfo.map((column, index) => (
                        <View key={index} style={styles.schemaRow}>
                            <Text style={styles.columnName}>{column.name}</Text>
                            <Text style={styles.columnType}>{column.type}</Text>
                            {column.pk === 1 && <Text style={styles.primaryKey}>PK</Text>}
                            {column.notnull === 1 && <Text style={styles.notNull}>NOT NULL</Text>}
                        </View>
                    ))}
                </View>
            </View>

            {/* Data Count */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Database Statistics</Text>
                <Text style={styles.recordCount}>📝 Total Todos: {dbData.length}</Text>
                <Text style={styles.recordCount}>👥 Registered Users: {userCount}</Text>
            </View>

            {/* Data Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data</Text>
                {dbData.length === 0 ? (
                    <Text style={styles.noData}>No data in database</Text>
                ) : (
                    <View style={styles.tableContainer}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ID</Text>
                            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Title</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Complete</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Created</Text>
                        </View>

                        {/* Table Rows */}
                        {dbData.map((row, index) => (
                            <View key={row.id} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
                                <Text style={[styles.tableCell, { flex: 1 }]}>{row.id}</Text>
                                <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={2}>
                                    {row.title}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 1 }]}>
                                    {row.completed ? '✓' : '✗'}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Users Table */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registered Users</Text>
                {userData.length === 0 ? (
                    <Text style={styles.noData}>No users registered</Text>
                ) : (
                    <View style={styles.tableContainer}>
                        {/* Users Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ID</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Username</Text>
                            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Email</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Registered</Text>
                        </View>

                        {/* Users Table Rows */}
                        {userData.map((user, index) => (
                            <View key={user.id} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
                                <Text style={[styles.tableCell, { flex: 1 }]}>{user.id}</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                                    {user.username}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={1}>
                                    {user.email}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.refreshButton} onPress={loadDatabaseData}>
                    <Text style={styles.buttonText}>Refresh Data</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
                    <Text style={styles.buttonText}>Clear All Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                        Alert.alert(
                            'Reset Database',
                            'This will completely reset the database and all data will be lost. Continue?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset',
                                    style: 'destructive',
                                    onPress: async () => {
                                        const success = await resetDatabase();
                                        if (success) {
                                            Alert.alert('Success', 'Database reset successfully');
                                            loadDatabaseData();
                                        } else {
                                            Alert.alert('Error', 'Failed to reset database');
                                        }
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.buttonText}>Reset Database</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.8,
    },
    section: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    schemaContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    schemaRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    columnName: {
        flex: 2,
        fontWeight: 'bold',
        color: '#333',
    },
    columnType: {
        flex: 2,
        color: '#666',
    },
    primaryKey: {
        backgroundColor: '#4CAF50',
        color: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 10,
        marginLeft: 5,
    },
    notNull: {
        backgroundColor: '#FF9800',
        color: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 10,
        marginLeft: 5,
    },
    recordCount: {
        fontSize: 16,
        color: '#666',
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 12,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    evenRow: {
        backgroundColor: '#f9f9f9',
    },
    tableCell: {
        color: '#333',
        fontSize: 12,
    },
    noData: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        padding: 20,
    },
    actions: {
        padding: 20,
        gap: 10,
    },
    refreshButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: '#9C27B0',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default DatabaseViewerScreen;
