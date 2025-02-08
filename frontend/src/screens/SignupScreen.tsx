import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, Dimensions } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { signup } from "../utils/api";

// Primary Color and topColor Adjustments
const primaryColor = "#0096F6"; // Primary Blue
const topColor = "#9dbfb6"; // Darkened color for the top part (darker for button and link)

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Assuming the base screen size is 375 (like iPhone 6)

// Helper function for scaling
const scaleSize = (size: number) => Math.round(size * scale);

const SignupScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [genericError, setGenericError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    return re.test(password);
  };

  const handleSignup = async () => {
    // Reset errors
    setErrors({});
    setGenericError("");

    // Validation
    let formErrors: any = {};
    if (!username) formErrors.username = "Username is required";
    if (!email) {
      formErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      formErrors.email = "Invalid email address";
    }
    if (!password) {
      formErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      formErrors.password =
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await signup(username, email, password);
      if (response) {
        navigation.navigate("Login");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { backgroundColor: topColor }]}>
        <Text style={styles.topText}>Sign Up</Text>
      </View>

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
            placeholder="Email Address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            errorMessage={errors.email}
            containerStyle={styles.inputContainer}
            leftIcon={
              <Icon
                name="envelope"
                type="font-awesome"
                color="#666"
                size={scaleSize(20)}
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
                size={scaleSize(26)}
              />
            }
            leftIconContainerStyle={styles.iconContainer}
          />

          {genericError ? (
            <Text style={styles.genericError}>{genericError}</Text>
          ) : null}

          <Button
            title="Sign Up"
            buttonStyle={styles.signupButton}
            onPress={handleSignup}
          />

          <View style={styles.loginContainer}>
            <Text>Already have an account? </Text>
            <Button
              title="Login"
              type="clear"
              titleStyle={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
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
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  topText: {
    fontSize: scaleSize(30),
    fontWeight: "bold",
    color: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: scaleSize(10),
  },
  signupButton: {
    backgroundColor: topColor,
    borderRadius: scaleSize(5),
    width: scaleSize(300),
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: scaleSize(15),
    alignItems: "center",
  },
  loginLink: {
    color: topColor,
    fontWeight: "bold",
    fontSize: scaleSize(16),
  },
  genericError: {
    color: "red",
    marginBottom: scaleSize(20),
    fontSize: scaleSize(15),
  },
});

export default SignupScreen;