import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Switch,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { Checkbox } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
// import { Ionicons } from "@expo/vector-icons";
import Feather from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Dimensions } from "react-native";
import { RoutineData, UserRoutineResponse } from "../utils/model";
import {
  fetchUserRoutines,
  generateRoutine,
  markActivityCompleted,
  updateRoutine,
  uploadUserPfp,
  fetchPublicUserDetails,
} from "../utils/api";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useAuth } from "../components/AuthContext"; // Make sure this path is correct
import FriendsScreen from "./FriendsScreen"; // Make sure this path is correct

import { Image, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../config";

const SettingsStack = createStackNavigator();
const windowHeight = Dimensions.get("window").height;

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

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
};

const HomeScreen = () => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false); // To control popup visibility
  const tabBarHeight = useBottomTabBarHeight();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(250));
  const [weeklyRoutineData, setWeeklyRoutineData] =
    useState<RoutineData | null>(null);
  const [routineLoadingError, setRoutineLoadingError] =
    useState<boolean>(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0); // 0 for today, -1 for yesterday, 1 for tomorrow, etc.
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [tasks, setTasks] = useState<any[]>([]); // Tasks for the current day
  const [routines, setRoutines] = useState([
    // Static routines data
    { id: "1", name: "This Week", emoji: "☀️", progress: 0.4 },
    { id: "2", name: "Jatin Routine", emoji: "😎", progress: 0 },
    { id: "3", name: "Fitness", emoji: "💪", progress: 0.7 },
  ]);
  const analysisCategories = [
    {
      id: "1",
      name: "Completion Analytics",
      screen: "CompletionAnalytics",
    },
    {
      id: "2",
      name: "Time Analytics",
      screen: "TimeAnalytics",
    },
    {
      id: "3",
      name: "Activity Frequency",
      screen: "ActivityFrequency",
    },
    {
      id: "4",
      name: "Weekly Patterns",
      screen: "WeeklyPatterns",
    },
    {
      id: "5",
      name: "Time Balance",
      screen: "TimeBalance",
    },
    {
      id: "6",
      name: "Consistency Score",
      screen: "ConsistencyScore",
    },
  ];

  const handleCardPress = (item: any) => {
    setActiveRoutine(item.id);
    navigation.navigate(item.screen);
  };

  const [activeRoutine, setActiveRoutine] = useState("1");
  const navigation = useNavigation<SettingsScreenContentNavigationProp>();
  const [username, setUsername] = useState<string>("");
  const [isOffDay, setIsOffDay] = useState(false);
  const { setIsLoggedIn } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleChooseImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "You need to allow access to your photos."
        );
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!pickerResult.canceled) {
        const newProfilePic = pickerResult.assets[0].uri;
        setProfilePic(newProfilePic);
        // Call the API to upload the profile picture
        await uploadUserPfp(newProfilePic); // Upload the profile picture
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "You need to allow access to your camera."
        );
        return;
      }
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!cameraResult.canceled) {
        const newProfilePic = cameraResult.assets[0].uri;
        setProfilePic(newProfilePic);
        // Call the API to upload the profile picture
        await uploadUserPfp(newProfilePic); // Upload the profile picture
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

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
              () => navigation.navigate("Login");
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
  const handleGenerateRoutine = async () => {
    const savedId = await AsyncStorage.getItem("user_id");
    if (savedId === null) {
      console.log("No user_id found in AsyncStorage");
      return; // or handle accordingly
    }
    setIsOffDay(false);
    const userId = parseInt(savedId, 10);
    const newRoutineData = await generateRoutine(userId);
    if (newRoutineData === undefined) {
      console.log("Failed to generate routine");
      return;
    }
    setWeeklyRoutineData(newRoutineData);
  };

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: 250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const settings = [
    {
      id: "1",
      title: "Home",
      action: toggleSidebar,
      IconFamily: "Icon",
      IconName: "home-outline",
    },
    {
      id: "2",
      title: "View Hobbies",
      action: () => navigation.navigate("UserHobbies"),
      IconFamily: "FontAwesome5",
      IconName: "hospital-symbol",
    },
    {
      id: "3",
      title: "View Tasks",
      action: () => navigation.navigate("UserTasks"),
      IconFamily: "FontAwesome",
      IconName: "tasks",
    },
    {
      id: "4",
      title: "View Saved Routines",
      action: () => console.log("View Saved Routines"), // Replace with actual navigation
      IconFamily: "FontAwesome",
      IconName: "life-saver",
    },
    {
      id: "5",
      title: "View Friends",
      action: () => navigation.navigate("FriendsScreen"),
      IconFamily: "Icon",
      IconName: "people-outline",
    },
    {
      id: "6",
      title: "Update Username",
      action: () => console.log("Update Username"), //  Implement username update logic
      IconFamily: "FontAwesome",
      IconName: "user",
    },
    {
      id: "7",
      title: "Change Password",
      action: () => console.log("Change Password"), // Implement password change logic
      IconFamily: "MaterialIcons",
      IconName: "password",
    },
    {
      id: "8", // Add a new ID
      title: "Generate Routine",
      action: handleGenerateRoutine, // Call the generateRoutine function
      IconFamily: "Ionicons", // Or the appropriate icon family
      IconName: "refresh", // Choose an appropriate icon name
    },
    {
      id: "9",
      title: "Logout",
      action: handleLogout,
      IconFamily: "Icon",
      IconName: "log-out-outline",
    },
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

  const handleOffDayToggle = async () => {
    const savedId = await AsyncStorage.getItem("user_id");
    if (savedId === null) {
      console.log("No user_id found in AsyncStorage");
      return; // or handle accordingly
    }

    const userId = parseInt(savedId, 10);
    try {
      if (!userId) {
        Alert.alert("Error", "User ID not available.");
        return;
      }
      setIsOffDay(!isOffDay);
      if (!isOffDay) {
        const updatedRoutine = await updateRoutine(userId);

        if (updatedRoutine) {
          setWeeklyRoutineData(updatedRoutine);
        }
      }
    } catch (error: any) {
      console.error("Error toggling off-day:", error);
      Alert.alert("Error", error.message || "Failed to toggle off-day.");
      // Optionally reset the toggle switch if the API call fails:
      setIsOffDay(false);
    }
  };

  const Sidebar = () => (
    <Animated.View
      style={[
        styles.sidebar,
        { transform: [{ translateX: sidebarAnimation }] },
      ]}
    >
      <TouchableOpacity
        style={styles.closeSidebarButton}
        onPress={toggleSidebar}
      >
        <Icon name="menu-outline" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.welcomeContainer}>
        <Text style={styles.brandName}>Flexiplan</Text>
      </View>
      <View style={styles.menuItems}>
        {/* <TouchableOpacity onPress={toggleSidebar} style={styles.menuItem}>
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity> */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <View>
              <Image
                source={
                  profilePic
                    ? { uri: profilePic }
                    : require("../../assets/default_user.jpg")
                }
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 3,
                  borderColor: "white",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#FFCC00",
                  borderRadius: 15,
                  padding: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 10,
                }}
                onPress={() => setShowPopup(true)}
              >
                <Ionicons name="camera" size={25} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          {/* <Text style={styles.username}>
          {currentUser
            ? `${currentUser.first_name} ${currentUser.last_name}`
            : "Loading..."}
        </Text> */}
        </View>
        <Modal
          visible={showPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPopup(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            activeOpacity={1}
            onPress={() => setShowPopup(false)}
          >
            <View
              style={{
                backgroundColor: "transparent",
                padding: 20,
                width: "100%",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.popupOption}
                onPress={() => {
                  handleTakePhoto();
                  setShowPopup(false);
                }}
              >
                <Ionicons name="camera" size={30} color="white" />
                <Text style={styles.popupText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupOption}
                onPress={() => {
                  handleChooseImage();
                  setShowPopup(false);
                }}
              >
                <Ionicons name="image" size={30} color="white" />
                <Text style={styles.popupText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <FlatList
          data={settings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.menuItem} onPress={item.action}>
              <View style={{ width: 33, alignItems: "center" }}>
                {item.IconFamily === "FontAwesome" ? (
                  <FontAwesome name={item.IconName} size={24} color="white" />
                ) : item.IconFamily === "FontAwesome5" ? (
                  <FontAwesome5 name={item.IconName} size={24} color="white" />
                ) : item.IconFamily === "MaterialIcons" ? (
                  <MaterialIcons name={item.IconName} size={24} color="white" />
                ) : item.IconFamily === "Ionicons" ? (
                  <Ionicons name={item.IconName} size={24} color="white" />
                ) : item.IconFamily === "Icon" ? (
                  <Icon name={item.IconName} size={24} color="white" />
                ) : null}
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 2,
            backgroundColor: "rgba(197, 110, 50, 0.5)",
          }}
        >
          <Text style={{ fontSize: 24, color: "#e0e0e0", fontWeight: "900" }}>
            Off Day
          </Text>
          <Switch
            value={isOffDay}
            onValueChange={handleOffDayToggle} // simplified callback
            thumbColor={isOffDay ? "#4CAF90" : "#f5f5f5"}
            trackColor={{
              false: "#e0e0e0",
              true: "#A5D6C7",
            }}
            ios_backgroundColor="#e0e0e0" // for iOS
            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
          />
        </View>
      </View>
    </Animated.View>
  );

  useEffect(() => {
    const fetchRoutine = async () => {
      const data = await fetchUserRoutines();
      if (data && data.routine_data) {
        // Check if data and routine_data exist
        setWeeklyRoutineData(data.routine_data);
        setRoutineLoadingError(false); // Reset error state if successful
      } else {
        setWeeklyRoutineData(null); // Explicitly set to null if no data
        setRoutineLoadingError(true); // Set error state
      }
      // if data.error -> alert that user routine not found
    };

    fetchRoutine();
  }, []);

  useEffect(() => {
    if (weeklyRoutineData) {
      const currentDayName =
        daysOfWeek[(new Date().getDay() + currentDayIndex + 7) % 7]; // Ensure positive index
      const dailyTasks = weeklyRoutineData[currentDayName] || [];
      const formattedTasks = dailyTasks.map((task, index) => ({
        id: String(index), // Or generate a more unique ID if needed
        name: task.activity,
        emoji: getEmojiForType(task.type), // Function to determine emoji based on task type
        timeRange: `${task.start_time} - ${task.end_time}`,
        completed: false, // Initially set to false
      }));
      setTasks(formattedTasks);
    }
  }, [weeklyRoutineData, currentDayIndex]);

  const getEmojiForType = (type: string): string => {
    switch (type) {
      case "work":
        return "💼";
      case "personal":
        return "🧘";
      case "hobby":
        return "🎨";
      default:
        return "🗓️";
    }
  };

  const toggleTask = async (id: string, emoji: string) => {
    try {
      // Find the task in the tasks array
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      // Get the current day name based on currentDayIndex
      const currentDayName =
        daysOfWeek[(new Date().getDay() + currentDayIndex + 7) % 7];

      // Determine activity type (default to 'task' if not specified)
      const activityType = task.emoji === "🗓️" ? "task" : "hobby";

      // Call the API to mark the activity as completed/uncompleted
      await markActivityCompleted(
        currentDayName,
        task.name,
        activityType,
        !task.completed // Toggle the completed status
      );

      // Update local state only after successful API call
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      // Optionally show an error message to the user
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const renderRightActions = () => (
    <View style={styles.fullDeleteBackground}>
      <Ionicons name="trash" size={24} color="#fff" />
    </View>
  );

  const changeDay = (direction: number) => {
    const todayDayOfWeek = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysFromMonday = (todayDayOfWeek + 6) % 7; // Days from Monday to today (0 for Monday, 6 for Sunday)
    const daysToSunday = 6 - daysFromMonday; // Days from today to Sunday (0 for Sunday, 6 for Monday)
    const minDayIndex = -daysFromMonday; // Minimum allowed currentDayIndex (for Monday)
    const maxDayIndex = daysToSunday; // Maximum allowed currentDayIndex (for Sunday)
    const newIndex = currentDayIndex + direction;

    if (newIndex >= minDayIndex && newIndex <= maxDayIndex) {
      setCurrentDayIndex(newIndex);
    }
  };

  const getCurrentDayText = () => {
    const today = new Date();
    const displayDate = new Date();
    displayDate.setDate(today.getDate() + currentDayIndex);
    const dayName = daysOfWeek[displayDate.getDay()];
    const date = displayDate.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[displayDate.getMonth()];
    return `${monthName} ${date} • ${dayName}`;
  };

  const getSectionHeading = () => {
    if (currentDayIndex === 0) return "Today's To Do";
    const dayDiff = ["days ago", "day ago", "Today", "Tomorrow", "days later"];
    const indexForDiff = currentDayIndex + 2;
    const dayText =
      dayDiff[indexForDiff] ||
      (currentDayIndex > 0
        ? `${currentDayIndex} days later`
        : `${Math.abs(currentDayIndex)} days ago`);
    return `${
      daysOfWeek[(new Date().getDay() + currentDayIndex + 7) % 7]
    }'s To Do`; // Fallback for other days
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
      <TouchableOpacity style={styles.sidebarToggle} onPress={toggleSidebar}>
        <Icon name="menu-outline" size={30} color="black" />
      </TouchableOpacity>
      {isSidebarVisible && (
        <>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
          <Sidebar />
        </>
      )}

      <ScrollView style={{ flex: 1 }}>
        <View style={{ height: 230 }}>
          <View style={styles.header}>
            <Text style={styles.heading}>Routine Analysis</Text>
          </View>
          <FlatList
            data={analysisCategories}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleCardPress(item)}
              >
                <View
                  style={[
                    styles.routineCard,
                    activeRoutine === item.id && styles.activeRoutineCard,
                  ]}
                >
                  {/* <View style={styles.avatar}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View> */}
                  <Text style={styles.routineName}>{item.name}</Text>
                  {/* <ProgressBar
                    progress={item.progress}
                    color="#76c7c0"
                    style={styles.progressBar}
                  /> */}
                  {/* <Text style={styles.progressText}>
                    {Math.round(item.progress * 100)}% Complete
                  </Text> */}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        {!weeklyRoutineData ? (
          <View style={styles.noRoutineContainer}>
            <Text style={styles.noRoutineText}>No routine found.</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateRoutine}
            >
              <Text style={styles.generateButtonText}>Generate Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View
              style={[
                styles.header,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <TouchableOpacity onPress={() => changeDay(-1)}>
                <Icon name="chevron-back-outline" size={24} color="#76c7c0" />
              </TouchableOpacity>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.heading}>{getSectionHeading()}</Text>
                <Text style={styles.dateText}>{getCurrentDayText()}</Text>
              </View>
              <TouchableOpacity onPress={() => changeDay(1)}>
                <Icon
                  name="chevron-forward-outline"
                  size={24}
                  color="#76c7c0"
                />
              </TouchableOpacity>
            </View>
            {tasks.map((task) => {
              if (!task.completed) {
                return (
                  <Swipeable
                    key={task.id}
                    renderRightActions={renderRightActions}
                    onSwipeableRightOpen={() => removeTask(task.id)}
                  >
                    <View style={styles.taskItem}>
                      <View style={styles.taskAvatar}>
                        <Text style={styles.taskEmoji}>{task.emoji}</Text>
                      </View>
                      <View style={styles.taskDetails}>
                        <Text style={styles.taskName}>{task.name}</Text>
                        <Text style={styles.taskTime}>{task.timeRange}</Text>
                      </View>
                      <Checkbox
                        status={task.completed ? "checked" : "unchecked"}
                        onPress={() => toggleTask(task.id, task.emoji)}
                        color="#76c7c0"
                      />
                    </View>
                  </Swipeable>
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  noRoutineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  noRoutineText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: "#76c7c0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    color: "black",
    fontSize: 24,
  },
  seeAll: {
    fontSize: 14,
    color: "#76c7c0",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  routineCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 4,
  },
  activeRoutineCard: {
    shadowColor: "#76c7c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#76c7c0",
  },
  avatar: {
    backgroundColor: "#eef6f7",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  routineName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
    color: "#888",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  taskAvatar: {
    backgroundColor: "#eef6f7",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskEmoji: {
    fontSize: 20,
  },
  taskDetails: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  taskTime: {
    fontSize: 12,
    color: "#888",
  },
  fullDeleteBackground: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  welcomeContainer: {
    marginTop: 50,
    alignItems: "center",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: "100%",
  },
  closeSidebarButton: {
    position: "absolute",
    left: 10,
    marginTop: 40,
  },
  brandName: {
    color: "#FFC107",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  welcomeText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
    alignSelf: "center",
  },
  menuItems: {
    marginTop: 20,
    height: "80%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  sidebarToggle: {
    marginRight: 10,
    marginTop: 40,
    alignSelf: "flex-end",
  },
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "rgba(197, 110, 50, 1)",
    zIndex: 2,
    paddingHorizontal: 15,
    paddingVertical: 30,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  profileImageWrapper: {
    position: "relative",
    alignItems: "center",
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 250,
    justifyContent: "center",
  },
  popupText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
