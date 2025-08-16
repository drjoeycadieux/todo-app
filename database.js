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