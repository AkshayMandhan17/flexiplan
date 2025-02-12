import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, Dimensions, TextInput } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { signup } from "../utils/api";
import { KeyboardAvoidingView } from "react-native";
import { StatusBar } from "react-native";
import { useWindowDimensions, Image } from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { TouchableOpacity } from "react-native";

// Primary Color and topColor Adjustments
const primaryColor = "#0096F6"; // Primary Blue
const topColor = "#9dbfb6"; // Darkened color for the top part (darker for button and link)

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Assuming the base screen size is 375 (like iPhone 6)

// Helper function for scaling
const scaleSize = (size: number) => Math.round(size * scale);

const SignupScreen = ({ navigation }: any) => {
  const { width, height } = useWindowDimensions();
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
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle={"light-content"} />
      <Image
        style={{ position: "absolute", width, height }}
        source={require("../../assets/back1.jpg")}
        resizeMode="cover"
        blurRadius={3}
      />
      <View
        style={{
          position: "absolute",
          width,
          height,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 1,
        }}
      >
        <View style={{ justifyContent: "center", paddingHorizontal: 20, marginTop:height/15 }}>
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify().damping(3)}
            style={{
              width: width * 0.6,
              height: height * 0.15,
              alignSelf: "center",
              marginBottom: 30,
            }}
            source={require("../../assets/app-icon.png")}
            resizeMode="contain"
          />
          <Animated.Text
            entering={FadeInUp.duration(1000).springify()}
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
              marginBottom: 20,
              letterSpacing: 1,
            }}
          >
            Sign Up
          </Animated.Text>
        </View>

        <View style={styles.overlay}>
          <View style={styles.formContainer}>
            <Animated.View
              entering={FadeInDown.duration(1000).springify()}
              style={{
                marginBottom: 15,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 15,
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3,
              }}
            >
              <View
                style={{
                  alignItems: 'center',  
                  justifyContent: 'center', 
                  alignSelf: 'center',
                  width: 50,  
                  height: 50, 
                  marginLeft:-15,
                }}
              >
                <Icon name="user" type="font-awesome" color="white" size={24} />
              </View>

              <TextInput
                placeholder="Username"
                placeholderTextColor="white"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={{ color: 'white', fontSize: 18, flex: 1 }}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).springify()}
              style={{
                marginBottom: 15,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 15,
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3,
              }}
            >
              <View
                style={{
                  alignItems: 'center',  
                  justifyContent: 'center', 
                  alignSelf: 'center',
                  width: 50,  
                  height: 50, 
                  marginLeft:-15,
                }}
              >
                <Icon name="envelope" type="font-awesome" color="white" size={20} />
              </View>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor={"white"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={{ color: 'white', fontSize: 18, flex: 1 }}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).springify()}
              style={{
                marginBottom: 15,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 15,
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 3,
              }}
            >
              <View
                style={{
                  alignItems: 'center',  
                  justifyContent: 'center', 
                  alignSelf: 'center',
                  width: 50,  
                  height: 50, 
                  marginLeft:-15,
                }}
              >
                <Icon name="lock" type="font-awesome" color="white" size={26} />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor={"white"}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                style={{ color: 'white', fontSize: 18, flex: 1 }}
              />
            </Animated.View>

            {genericError ? (
              <Text style={styles.genericError}>{genericError}</Text>
            ) : null}

            <Animated.View
              entering={FadeInDown.delay(600).duration(1000).springify()}
            >
              <TouchableOpacity onPress={handleSignup} style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View
              entering={FadeInDown.delay(800).duration(1000).springify()}
              style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', }}
            >
              <Text style={{ color: 'white', fontSize:16, fontWeight: 'bold' }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    marginRight: scaleSize(20),
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
    color: 'rgb(255, 144, 70)',
    fontWeight: "bold",
    fontSize: scaleSize(16),
  },
  genericError: {
    color: "red",
    marginBottom: scaleSize(20),
    fontSize: scaleSize(15),
  },
  button: {
    backgroundColor: "rgba(197, 110, 50, 0.9)",
    padding: 15,
    paddingHorizontal:60,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
  },
});

export default SignupScreen;