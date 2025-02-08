import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/components/TabNavigator';
import { AuthProvider, useAuth } from './src/components/AuthContext';
import RoutineSetupScreen from './src/screens/RoutineSetupScreen';
import ChatScreen from './src/screens/ChatScreen';
import UserHobbiesScreen from './src/screens/UserHobbiesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
        <Stack.Navigator
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
        </Stack.Navigator>
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
