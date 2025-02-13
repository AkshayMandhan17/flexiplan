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
import { IntroductionAnimationScreen } from './src/introduction_animation';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  
  useEffect(() => {
    const checkIntroductionScreen = async () => {
      try {
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        if (!hasSeenIntro) {
          setShowIntro(true);
        }
      } catch (error) {
        console.error('Error checking introduction screen:', error);
      }
    };

    const loadAuthToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
            setIsLoggedIn(true); 
        } else {
          setIsLoggedIn(false); 
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkIntroductionScreen();
    loadAuthToken();
  }, [setIsLoggedIn, setShowIntro]);

  if (loading) {
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
          headerShown: false,
        }}
      >
        {/* {showIntro ? (
          <Stack.Screen
            name="onBoarding"
            component={IntroductionAnimationScreen}
            options={{ headerShown: false }}
            listeners={{
              focus: async () => {
                await AsyncStorage.setItem('hasSeenIntro', 'true');
                setShowIntro(false);
              },
            }}
          />
        ) :  */}
          {isLoggedIn ? (
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
          ) : (
            <>
              <Stack.Screen
                name="onBoarding"
                component={IntroductionAnimationScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
            </>
          )}
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
