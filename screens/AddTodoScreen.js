import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDB } from '../database';
import { authService } from '../authService';

const AddTodoScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');

    const saveTodo = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a todo title');
            return;
        }

        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const db = await getDB();
            await db.runAsync(
                'INSERT INTO todos (userId, title, completed) VALUES (?, ?, ?)',
                [user.id, title.trim(), 0]
            );
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save todo');
            console.log('Error saving todo', error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter todo title"
                value={title}
                onChangeText={setTitle}
                autoFocus
            />
            <Button title="Save" onPress={saveTodo} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: 'white',
    },
});

export default AddTodoScreen;