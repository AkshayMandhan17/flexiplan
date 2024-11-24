import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, Dimensions } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../components/AuthContext";
// Primary Color and topColor Adjustments
const primaryColor = "#0096F6"; // Primary Blue
const topColor = "#9dbfb6"; // Darkened color for the top part (darker for button and link)

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Assuming the base screen size is 375 (like iPhone 6)

// Helper function for scaling
const scaleSize = (size: number) => Math.round(size * scale);

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const { setIsLoggedIn } = useAuth();

  const handleLogin = async () => {
    // Reset errors
    setErrors({});

    // Validation
    let formErrors = {};
    if (!username)
      formErrors = { ...formErrors, username: "Username is required" };
    if (!password)
      formErrors = { ...formErrors, password: "Password is required" };

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch("http://192.168.100.21:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Save the user data in AsyncStorage
        await AsyncStorage.setItem("access_token", data.access);
        await AsyncStorage.setItem("refresh_token", data.refresh);
        await AsyncStorage.setItem("user_username", data.user.username);
        setIsLoggedIn(true);
        // Navigate to HomeScreen after login
        navigation.replace("RoutineSetup"); // Replaces the current screen with Home
      } else {
        Alert.alert("Error", data.error || "Invalid credentials!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Color Section */}
      <View style={[styles.topSection, { backgroundColor: topColor }]}>
        <Text style={styles.title}>Login</Text>
      </View>

      {/* White Overlay with Form */}
      <View style={styles.overlay}>
        <View style={styles.formContainer}>
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            errorMessage={errors.username}
            containerStyle={styles.inputContainer}
            leftIcon={
              <Icon
                name="user"
                type="font-awesome"
                color="#666"
                size={scaleSize(24)}
              />
            }
            leftIconContainerStyle={styles.iconContainer}
          />

          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            errorMessage={errors.password}
            containerStyle={styles.inputContainer}
            leftIcon={
              <Icon
                name="lock"
                type="font-awesome"
                color="#666"
                size={scaleSize(24)}
              />
            }
            leftIconContainerStyle={styles.iconContainer}
          />

          <Button
            title="Log In"
            buttonStyle={styles.loginButton}
            onPress={handleLogin}
          />

          <View style={styles.signupContainer}>
            <Text>Don't have an account? </Text>
            <Button
              title="Sign Up"
              type="clear"
              titleStyle={styles.signupLink}
              onPress={() => navigation.navigate("Signup")} // Navigate to Signup screen
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: topColor,
  },
  topSection: {
    height: "30%", // Takes up the top 30% of the screen
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: scaleSize(30),
    fontWeight: "bold",
    color: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // White overlay with slight transparency
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: scaleSize(20),
  },
  formContainer: {
    marginTop: scaleSize(40),
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: scaleSize(15),
  },
  iconContainer: {
    marginRight: scaleSize(10), // Space between icon and input field
  },
  loginButton: {
    backgroundColor: topColor, // Darker button color
    borderRadius: scaleSize(5),
    width: scaleSize(300),
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: scaleSize(15),
    alignItems: "center", // Align text and button
  },
  signupLink: {
    color: topColor, // Darker color for the signup link
    fontWeight: "bold",
    fontSize: scaleSize(16),
  },
});

export default LoginScreen;
