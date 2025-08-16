import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { authService } from './authService';

// Authentication screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Main app screens
import HomeScreen from './screens/HomeScreen';
import AddTodoScreen from './screens/AddTodoScreen';
import DatabaseViewerScreen from './screens/DatabaseViewerScreen';

const Stack = createStackNavigator();

// Authentication Stack
const AuthStack = ({ onLogin }) => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
    <Stack.Screen name="Register">
      {(props) => <RegisterScreen {...props} onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

// Main App Stack
const AppStack = ({ user, onLogout }) => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: `Welcome, ${user?.username || 'User'}`,
        headerRight: () => (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    />
    <Stack.Screen
      name="AddTodo"
      component={AddTodoScreen}
      options={{ title: 'Add New Todo' }}
    />
    {__DEV__ && (
      <Stack.Screen
        name="DatabaseViewer"
        component={DatabaseViewerScreen}
        options={{ title: 'Database Viewer' }}
      />
    )}
  </Stack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack user={user} onLogout={handleLogout} />
      ) : (
        <AuthStack onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logoutButton: {
    marginRight: 15,
    padding: 5,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
});