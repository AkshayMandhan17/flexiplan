import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, Dimensions } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../components/AuthContext";
import { API_BASE_URL } from "../config";
import { login } from "../utils/api";


const primaryColor = "#0096F6"; 
const topColor = "#9dbfb6";

const { width, height } = Dimensions.get("window");
const scale = width / 375;

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
    setErrors({});

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
      const data = await login(username, password);
      setIsLoggedIn(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { backgroundColor: topColor }]}>
        <Text style={styles.title}>Login</Text>
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
              onPress={() => navigation.navigate("Signup")}
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
  title: {
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
  iconContainer: {
    marginRight: scaleSize(10),
  },
  loginButton: {
    backgroundColor: topColor,
    borderRadius: scaleSize(5),
    width: scaleSize(300),
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: scaleSize(15),
    alignItems: "center",
  },
  signupLink: {
    color: topColor,
    fontWeight: "bold",
    fontSize: scaleSize(16),
  },
});

export default LoginScreen;
