// Simple test to verify database functionality
import { getDB } from './database.js';

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        const db = await getDB();
        console.log('Database connected successfully!');

        // Test inserting a record
        await db.runAsync('INSERT INTO todos (title, completed) VALUES (?, ?)', ['Test Todo', 0]);
        console.log('Test todo inserted');

        // Test reading records
        const todos = await db.getAllAsync('SELECT * FROM todos');
        console.log('Todos found:', todos);

        console.log('Database test completed successfully!');
    } catch (error) {
        console.error('Database test failed:', error);
    }
}

testDatabase();
