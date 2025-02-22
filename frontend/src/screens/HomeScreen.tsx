import React, { useState, useEffect } from "react";
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
import { ProgressBar } from "react-native-paper";
import { Checkbox } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { Dimensions } from "react-native";
import { RoutineData, UserRoutineResponse } from "../utils/model";
import { fetchUserRoutines } from "../utils/api";

const windowHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(-250));
  const [weeklyRoutineData, setWeeklyRoutineData] = useState<RoutineData | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0); // 0 for today, -1 for yesterday, 1 for tomorrow, etc.
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [tasks, setTasks] = useState<any[]>([]); // Tasks for the current day
  const [routines, setRoutines] = useState([ // Static routines data
    { id: "1", name: "This Week", emoji: "☀️", progress: 0.4 },
    { id: "2", name: "Jatin Routine", emoji: "😎", progress: 0 },
    { id: "3", name: "Fitness", emoji: "💪", progress: 0.7 },
  ]);
  const [activeRoutine, setActiveRoutine] = useState("1");

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: -250,
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

  const Sidebar = () => (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }, { height: windowHeight - 55 }]}>
      <TouchableOpacity style={styles.closeSidebarButton} onPress={toggleSidebar}>
        <Icon name="menu-outline" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.welcomeContainer}>
        <Text style={styles.brandName}>Flexiplan</Text>
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
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="people-outline" size={24} color="white" />
          <Text style={styles.menuText}>Add Friend</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="log-out-outline" size={24} color="white" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const data = await fetchUserRoutines();
        setWeeklyRoutineData(data.routine_data);
      } catch (error) {
        console.error("Failed to fetch routine data", error);
        // Handle error appropriately (e.g., display error message)
      }
    };

    fetchRoutine();
  }, []);

  useEffect(() => {
    if (weeklyRoutineData) {
      const currentDayName = daysOfWeek[(new Date().getDay() + currentDayIndex + 7) % 7]; // Ensure positive index
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
      case "work": return "💼";
      case "personal": return "🧘";
      case "hobby": return "🎨";
      default: return "🗓️";
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[displayDate.getMonth()];
    return `${monthName} ${date} • ${dayName}`;
  };

  const getSectionHeading = () => {
    if (currentDayIndex === 0) return "Today's To Do";
    const dayDiff = ['days ago', 'day ago', 'Today', 'Tomorrow', 'days later'];
    const indexForDiff = currentDayIndex + 2;
    const dayText = dayDiff[indexForDiff] || (currentDayIndex > 0 ? `${currentDayIndex} days later` : `${Math.abs(currentDayIndex)} days ago`);
    return `${daysOfWeek[(new Date().getDay() + currentDayIndex + 7) % 7]}'s To Do`; // Fallback for other days
  };


  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle={"light-content"} />
      <TouchableOpacity style={styles.sidebarToggle} onPress={toggleSidebar}>
        <Icon name="menu-outline" size={30} color="black" />
      </TouchableOpacity>
      {isSidebarVisible && <Sidebar />}
      <View style={{ height: 230, backgroundColor: '#f9f9f9', paddingTop: 20}}>
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
      </View>

      <ScrollView style={{flex: 1, backgroundColor: '#f9f9f9'}}>
        <View style={styles.section}>
          <View style={[styles.header, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
            <TouchableOpacity onPress={() => changeDay(-1)}>
              <Icon name="chevron-back-outline" size={24} color="#76c7c0" />
            </TouchableOpacity>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.heading}>{getSectionHeading()}</Text>
              <Text style={styles.dateText}>{getCurrentDayText()}</Text>
            </View>
            <TouchableOpacity onPress={() => changeDay(1)}>
              <Icon name="chevron-forward-outline" size={24} color="#76c7c0" />
            </TouchableOpacity>
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
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
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
  },
});