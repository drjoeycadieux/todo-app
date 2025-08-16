import * as SQLite from 'expo-sqlite';

let db = null;

export const getDB = async () => {
    if (db === null) {
        try {
            db = await SQLite.openDatabaseAsync('todos.db');

            // Create the users table
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Check if todos table exists and has userId column
            const tableInfo = await db.getAllAsync('PRAGMA table_info(todos)');
            const hasUserIdColumn = tableInfo.some(column => column.name === 'userId');

            if (!hasUserIdColumn && tableInfo.length > 0) {
                // Existing table without userId - we need to migrate
                console.log('Migrating existing todos table...');

                // Rename old table
                await db.execAsync('ALTER TABLE todos RENAME TO todos_old');

                // Create new table with userId
                await db.execAsync(`
                    CREATE TABLE todos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL DEFAULT 1,
                        title TEXT NOT NULL,
                        completed INTEGER DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (userId) REFERENCES users (id)
                    );
                `);

                // Copy data from old table (assign all todos to user ID 1)
                await db.execAsync(`
                    INSERT INTO todos (id, userId, title, completed, createdAt)
                    SELECT id, 1, title, completed, createdAt FROM todos_old
                `);

                // Drop old table
                await db.execAsync('DROP TABLE todos_old');

                console.log('Database migration completed');
            } else if (tableInfo.length === 0) {
                // Create new table
                await db.execAsync(`
                    CREATE TABLE todos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL,
                        title TEXT NOT NULL,
                        completed INTEGER DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (userId) REFERENCES users (id)
                    );
                `);
            }

            console.log('Database and table created successfully');
        } catch (error) {
            console.error('Error setting up database:', error);
        }
    }
    return db;
};

// Helper function to reset database (for testing)
export const resetDatabase = async () => {
    try {
        const database = await getDB();
        await database.execAsync('DROP TABLE IF EXISTS todos');
        await database.execAsync('DROP TABLE IF EXISTS users');

        // Reset db reference to force recreation
        db = null;

        // Recreate tables
        await getDB();

        console.log('Database reset successfully');
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        return false;
    }
};

// Get database file path and info for external viewing
export const getDatabaseInfo = async () => {
    try {
        const database = await getDB();

        // Try multiple methods to get database path
        let dbPath = 'Database path not directly accessible';

        // Method 1: Check if path is accessible via _db
        if (database._db?.path) {
            dbPath = database._db.path;
        }
        // Method 2: Try to get from database object
        else if (database.databaseName) {
            dbPath = `App Documents/${database.databaseName}`;
        }
        // Method 3: Default Expo path info
        else {
            dbPath = 'Stored in app internal storage: todos.db';
        }

        // Get platform-specific information
        const Platform = require('react-native').Platform;
        let platformInfo = '';

        if (Platform.OS === 'android') {
            platformInfo = 'Android: /data/data/com.yourname.securetodo/databases/todos.db';
        } else if (Platform.OS === 'ios') {
            platformInfo = 'iOS: App Documents folder/todos.db';
        } else {
            platformInfo = 'Platform: ' + Platform.OS;
        }

        // Get table information
        const tables = await database.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

        // Get database size info
        const userCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM users');
        const todoCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM todos');

        // Get database file size (approximate)
        const totalRecords = userCount.count + todoCount.count;
        const estimatedSizeKB = Math.max(1, Math.ceil(totalRecords * 0.5)); // Rough estimate

        return {
            path: dbPath,
            platformPath: platformInfo,
            tables: tables.map(t => t.name),
            stats: {
                users: userCount.count,
                todos: todoCount.count,
                totalRecords: totalRecords,
                estimatedSizeKB: estimatedSizeKB
            },
            filename: 'todos.db'
        };
    } catch (error) {
        console.error('Error getting database info:', error);
        return {
            path: 'Unknown',
            platformPath: 'Unknown platform',
            tables: [],
            stats: { users: 0, todos: 0, totalRecords: 0, estimatedSizeKB: 0 },
            filename: 'todos.db'
        };
    }
};// Export database as SQL dump (for backup/viewing)
export const exportDatabaseAsSQL = async () => {
    try {
        const database = await getDB();

        let sqlDump = '-- SQLite Database Export\n';
        sqlDump += '-- Generated on: ' + new Date().toISOString() + '\n\n';

        // Export table schemas
        const tables = await database.getAllAsync("SELECT sql FROM sqlite_master WHERE type='table' ORDER BY name");
        tables.forEach(table => {
            if (table.sql) {
                sqlDump += table.sql + ';\n\n';
            }
        });

        // Export users data (without passwords for security)
        sqlDump += '-- Users Data\n';
        const users = await database.getAllAsync('SELECT id, username, email, createdAt FROM users');
        users.forEach(user => {
            sqlDump += `INSERT INTO users (id, username, email, createdAt) VALUES (${user.id}, '${user.username}', '${user.email}', '${user.createdAt}');\n`;
        });
        sqlDump += '\n';

        // Export todos data
        sqlDump += '-- Todos Data\n';
        const todos = await database.getAllAsync('SELECT * FROM todos');
        todos.forEach(todo => {
            sqlDump += `INSERT INTO todos (id, userId, title, completed, createdAt) VALUES (${todo.id}, ${todo.userId}, '${todo.title.replace(/'/g, "''")}', ${todo.completed}, '${todo.createdAt}');\n`;
        });

        return sqlDump;
    } catch (error) {
        console.error('Error exporting database:', error);
        return null;
    }
};