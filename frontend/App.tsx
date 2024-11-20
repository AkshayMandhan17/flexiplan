import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignupScreen from "../frontend/src/screens/SignupScreen"; // Example import for the Signup screen
import LoginScreen from "../frontend/src/screens/LoginScreen"; // Example import for the Login screen
import HomeScreen from "./src/screens/HomeScreen";
// Other imports...

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          title: "FlexiPlan", // Set static title for all screens
          headerLeft: () => null, // Remove back button globally
        }}
      >
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
