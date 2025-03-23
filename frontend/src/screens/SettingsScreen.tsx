import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import UserHobbiesScreen from "./UserHobbiesScreen"; // Make sure this path is correct
import { useAuth } from "../components/AuthContext"; // Make sure this path is correct
import UserTasksScreen from "./UserTasksScreen"; // Make sure this path is correct
import LottieView from "lottie-react-native";
import FriendsScreen from "./FriendsScreen"; // Make sure this path is correct

const SettingsStack = createStackNavigator();

type RootStackParamList = {
  SettingsContent: undefined;
  UserHobbies: undefined;
  UserTasks: undefined;
  Login: undefined; //  Important if you navigate to Login on logout
  FriendsScreen: undefined;
};

type SettingsScreenContentNavigationProp = NavigationProp<
  RootStackParamList,
  "SettingsContent"
>;

// This is your main Settings screen component
const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenContentNavigationProp>();
  const [username, setUsername] = useState<string>("");
  const [isOffDay, setIsOffDay] = useState(false);
  const { setIsLoggedIn } = useAuth(); // Get setIsLoggedIn from AuthContext

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem("access_token");
              await AsyncStorage.removeItem("refresh_token");
              await AsyncStorage.removeItem("user_id");
              await AsyncStorage.removeItem("user_username");

              // Update AuthContext to indicate logout
              setIsLoggedIn(false);

              // Navigate to the Login screen.  This assumes you have a 'Login' route.
              navigation.navigate("Login");
            } catch (error) {
              console.error("Failed to log out:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const settings = [
    {
      id: "1",
      title: "View Hobbies",
      action: () => navigation.navigate("UserHobbies"),
    },
    {
      id: "2",
      title: "View Tasks",
      action: () => navigation.navigate("UserTasks"),
    },
    {
      id: "3",
      title: "View Saved Routines",
      action: () => console.log("View Saved Routines"), // Replace with actual navigation
    },
    {
      id: "4",
      title: "View Friends",
      action: () => navigation.navigate("FriendsScreen"),
    },
    {
      id: "5",
      title: "Update Username",
      action: () => console.log("Update Username"), //  Implement username update logic
    },
    {
      id: "6",
      title: "Change Password",
      action: () => console.log("Change Password"), // Implement password change logic
    },
    { id: "7", title: "Logout", action: handleLogout },
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("user_username");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Failed to fetch username from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageWrapper}>
          <LottieView
            source={require("../../lotties/User.json")} //  Double-check this path!
            autoPlay
            loop
            style={styles.lottie}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{username || "Loading..."}</Text>
      </View>

      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Off Day</Text>
            <Switch
              value={isOffDay}
              onValueChange={(value) => setIsOffDay(value)}
              thumbColor={isOffDay ? "#76c7c0" : "#ccc"}
              trackColor={{ false: "#e0e0e0", true: "#cceeea" }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.settingItem} onPress={item.action}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Wrapper component for the Settings stack navigator
const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsContent"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <SettingsStack.Screen
        name="UserHobbies"
        component={UserHobbiesScreen}
        options={{ title: "Hobbies" }}
      />
      <SettingsStack.Screen
        name="UserTasks"
        component={UserTasksScreen}
        options={{ title: "Tasks" }}
      />
      <SettingsStack.Screen
        name="FriendsScreen"
        component={FriendsScreen}
        options={{ title: "Friends" }}
      />
      {/* Add other screens related to settings here */}
    </SettingsStack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  profileImageWrapper: {
    position: "relative",
    alignItems: "center", // Center the LottieView
  },
  lottie: {
    width: 150,
    height: 150,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 4, // Add a shadow on Android
  },
  editText: {
    fontSize: 12,
    color: "#333",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
  },
});

export default SettingsStackScreen; // Export the Stack Navigator!