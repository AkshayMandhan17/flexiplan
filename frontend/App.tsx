import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/components/TabNavigator';
import { AuthProvider, useAuth } from './src/components/AuthContext';
import RoutineSetupScreen from './src/screens/RoutineSetupScreen';
import ChatScreen from './src/screens/ChatScreen';
import UserHobbiesScreen from './src/screens/UserHobbiesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
          // **Ideal: Verify token validity with backend**
          // (You'll need to implement a "verify token" API endpoint)
          // const isValid = await verifyToken(accessToken); // Example

          // if (isValid) {
            setIsLoggedIn(true); // Set isLoggedIn to true if token is valid
          // } else {
          //   // Token is invalid or expired: Refresh it or redirect to login
          //   // (See next steps)
          //   setIsLoggedIn(false);
          //   await AsyncStorage.removeItem('access_token'); // Remove invalid token
          //   await AsyncStorage.removeItem('refresh_token'); // Remove refresh token (optional)
          // }
        } else {
          setIsLoggedIn(false); // Set isLoggedIn to false if no token found
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
        setIsLoggedIn(false); // Set isLoggedIn to false on error
      } finally {
        setLoading(false); // Set loading to false after token check
      }
    };

    loadAuthToken();
  }, [setIsLoggedIn]);

  if (loading) {
    // Show a loading indicator while checking the auth token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          title: 'FlexiPlan',
          headerLeft: () => null,
        }}
      >
        {isLoggedIn ? (
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
        {/* <Stack.Navigator
          screenOptions={{
            title: 'FlexiPlan',
            headerLeft: () => null,
          }}
        >
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="RoutineSetup" component={RoutineSetupScreen}/>
          <Stack.Screen name="ChatScreen" component={ChatScreen}/>
        </Stack.Navigator> */}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
