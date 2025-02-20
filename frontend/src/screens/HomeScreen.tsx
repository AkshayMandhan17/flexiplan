import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated
} from "react-native";
import { ProgressBar } from "react-native-paper"; // Progress bars
import { Checkbox } from "react-native-paper"; // Checkbox
import { Swipeable } from "react-native-gesture-handler"; // Swipeable for swipe actions
import { Ionicons } from "@expo/vector-icons"; // For delete icon
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(-250)); // Initialize at off-screen position
  
  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: -250, // Adjust to hide position
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnimation, {
        toValue: 0, // Adjust to visible position
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const Sidebar = () => (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }, { height: windowHeight - 55 }]}>
      <TouchableOpacity style={styles.closeSidebarButton} onPress={toggleSidebar}>
        <Icon name="menu-outline" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.welcomeContainer}>
        {/* <Image
          source={profilePic ? { uri: profilePic } : require('../assests/images/idea.png')}
          style={styles.logo}
        /> */}
        <Text style={styles.brandName}>Flexiplan</Text>
        {/* <Text style={styles.welcomeText}>WELCOME, {username}</Text> */}
      </View>
      <View style={styles.menuItems}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuItem}>
          <Icon name="home-outline" size={24} color="white" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person-outline" size={24} color="white" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color="white" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="local-post-office" size={24} color="white" />
          <Text style={styles.menuText}>Community</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="people-outline" size={24} color="white" />
          <Text style={styles.menuText}>Add Friend</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.menuItem}>
          <Icon name="game-controller-outline" size={20} color="white" />
          <Text style={styles.menuText}>Play Game</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.menuItem}>
          <Icon name="analytics-outline" size={24} color="white" />
          <Text style={styles.menuText}>Progress</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.menuItem}>
          <Feather name="map-pin" size={24} color="white" />
          <Text style={styles.menuText}>Google Map</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="log-out-outline" size={24} color="white" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  // Mock data for routines
  const [routines, setRoutines] = useState([
    { id: "1", name: "This Week", emoji: "☀️", progress: 0.4 },
    { id: "2", name: "Jatin Routine", emoji: "😎", progress: 0 },
    { id: "3", name: "Fitness", emoji: "💪", progress: 0.7 },
  ]);

  // State for active routine
  const [activeRoutine, setActiveRoutine] = useState("1"); // Default active routine is "This Week"

  // Mock data for today's tasks
  const [tasks, setTasks] = useState([
    {
      id: "1",
      name: "Drink Water",
      emoji: "💧",
      timeRange: "7:00 - 8:00",
      completed: false,
    },
    {
      id: "2",
      name: "Walking",
      emoji: "🚶‍♂️",
      timeRange: "8:00 - 8:30",
      completed: false,
    },
    {
      id: "3",
      name: "Make Coffee",
      emoji: "☕",
      timeRange: "8:30 - 9:00",
      completed: false,
    },
  ]);

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remove a task from the list
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Render the delete action for Swipeable
  const renderRightActions = () => (
    <View style={styles.fullDeleteBackground}>
      <Ionicons name="trash" size={24} color="#fff" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <TouchableOpacity style={styles.sidebarToggle} onPress={toggleSidebar}>
        <Icon name="menu-outline" size={30} color="black" />
      </TouchableOpacity>
      {isSidebarVisible && <Sidebar />}
      {/* <View style={styles.section}> */}
        <View style={styles.header}>
          <Text style={styles.heading}>Routines</Text>
        </View>
        <FlatList
          data={routines}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={1} onPress={() => setActiveRoutine(item.id)}>
              <View
                style={[
                  styles.routineCard,
                  activeRoutine === item.id && styles.activeRoutineCard,
                ]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.routineName}>{item.name}</Text>
                <ProgressBar
                  progress={item.progress}
                  color="#76c7c0"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(item.progress * 100)}% Complete
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      {/* </View> */}

      {/* Today's To Do Section */}
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.heading}>Today's To Do</Text>
          <Text style={styles.dateText}>Dec 11 • Wednesday</Text>
        </View>
        {tasks.map((task) => (
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
                onPress={() => toggleTask(task.id)}
                color="#76c7c0"
              />
            </View>
          </Swipeable>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    // paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  header: {
    height: 60,
    // backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    color: 'black',
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
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 4,
    margin: 8,
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
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
  },
  closeSidebarButton: {
    position: 'absolute',
    right: 10,
    marginTop: 40,
  },
  brandName: {
    color: '#FFC107', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 10, 
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
    alignSelf: 'center',
  },
  menuItems: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  sidebarToggle: {
    marginLeft: 10,
    marginTop: 60,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "rgba(197, 110, 50, 1)",
    zIndex: 2,
    paddingHorizontal: 15,
    paddingVertical: 30,
    // height: windowHeight, // Use the full screen height
    // borderBottomRightRadius: 20,
    // borderTopRightRadius: 20,
  },
});
